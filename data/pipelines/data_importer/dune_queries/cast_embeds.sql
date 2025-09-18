-- query id: 4968426
-- part of a query repo
-- query name: Music Cast Embeds

-- Define parameters
-- @start_time datetime
-- @end_time datetime

WITH spam_users AS (
    SELECT fid
    FROM query_4752413
    WHERE label_value IN (0, 1)
),
music_casts AS (
    SELECT
        c.hash as cast_hash,
        c.embeds,
        c.text as cast_text,
        c.created_at as created_at
    FROM dune.neynar.dataset_farcaster_casts c
    LEFT JOIN spam_users s ON c.fid = s.fid
    WHERE parent_url IN (
        'chain://eip155:7777777/erc721:0xe96c21b136a477a6a97332694f0caae9fbb05634',
        'https://warpcast.com/~/channel/sonata',
        'https://warpcast.com/~/channel/soundscapes'
    )
    AND c.deleted_at IS NULL
    AND s.fid IS NULL
    AND c.created_at >= TIMESTAMP '{{start_time}}'
    AND c.created_at <= TIMESTAMP '{{end_time}}'
    AND (c.embeds IS NOT NULL OR c.text IS NOT NULL)
),
-- Extract structured embeds (existing logic)
structured_embeds AS (
    SELECT
        mc.cast_hash,
        mc.created_at,
        t.embed_index,
        json_extract(mc.embeds, '$[' || CAST(t.embed_index AS VARCHAR) || ']') as embed_data,
        'structured' as source_type
    FROM music_casts mc
    CROSS JOIN UNNEST(
        SEQUENCE(0, json_array_length(mc.embeds) - 1)
    ) AS t(embed_index)
    WHERE mc.embeds IS NOT NULL 
    AND json_array_length(mc.embeds) > 0
),
-- Extract URLs from cast text using regex
text_urls AS (
    SELECT DISTINCT
        mc.cast_hash,
        mc.created_at,
        regexp_extract_all(mc.cast_text, 'https?://[^\s\)]+') as extracted_urls,
        'text' as source_type
    FROM music_casts mc
    WHERE mc.cast_text IS NOT NULL
    AND regexp_like(mc.cast_text, 'https?://[^\s\)]+')
),
-- Flatten text URLs into individual rows
text_urls_flattened AS (
    SELECT 
        cast_hash,
        created_at,
        url_value,
        source_type
    FROM text_urls
    CROSS JOIN UNNEST(extracted_urls) AS t(url_value)
    WHERE url_value IS NOT NULL
),
-- Process structured embeds
processed_structured AS (
    SELECT
        cast_hash,
        created_at,
        embed_index,
        json_extract_scalar(embed_data, '$.url') as embed_url,
        CASE 
            WHEN json_extract_scalar(embed_data, '$.castId.fid') IS NOT NULL THEN
                'cast:' || json_extract_scalar(embed_data, '$.castId.fid')
            ELSE NULL
        END as cast_reference,
        CASE 
            WHEN json_extract_scalar(embed_data, '$.url') LIKE '%imagedelivery.net%' THEN 'image'
            WHEN json_extract_scalar(embed_data, '$.url') LIKE '%stream.farcaster.xyz%' THEN 'video'
            WHEN json_extract_scalar(embed_data, '$.url') IS NOT NULL THEN 'url'
            WHEN json_extract_scalar(embed_data, '$.castId.fid') IS NOT NULL THEN 'cast'
            ELSE 'unknown'
        END as embed_type,
        source_type
    FROM structured_embeds
),
-- Process text URLs
processed_text AS (
    SELECT
        cast_hash,
        created_at,
        NULL as embed_index, -- Will assign later
        url_value as embed_url,
        NULL as cast_reference,
        CASE 
            WHEN url_value LIKE '%spotify.com%' THEN 'url'
            WHEN url_value LIKE '%youtube.com%' OR url_value LIKE '%youtu.be%' THEN 'url'
            WHEN url_value LIKE '%soundcloud.com%' THEN 'url'
            WHEN url_value LIKE '%bandcamp.com%' THEN 'url'
            WHEN url_value LIKE '%apple.com%' THEN 'url'
            WHEN url_value LIKE '%music.apple.com%' THEN 'url'
            WHEN url_value LIKE '%tidal.com%' THEN 'url'
            ELSE 'url' -- Default to url for now
        END as embed_type,
        source_type
    FROM text_urls_flattened
),
-- Combine and deduplicate by URL
all_embeds_combined AS (
    SELECT 
        cast_hash,
        created_at,
        embed_index,
        COALESCE(embed_url, cast_reference) as final_url,
        embed_type,
        source_type
    FROM processed_structured
    WHERE COALESCE(embed_url, cast_reference) IS NOT NULL
    
    UNION
    
    SELECT 
        cast_hash,
        created_at,
        NULL as embed_index,
        embed_url as final_url,
        embed_type,
        source_type
    FROM processed_text
    WHERE embed_url IS NOT NULL
),
-- Deduplicate by cast_hash + final_url, keeping structured embeds first
deduplicated AS (
    SELECT 
        cast_hash,
        created_at,
        final_url,
        embed_type,
        source_type,
        ROW_NUMBER() OVER (
            PARTITION BY cast_hash, final_url 
            ORDER BY 
                CASE WHEN source_type = 'structured' THEN 1 ELSE 2 END,
                embed_index NULLS LAST
        ) as rn
    FROM all_embeds_combined
),
-- Assign sequential embed_index to deduplicated results
final_with_index AS (
    SELECT 
        cast_hash,
        created_at,
        final_url,
        embed_type,
        source_type,
        ROW_NUMBER() OVER (PARTITION BY cast_hash ORDER BY 
            CASE WHEN source_type = 'structured' THEN 1 ELSE 2 END,
            final_url
        ) - 1 as embed_index
    FROM deduplicated
    WHERE rn = 1 -- Keep only first occurrence of each URL per cast
)
SELECT
    '0x' || LOWER(to_hex(cast_hash)) AS cast_hash,
    final_url AS embed_url,
    embed_type,
    embed_index,
    created_at
FROM final_with_index
WHERE embed_type != 'unknown'
ORDER BY cast_hash, embed_index;
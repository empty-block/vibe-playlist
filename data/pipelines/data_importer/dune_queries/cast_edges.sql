-- query id: 4937382
-- part of a query repo
-- query name: Music Casts Edges
-- query link: https://dune.com/queries/4937382

WITH spam_users AS (
    SELECT fid
    FROM query_4752413
    WHERE label_value IN (0, 1)
),
latest_fnames AS (
    SELECT 
        fid,
        fname,
        ROW_NUMBER() OVER (PARTITION BY fid ORDER BY updated_at DESC) as rn
    FROM dune.neynar.dataset_farcaster_fnames
    WHERE deleted_at IS NULL
),
user_profiles AS (
    SELECT 
        p.fid,
        f.fname,  -- Use the most recent fname
        p.display_name,
        p.avatar_url,
        p.bio
    FROM dune.neynar.dataset_farcaster_profile_with_addresses p
    LEFT JOIN latest_fnames f ON p.fid = f.fid AND f.rn = 1  -- Join only with most recent fname
),
base_casts AS (
    SELECT
        c.hash as cast_hash,
        c.fid as author_fid,
        c.created_at as cast_created_at,
        c.text as cast_text,  -- Include the cast text
        c.embeds as cast_embeds,  -- Include embeds data
        c.parent_hash,  -- Add parent_hash for replies
        CASE
            WHEN c.parent_url = 'chain://eip155:7777777/erc721:0xe96c21b136a477a6a97332694f0caae9fbb05634' THEN 'music'
            WHEN c.parent_url = 'https://warpcast.com/~/channel/sonata' THEN 'sonata'
            WHEN c.parent_url = 'https://warpcast.com/~/channel/soundscapes' THEN 'soundscapes'
            ELSE 'music'
        END as cast_channel  -- Extract channel information
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
),
reply_casts AS (
    SELECT
        c.hash as cast_hash,
        c.fid as author_fid,
        c.created_at as cast_created_at,
        c.text as cast_text,
        c.embeds as cast_embeds,
        c.parent_hash,  -- Include parent_hash for linking replies
        c.parent_fid,
        CASE
            WHEN c.root_parent_url = 'chain://eip155:7777777/erc721:0xe96c21b136a477a6a97332694f0caae9fbb05634' THEN 'music'
            WHEN c.root_parent_url = 'https://warpcast.com/~/channel/sonata' THEN 'sonata'
            WHEN c.root_parent_url = 'https://warpcast.com/~/channel/soundscapes' THEN 'soundscapes'
            ELSE 'music'
        END as cast_channel
    FROM dune.neynar.dataset_farcaster_casts c
    LEFT JOIN spam_users s ON c.fid = s.fid
    WHERE root_parent_url IN (
        'chain://eip155:7777777/erc721:0xe96c21b136a477a6a97332694f0caae9fbb05634',
        'https://warpcast.com/~/channel/sonata',
        'https://warpcast.com/~/channel/soundscapes'
    )
    AND c.parent_hash IS NOT NULL  -- Ensure it's a reply
    AND c.parent_url IS NULL  -- Not a channel post
    AND c.deleted_at IS NULL
    AND s.fid IS NULL
    AND c.created_at >= TIMESTAMP '{{start_time}}'
    AND c.created_at <= TIMESTAMP '{{end_time}}'
),
authored_edges AS (
    SELECT 
        CAST(author_fid as VARCHAR) as source_user_id,
        CAST(author_fid as VARCHAR) as target_user_id, -- For AUTHORED, source and target are the same
        '0x' || LOWER(to_hex(cast_hash)) as cast_id,
        'AUTHORED' as edge_type,
        cast_created_at as created_at,
        p.fname as user_fname,
        p.display_name as user_display_name,
        p.avatar_url as user_avatar_url,
        p.bio as user_bio,
        b.cast_text,  -- Include cast text in results
        b.cast_embeds,  -- Include embeds in results
        b.cast_channel  -- Include channel in results
    FROM base_casts b
    LEFT JOIN user_profiles p ON b.author_fid = p.fid
),
reaction_edges AS (
    SELECT
        CAST(r.fid as VARCHAR) as source_user_id,
        CAST(c.author_fid as VARCHAR) as target_user_id,
        '0x' || LOWER(to_hex(r.target_hash)) as cast_id,
        CASE 
            WHEN r.reaction_type = 1 THEN 'LIKED'
            WHEN r.reaction_type = 2 THEN 'RECASTED'
        END as edge_type,
        r.created_at as created_at,
        p.fname as user_fname,
        p.display_name as user_display_name,
        p.avatar_url as user_avatar_url,
        p.bio as user_bio,
        CAST(NULL AS VARCHAR) as cast_text,  -- Explicitly cast NULL
        CAST(NULL AS VARCHAR) as cast_embeds, -- Explicitly cast NULL
        CAST(NULL AS VARCHAR) as cast_channel -- Explicitly cast NULL
    FROM dune.neynar.dataset_farcaster_reactions r
    LEFT JOIN spam_users s ON r.fid = s.fid
    LEFT JOIN user_profiles p ON r.fid = p.fid
    JOIN base_casts c ON r.target_hash = c.cast_hash
    WHERE r.deleted_at IS NULL
    AND s.fid IS NULL
    AND r.created_at >= TIMESTAMP '{{start_time}}'
    AND r.created_at <= TIMESTAMP '{{end_time}}'
),
reply_edges AS (
    SELECT 
        CAST(r.author_fid as VARCHAR) as source_user_id,
        CAST(r.parent_fid as VARCHAR) as target_user_id, -- The author of the cast being replied to
        '0x' || LOWER(to_hex(r.cast_hash)) as cast_id,
        'REPLIED' as edge_type,
        r.cast_created_at as created_at,
        p.fname as user_fname,
        p.display_name as user_display_name,
        p.avatar_url as user_avatar_url,
        p.bio as user_bio,
        r.cast_text,
        r.cast_embeds,
        r.cast_channel
    FROM reply_casts r
    LEFT JOIN user_profiles p ON r.author_fid = p.fid
),
all_edges AS (
    SELECT * FROM authored_edges
    UNION ALL
    SELECT * FROM reaction_edges
    UNION ALL
    SELECT * FROM reply_edges
)
SELECT *
FROM all_edges
ORDER BY created_at DESC;

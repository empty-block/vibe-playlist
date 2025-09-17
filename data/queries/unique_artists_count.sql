WITH unique_mentions AS (
  SELECT artist, author_fid, COUNT(artist)
  FROM public.music_library 
  GROUP BY 1, 2
  ORDER BY 1 ASC
),
unique_artists_count AS (
  SELECT artist, COUNT(artist) as artist_count
  FROM unique_mentions
  GROUP BY artist
)
SELECT *
FROM unique_artists_count
ORDER BY artist_count DESC


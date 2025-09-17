WITH unique_mentions AS (
  SELECT title, artist, author_fid, COUNT(title)
  FROM public.music_library 
  GROUP BY 1, 2, 3
  ORDER BY 1 ASC
),
unique_songs_count AS (
  SELECT title, artist, COUNT(title) as song_count
  FROM unique_mentions
  GROUP BY title, artist
)
SELECT *
FROM unique_songs_count
ORDER BY song_count DESC


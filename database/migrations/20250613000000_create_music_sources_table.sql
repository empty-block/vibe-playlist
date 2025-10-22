-- Create music_sources table for filtering music platform URLs
-- This table stores domains of known music platforms to filter URLs before metadata extraction

CREATE TABLE public.music_sources (
  domain TEXT PRIMARY KEY,
  platform_name TEXT NOT NULL, -- extraction function key (e.g. 'spotify', 'youtube_music')
  display_name TEXT NOT NULL,  -- human-readable name (e.g. 'Spotify', 'YouTube Music')
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create indexes for common query patterns
CREATE INDEX idx_music_sources_platform_name ON public.music_sources(platform_name);
CREATE INDEX idx_music_sources_display_name ON public.music_sources(display_name);
CREATE INDEX idx_music_sources_is_active ON public.music_sources(is_active);

-- Add table comment
COMMENT ON TABLE public.music_sources IS 'Known music platform domains for filtering URLs before metadata extraction';

-- Insert essential music platform domains
INSERT INTO public.music_sources (domain, platform_name, display_name) VALUES
-- Core Streaming Platforms
('spotify.com', 'spotify', 'Spotify'),
('open.spotify.com', 'spotify', 'Spotify'),
('music.apple.com', 'apple_music', 'Apple Music'),
('itunes.apple.com', 'apple_music', 'Apple Music'),
('youtube.com', 'youtube', 'YouTube'),
('youtu.be', 'youtube', 'YouTube'),
('music.youtube.com', 'youtube_music', 'YouTube Music'),
('soundcloud.com', 'soundcloud', 'SoundCloud'),
('on.soundcloud.com', 'soundcloud', 'SoundCloud'),

-- Decentralized Music Platform
('audius.co', 'audius', 'Audius'),

-- Essential Aggregators
('album.link', 'songlink', 'Album.link'),
('song.link', 'songlink', 'Song.link'),

-- Music Discovery
('hypem.com', 'hypem', 'Hype Machine'),

-- Music Store
('beatport.com', 'beatport', 'Beatport');

-- Set permissions
GRANT ALL PRIVILEGES ON TABLE public.music_sources TO postgres, anon, authenticated, service_role; 
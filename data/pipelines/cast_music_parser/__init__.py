"""
Cast Music Parser Module

This module processes Farcaster casts from the "No Skip Albums" thread
and extracts structured music information using Claude API.

Main flows:
- process_no_skip_albums_music: Complete end-to-end processing
- import_no_skip_albums_data_only: Import data from Dune only
- process_existing_casts_only: Process existing unprocessed casts

Usage:
    from data.pipelines.cast_music_parser.flow import process_no_skip_albums_music
    await process_no_skip_albums_music()
"""

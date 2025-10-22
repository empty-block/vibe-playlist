"""
Dune API utilities for cast music parser
"""

import polars as pl
import os
import sys
from dotenv import load_dotenv

from data.pipelines.data_importer.lib.dune import batch_fetch_dune

load_dotenv()

def fetch_no_skip_albums_data() -> pl.DataFrame:
    """Fetch No Skip Albums thread data from Dune"""
    try:
        df = batch_fetch_dune(
            query_id="5165097",  # no_skip_albums_thread query
            api_key=os.environ.get("DUNE_API_KEY")
        )
        
        if not isinstance(df, pl.DataFrame) or df.is_empty():
            print("No data returned from Dune query")
            return pl.DataFrame()
            
        print(f"Fetched {df.shape[0]} casts from No Skip Albums thread")
        return df
        
    except Exception as e:
        print(f"Error fetching No Skip Albums data: {str(e)}")
        return pl.DataFrame()

def prepare_cast_data_for_insert(df: pl.DataFrame) -> pl.DataFrame:
    """Prepare cast DataFrame for database insertion"""
    try:
        if df.is_empty():
            return df
        
        print(f"Starting with {df.shape[0]} records")
        
        # Deduplicate by node_id within the current batch
        original_count = df.shape[0]
        df = df.unique(subset=['node_id'], keep='first')
        dedup_count = df.shape[0]
        
        if dedup_count < original_count:
            print(f"Removed {original_count - dedup_count} duplicate node_ids within batch")
        
        # Check for null cast_text but don't filter - replace with empty string
        null_text_count = df.filter(pl.col('cast_text').is_null()).shape[0]
        if null_text_count > 0:
            print(f"Found {null_text_count} records with null cast_text - will replace with empty string")
        
        # Debug: Print first few rows to see the raw data format
        print("Raw data sample:")
        print(df.select(['cast_created_at']).head(3))
        print("cast_created_at dtype:", df['cast_created_at'].dtype)
        
        # The data is already a string, just need to truncate milliseconds
        # Format: "2025-05-19 22:03:21.527" -> "2025-05-19 22:03:21"
        df = df.with_columns([
            pl.col('cast_created_at').str.slice(0, 19).alias('cast_created_at')
        ])
        
        # Fix data types and clean problematic fields
        df = df.with_columns([
            # Convert author_fid from float to integer
            pl.col('author_fid').cast(pl.Int64).alias('author_fid'),
            
            # Replace null cast_text with empty string (preserve records with embeds)
            pl.when(pl.col('cast_text').is_null())
              .then(pl.lit(""))
              .otherwise(pl.col('cast_text').str.replace_all(r'[^\x00-\x7F]', ' '))
              .alias('cast_text'),
            
            # Clean up embeds - if it's a malformed JSON string, set to null
            pl.when(pl.col('embeds').is_null() | (pl.col('embeds') == ""))
              .then(None)
              .otherwise(pl.col('embeds'))
              .alias('embeds'),
            
            # Clean other text fields
            pl.col('author_bio').str.replace_all(r'[^\x00-\x7F]', ' ').alias('author_bio') if 'author_bio' in df.columns else pl.lit('').alias('author_bio'),
            pl.col('author_display_name').str.replace_all(r'[^\x00-\x7F]', ' ').alias('author_display_name') if 'author_display_name' in df.columns else pl.lit('').alias('author_display_name'),
        ])
        
        print("After conversion:")
        print(df.select(['cast_created_at', 'author_fid', 'cast_text']).head(3))
        
        # Ensure all required columns are present with proper types
        required_columns = {
            'node_id': str,
            'cast_text': str, 
            'cast_created_at': str,  # Already transformed to string
            'author_fid': int,
            'cast_channel': str
        }
        
        # Validate and cast columns
        for col, dtype in required_columns.items():
            if col not in df.columns:
                print(f"Warning: Missing required column {col}")
                if col == 'cast_channel':
                    df = df.with_columns(pl.lit('no_skip_albums').alias(col))
                else:
                    raise ValueError(f"Required column {col} missing from data")
        
        print(f"Prepared {df.shape[0]} cast records for insertion")
        return df
        
    except Exception as e:
        print(f"Error preparing cast data: {str(e)}")
        return pl.DataFrame() 
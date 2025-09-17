from prefect import task
import polars as pl
from typing import List
import re
from datetime import datetime, timezone

def clean_text_data(text):
    """Clean text data to remove or replace problematic characters"""
    if not text or not isinstance(text, str):
        return ""
    
    # Replace common problematic characters
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # Remove non-ASCII chars
    text = text.replace('\x00', '').strip()     # Remove null bytes
    return text

def ensure_valid_timestamps(df: pl.DataFrame, timestamp_cols: List[str]) -> pl.DataFrame:
    """
    Ensure all timestamp columns have valid values for database insertion
    
    Args:
        df: Polars dataframe to process
        timestamp_cols: List of column names containing timestamps
    
    Returns:
        Dataframe with validated timestamps
    """
    if df.is_empty() or not timestamp_cols:
        return df
    
    # Create current timestamp to use as default
    current_time = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    
    for col in timestamp_cols:
        if col in df.columns:
            # Simply replace empty strings and nulls with current time,
            # but preserve all other original timestamp values
            df = df.with_columns([
                pl.when(
                    (pl.col(col) == "") | pl.col(col).is_null()
                ).then(
                    pl.lit(current_time)
                ).otherwise(
                    # Keep the original timestamp, just standardize format
                    pl.col(col)
                      .str.replace('T', ' ')
                      .str.replace('Z', '')
                      .str.slice(0, 19)  # Take just yyyy-mm-dd hh:mm:ss portion
                ).alias(col)
            ])
            
            # Print a sample of the timestamps to verify
            print(f"Sample timestamps after processing {col}:", flush=True)
            sample_df = df.select(['node_id', col]) if 'node_id' in df.columns else df.select([col])
            print(sample_df.head(5), flush=True)
    
    return df

def polars_clean_text(df: pl.DataFrame, columns: list[str]) -> pl.DataFrame:
    """
    Clean text data in specified columns using string operations
    
    Args:
        df: Polars dataframe to clean
        columns: List of column names to clean
    
    Returns:
        Cleaned dataframe
    """
    if df.is_empty():
        return df
    
    # Apply the cleaning function to each specified column using string operations
    for col in columns:
        if col in df.columns:
            # Use string operations instead of map_elements to avoid shape issues
            df = df.with_columns(
                pl.col(col)
                .fill_null("")  # Replace nulls with empty strings
                .str.replace_all(r'[^\x00-\x7F]+', ' ')  # Replace non-ASCII chars with spaces
                .str.replace_all('\x00', '')  # Remove null bytes
                .str.strip_chars()  # Strip whitespace
                .alias(col)
            )
    
    return df


@task(name="Normalize Cast IDs", log_prints=True)
def normalize_cast_ids(df: pl.DataFrame, id_column: str = 'cast_id') -> pl.DataFrame:
    """
    Normalize cast IDs to ensure consistent format (lowercase with 0x prefix)
    
    Args:
        df: DataFrame containing cast IDs
        id_column: Name of the column containing cast IDs
    
    Returns:
        DataFrame with normalized cast IDs
    """
    def normalize_id(cast_id):
        """Normalize ID to ensure consistent format"""
        if not cast_id:
            return cast_id
        
        # Convert to lowercase
        cast_id = cast_id.lower()
        
        # Ensure 0x prefix for hexadecimal blockchain IDs
        if not cast_id.startswith('0x') and cast_id.isalnum():
            cast_id = '0x' + cast_id
            
        return cast_id
    
    # Apply normalization to the specified column
    print(f"Normalizing {id_column} values to ensure consistent format")
    return df.with_columns(
        pl.col(id_column).map_elements(normalize_id).alias(id_column)
    )

@task(name="Format Timestamps", log_prints=True)
def format_timestamps(df: pl.DataFrame, timestamp_columns: list) -> pl.DataFrame:
    """
    Format timestamp columns to ensure they're compatible with the database
    
    Args:
        df: DataFrame containing timestamp columns
        timestamp_columns: List of column names containing timestamps
    
    Returns:
        DataFrame with properly formatted timestamps
    """
    from datetime import datetime, timezone
    
    if df.is_empty() or not timestamp_columns:
        return df
    
    print(f"Formatting timestamps in columns: {timestamp_columns}")
    
    # Create current timestamp to use as default
    current_time = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    
    for col in timestamp_columns:
        if col in df.columns:
            # Handle null, empty, and format issues
            df = df.with_columns([
                pl.when(
                    (pl.col(col).is_null()) | (pl.col(col) == "")
                ).then(
                    pl.lit(current_time)
                ).otherwise(
                    # Simple string manipulation to standardize format
                    pl.col(col)
                      .str.slice(0, 19)  # Take just the first 19 chars (YYYY-MM-DD HH:MM:SS)
                      .map_elements(
                          lambda x: x.replace('T', ' ').replace('Z', '') if isinstance(x, str) else current_time, 
                          return_dtype=pl.Utf8
                      )
                ).alias(col)
            ])
    
    return df

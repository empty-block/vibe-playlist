from prefect import task
import polars as pl
from data.lib.db import batch_insert
from datetime import datetime, timezone
from data.pipelines.data_importer.lib.data_cleaning import (
    polars_clean_text,
    ensure_valid_timestamps,
    normalize_cast_ids,
    format_timestamps
)


@task(name="Insert User Nodes", log_prints=True, retries=1)
async def insert_user_nodes(df: pl.DataFrame, batch_size: int = 5000) -> pl.DataFrame:
    """Insert user node data from Dune, ensuring all required columns exist"""
    if df.is_empty():
        print("No user data to insert", flush=True)
        return df
    
    # Check for required columns
    required_cols = ['node_id']
    missing_cols = [col for col in required_cols if col not in df.columns]
    
    if missing_cols:
        print(f"Missing required columns: {missing_cols}", flush=True)
        for col in missing_cols:
            df = df.with_columns(pl.lit(None).alias(col))
    
    # Ensure optional columns exist (for target users that might only have node_id)
    optional_cols = ['fname', 'display_name', 'avatar_url']
    for col in optional_cols:
        if col not in df.columns:
            print(f"Adding missing optional column: {col}", flush=True)
            df = df.with_columns(pl.lit("").alias(col))
    
    # Ensure node_id is processed as string (not Int64)
    if 'node_id' in df.columns:
        df = df.with_columns(pl.col('node_id').cast(pl.Utf8))
    
    # Deduplicate rows by node_id before insertion
    if 'node_id' in df.columns:
        orig_count = df.shape[0]
        df = df.unique(subset=['node_id'])
        dedup_count = df.shape[0]
        if orig_count != dedup_count:
            print(f"Removed {orig_count - dedup_count} duplicate node_id values", flush=True)
    
    # Fill null values with empty strings
    df = df.fill_null("")
    
    print(f"Sample data for insertion: {df.head(2)}", flush=True)
    
    # Use the correct schema and table format
    return await batch_insert(df, table_name='user_nodes', batch_size=batch_size)

@task(name="Insert Cast Nodes", log_prints=True, retries=1)
async def insert_cast_nodes(df: pl.DataFrame, batch_size: int = 10000) -> pl.DataFrame:
    """Insert cast node data from Dune, ensuring all required columns exist"""
    if df.is_empty():
        print("No cast data to insert", flush=True)
        return df
    
    # Check for required columns
    required_cols = ['node_id', 'cast_text', 'created_at', 'author_fid']
    missing_cols = [col for col in required_cols if col not in df.columns]
    
    if missing_cols:
        print(f"Missing required columns: {missing_cols}", flush=True)
        for col in missing_cols:
            df = df.with_columns(pl.lit(None).alias(col))
    
    # Ensure valid timestamps
    timestamp_cols = ['created_at']
    print(f"Validating timestamps in columns: {timestamp_cols}", flush=True)
    df = ensure_valid_timestamps(df, timestamp_cols)
    
    # Ensure node_id and author_fid are processed as string
    if 'node_id' in df.columns:
        df = df.with_columns(pl.col('node_id').cast(pl.Utf8))
    if 'author_fid' in df.columns:
        df = df.with_columns(pl.col('author_fid').cast(pl.Utf8))
    
    # Deduplicate rows by node_id before insertion
    if 'node_id' in df.columns:
        orig_count = df.shape[0]
        df = df.unique(subset=['node_id'])
        dedup_count = df.shape[0]
        if orig_count != dedup_count:
            print(f"Removed {orig_count - dedup_count} duplicate cast node_id values", flush=True)
    
    # Clean text data in relevant columns
    text_columns = ['cast_text']
    df = polars_clean_text(df, text_columns)
    
    # Fill null values with empty strings EXCEPT for timestamps
    # Create a list of columns that aren't timestamps
    non_timestamp_cols = [col for col in df.columns if col not in timestamp_cols]
    if non_timestamp_cols:
        df = df.with_columns([
            pl.when(pl.col(col).is_null()).then(pl.lit("")).otherwise(pl.col(col)).alias(col)
            for col in non_timestamp_cols
        ])
    
    # Final sanity check on timestamp column
    if 'created_at' in df.columns:
        # Print sample of timestamps to verify they're valid
        print("Sample of timestamps for insertion:", flush=True)
        print(df.select(['node_id', 'created_at']).head(5), flush=True)
    
    print(f"Sample cast data for insertion: {df.head(2)}", flush=True)
    
    # Track missing authors for domain-specific error reporting
    try:
        print(f"Attempting to insert {df.shape[0]} casts", flush=True)
        result = await batch_insert(df, table_name='cast_nodes', batch_size=batch_size)
        print(f"Successfully inserted casts", flush=True)
        return result
    except Exception as e:
        error_str = str(e).lower()
        # Only track foreign key violations related to author_fid
        if 'foreign key constraint' in error_str and 'author_fid' in error_str:
            print("Analyzing foreign key failures to identify missing author nodes...", flush=True)
            missing_authors = set()
            
            # Extract missing author IDs from the error data
            for row in df.iter_rows(named=True):
                author_id = row.get('author_fid', '')
                if author_id and 'unknown' not in author_id.lower():
                    missing_authors.add(author_id)
            
            # Print summary of missing authors
            if missing_authors:
                print(f"\n===== MISSING USER NODES SUMMARY =====", flush=True)
                print(f"Found {len(missing_authors)} unique missing author IDs:", flush=True)
                for author_id in sorted(missing_authors):
                    print(f"  - {author_id}", flush=True)
                print(f"==========================================\n", flush=True)
        elif 'timestamp' in error_str:
            print(f"Timestamp error encountered: {error_str[:100]}", flush=True)
            # Try a more targeted timestamp handling approach
            if df.shape[0] > 0:
                print("Checking for problematic timestamp entries...", flush=True)
                
                # Log problematic values rather than replacing all timestamps
                problematic_rows = df.filter(
                    ~pl.col('created_at').str.contains(r'^\d{4}-\d{2}-\d{2}')
                )
                
                if problematic_rows.shape[0] > 0:
                    print(f"Found {problematic_rows.shape[0]} rows with invalid timestamp format")
                    print(f"Sample of problematic timestamps: {problematic_rows.select(['node_id', 'created_at']).head(5)}")
                    
                    # Only replace the problematic timestamps
                    current_time = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
                    df = df.with_columns([
                        pl.when(
                            ~pl.col('created_at').str.contains(r'^\d{4}-\d{2}-\d{2}')
                        ).then(
                            pl.lit(current_time)
                        ).otherwise(
                            pl.col('created_at')
                        ).alias('created_at')
                    ])
                
                try:
                    print("Retrying with fixed timestamps...", flush=True)
                    result = await batch_insert(df, table_name='cast_nodes', batch_size=batch_size)
                    return result
                except Exception as e2:
                    print(f"Still failed after timestamp fixes: {str(e2)}", flush=True)
        
        # Re-raise the exception after logging
        raise

@task(name="Insert Edges", log_prints=True, retries=1)
async def insert_edges(df: pl.DataFrame, batch_size: int = 10000) -> pl.DataFrame:
    """Insert edge data from Dune, ensuring all required columns exist"""
    if df.is_empty():
        print("No edge data to insert", flush=True)
        return df
    
    # Check for required columns
    required_cols = ['source_user_id', 'target_user_id', 'cast_id', 'edge_type', 'created_at']
    missing_cols = [col for col in required_cols if col not in df.columns]
    
    if missing_cols:
        print(f"Missing required columns: {missing_cols}", flush=True)
        for col in missing_cols:
            df = df.with_columns(pl.lit(None).alias(col))
    
    # Ensure valid timestamps
    timestamp_cols = ['created_at']
    print(f"Validating timestamps in columns: {timestamp_cols}", flush=True)
    
    if timestamp_cols:
        non_null_df = df.filter(~pl.col(timestamp_cols[0]).is_null())
        if not non_null_df.is_empty():
            print(f"Sample timestamps after processing {timestamp_cols[0]}:", flush=True)
            print(non_null_df.select(timestamp_cols).head(5), flush=True)
    
    # Remove duplicates before insertion
    original_count = df.shape[0]
    df = df.unique(subset=['source_user_id', 'target_user_id', 'cast_id', 'edge_type'], keep='first')
    deduped_count = df.shape[0]
    
    if deduped_count < original_count:
        print(f"Removed {original_count - deduped_count} duplicate edge values", flush=True)
    
    # Prepare the final columns for insertion
    print(f"Final column list for insertion: {df.columns}", flush=True)
    
    print(f"Sample edge data for insertion: {df.head(2)}", flush=True)
    print(f"Attempting batch insert of {df.shape[0]} edges", flush=True)
    
    # Convert to records format that batch_insert can use (list of dicts)
    records = df.to_dicts()
    
    # Insert edges directly without pandas conversion
    return await batch_insert(pl.DataFrame(records), table_name='cast_edges', batch_size=batch_size)

@task(name="Insert Embeds", log_prints=True, retries=1)
async def insert_embeds(df: pl.DataFrame, batch_size: int = 10000) -> pl.DataFrame:
    """Insert cast embed data from Dune"""
    if df.is_empty():
        print("No embed data to insert", flush=True)
        return df
    
    # Check for required columns - updated to match new schema
    required_cols = ['cast_id', 'embed_url', 'embed_type', 'embed_index']
    missing_cols = [col for col in required_cols if col not in df.columns]
    
    if missing_cols:
        print(f"Missing required columns: {missing_cols}", flush=True)
        for col in missing_cols:
            df = df.with_columns(pl.lit(None).alias(col))
    
    # Clean text columns
    text_columns = ['embed_url', 'embed_type']
    present_text_cols = [col for col in text_columns if col in df.columns]
    if present_text_cols:
        print(f"Cleaning text data for columns: {present_text_cols}", flush=True)
        df = polars_clean_text(df, present_text_cols)
    
    # Handle timestamp columns if present
    timestamp_cols = [col for col in df.columns if 'time' in col.lower() or 'date' in col.lower() or 'created' in col.lower()]
    if timestamp_cols:
        print(f"Validating timestamps in columns: {timestamp_cols}", flush=True)
        df = ensure_valid_timestamps(df, timestamp_cols)
    
    # Deduplicate rows by combination of cast_id and embed_index - updated field name
    if all(col in df.columns for col in ['cast_id', 'embed_index']):
        orig_count = df.shape[0]
        df = df.unique(subset=['cast_id', 'embed_index'])
        dedup_count = df.shape[0]
        if orig_count != dedup_count:
            print(f"Removed {orig_count - dedup_count} duplicate embed values", flush=True)
    
    # Fill null values with empty strings except for timestamps
    non_timestamp_cols = [col for col in df.columns if col not in timestamp_cols] if timestamp_cols else df.columns
    if non_timestamp_cols:
        df = df.with_columns([
            pl.when(pl.col(col).is_null()).then(pl.lit("")).otherwise(pl.col(col)).alias(col)
            for col in non_timestamp_cols
        ])
    
    # Print sample data for debugging
    print(f"Sample embed data for insertion: {df.head(2)}", flush=True)
    
    # Use the correct schema and table format
    try:
        print(f"Attempting to insert {df.shape[0]} embeds", flush=True)
        result = await batch_insert(df, table_name='embeds', batch_size=batch_size)
        print(f"Successfully inserted embeds", flush=True)
        return result
    except Exception as e:
        error_str = str(e).lower()
        print(f"Error during embed insertion: {str(e)}", flush=True)
        
        if 'timestamp' in error_str and timestamp_cols:
            print("Timestamp error encountered, attempting fallback", flush=True)
            # Force all timestamps to valid format
            current_time = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            for col in timestamp_cols:
                df = df.with_columns([pl.lit(current_time).alias(col)])
            
            try:
                print("Retrying with standardized timestamps", flush=True)
                result = await batch_insert(df, table_name='embeds', batch_size=batch_size)
                return result
            except Exception as e2:
                print(f"Fallback failed: {str(e2)}", flush=True)
                
        # Re-raise the exception
        raise


from typing import List, Optional
import asyncio
import logging
from supabase import create_client, Client
from prefect import task
from dotenv import load_dotenv
import os 
import polars as pl

# Load environment variables from .env file
load_dotenv()

########################################################
## INITIALIZE CLIENT
########################################################

# Determine environment 
is_local_env = os.environ.get("SUPABASE_ENV", "").lower() == "local"

if is_local_env:
    # Local development environment
    url = os.environ.get("SUPABASE_LOCAL_URL", "http://127.0.0.1:54321")
    key = os.environ.get("SUPABASE_LOCAL_SERVICE_ROLE", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU")
    print("Connecting to local Supabase instance")
else:
    # Production environment
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    print("Connecting to production Supabase instance")
    
# Initialize the Supabase client
sb: Client = create_client(url, key)

DB_BATCH_SIZE = 1000

    
########################################################
## INSERT DATA
########################################################


@task(name="Batch Insert", log_prints=True, retries=1)
async def batch_insert(
    df: pl.DataFrame,
    table_name: str,
    batch_size: Optional[int] = DB_BATCH_SIZE
) -> pl.DataFrame:
    """Insert dataframe into database in batches"""
    try:
        records = df.to_dicts()
        print(f"Starting insert of {len(records)} records", flush=True)
        
        # Debug duplicates
        keys = [(r.get('contract_address'), r.get('blockchain')) for r in records]
        if len(keys) != len(set(keys)):
            print("Found duplicates in input data!", flush=True)
            
        total_processed = 0
        # Single batch since < 1000 rows
        if await insert_individual_batches(records, table_name=table_name, batch_size=batch_size):
            total_processed += len(records)
        
        print(f"Total rows stored in DB: {total_processed}", flush=True)
        return df
        
    except Exception as e:
        print(f"Error during batch insert: {str(e)}", flush=True)
        raise


@task(retries=3, retry_delay_seconds=lambda x: 2 ** x)
async def insert_individual_batches(data: List[dict], table_name: str, batch_size: int = 1000) -> bool:
    """Insert data in batches, skipping records that fail foreign key checks"""
    try:
        print(f"Attempting to insert {len(data)} records into {table_name}...", flush=True)
        
        # Show the first record for debugging
        if data and len(data) > 0:
            print(f"Sample record: {data[0]}", flush=True)
        
        # Table names that need special handling for "ON CONFLICT" issues
        special_tables = ['user_nodes', 'cast_nodes', 'cast_edges', 'embeds']
        
        # Extract actual table name without quotes for logging
        clean_table_name = table_name.replace('"', '')
        
        # Always use the public schema table names
        base_table_name = table_name
        if '.' in table_name:
            _, table = table_name.split('.')
            base_table_name = table
            print(f"Using table '{base_table_name}' in public schema instead of {table_name}", flush=True)
        
        print(f"Using base table name: '{base_table_name}' for Supabase API calls", flush=True)
        
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            try:
                print(f"Executing batch insert for {clean_table_name}, records {i}-{i+len(batch)}", flush=True)
                
                # Special handling for certain tables to avoid duplicate PK conflicts in a batch
                if base_table_name in special_tables:
                    # Process in much smaller batches for conflict-prone tables
                    small_batch_size = 20  # Reduced batch size for more granular error handling
                    successful_count = 0
                    
                    for j in range(0, len(batch), small_batch_size):
                        small_batch = batch[j:j + small_batch_size]
                        try:
                            response = sb.table(base_table_name).upsert(small_batch).execute()
                            print(f"Response for small batch: {response}", flush=True)
                            successful_count += len(small_batch)
                        except Exception as e:
                            error_str = str(e)
                            print(f"Error in small batch: {error_str}", flush=True)
                            if '23503' in error_str or '21000' in error_str or 'APIError' in error_str:  # FK violation or conflict error or APIError
                                # Try inserting one by one for problem batches
                                print(f"Falling back to single-record inserts for records {i+j}-{i+j+len(small_batch)}", flush=True)
                                for record in small_batch:
                                    try:
                                        single_response = sb.table(base_table_name).upsert([record]).execute()
                                        print(f"Single record response: {single_response}", flush=True)
                                        successful_count += 1
                                    except Exception as single_e:
                                        error_msg = str(single_e)
                                        print(f"Error on single record: {type(single_e).__name__}: {error_msg}", flush=True)
                                        # Log additional details for debugging
                                        if 'APIError' in error_msg:
                                            print(f"APIError details for record: {record}", flush=True)
                            else:
                                raise
                            
                    print(f"Successfully inserted {successful_count} of {len(batch)} records", flush=True)
                else:
                    # Normal batch processing for other tables
                    result = sb.table(base_table_name).upsert(batch).execute()
                    print(f"Batch {i}-{i+len(batch)} inserted, response: {result}", flush=True)
            except Exception as e:
                error_type = type(e).__name__
                error_msg = str(e)
                print(f"Error during batch {i}-{i+len(batch)}: {error_type}: {error_msg}", flush=True)
                
                if 'APIError' in error_type:
                    print(f"APIError encountered, will try smaller batches or single records", flush=True)
                    # Try to process in smaller batches
                    tiny_batch_size = 10
                    for k in range(0, len(batch), tiny_batch_size):
                        try:
                            tiny_batch = batch[k:k + tiny_batch_size]
                            tiny_result = sb.table(base_table_name).upsert(tiny_batch).execute()
                            print(f"Tiny batch {i+k}-{i+k+len(tiny_batch)} inserted, response: {tiny_result}", flush=True)
                        except Exception as tiny_e:
                            print(f"Error on tiny batch: {type(tiny_e).__name__}: {str(tiny_e)}", flush=True)
                
                elif '23503' in error_msg:  # Foreign key violation
                    logging.warning(f"Foreign key violation during batch insert: {e}")
                elif '42501' in error_msg:  # Permission denied
                    logging.error(f"Permission denied for table {table_name}: {e}")
                    print(f"Current database user lacks permissions for {table_name}", flush=True)
                elif '21000' in error_msg:  # Conflicts error
                    logging.warning(f"ON CONFLICT error: {e}")
                    print(f"Try one-by-one insertion or remove duplicates before sending", flush=True)
                elif '23502' in error_msg:  # Not null constraint violation
                    logging.warning(f"Not null constraint violation: {e}")
                    print(f"Check if your data contains null values for required fields", flush=True)
                else:
                    raise
                
            await asyncio.sleep(0.1)
        return True
        
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        logging.error(f"Error inserting to {table_name}: {error_type}: {error_msg}")
        print(f"Exception details: {error_type}: {error_msg}", flush=True)
        raise
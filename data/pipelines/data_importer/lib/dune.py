from prefect import task
from dotenv import load_dotenv
import polars as pl
import spice

# Load environment variables from .env file
load_dotenv()


@task(retries=1, retry_delay_seconds=lambda x: 2 ** x)
def batch_fetch_dune(query_id: str, params: dict = None, api_key: str = None) -> pl.DataFrame:
    """Fetch data from Dune using a query and optional parameters."""
    try:
        df = spice.query(query_id, parameters=params, api_key=api_key)
        
        if not isinstance(df, pl.DataFrame):
            raise ValueError("Query did not return a Polars DataFrame")
        
        return df
    except Exception as e:
        print(f"Error fetching data from Dune: {str(e)}")
        return pl.DataFrame()
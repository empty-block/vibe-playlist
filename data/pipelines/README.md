# Jamzy Dune Pipeline

This pipeline imports Farcaster data from Dune Analytics into the Jamzy graph database.

## Data Model

The pipeline follows this data model:

### Node Types

#### User Nodes
Core profile data:
- `node_id`: FID (primary key)
- `fname`: Farcaster username
- `display_name`: Display name
- `avatar_url`: Profile picture

#### Cast Nodes
Core data:
- `node_id`: Cast hash (primary key)
- `cast_text`: Original cast text
- `cast_created_at`: Timestamp
- `author_fid`: Author's FID
- `cast_channel`: Cast's channel url

### Edges
- `from_id`: Source node ID
- `to_id`: Target node ID
- `edge_type`: AUTHORED | LIKED | RECASTED
- `created_at`: Timestamp

### Cast Embeds
Metadata for embedded content:
- `cast_hash`: Reference to cast node
- `embed_url`: Original embed URL
- `embed_type`: spotify | youtube | other
- `embed_index`: Position in cast
- Optional music metadata (artist, track_title, etc.)

## Usage

### Import All Data

```python
import asyncio
from app.dune.jamzy import jamzy_graph_import

# Import with default parameters (last 7 days)
asyncio.run(jamzy_graph_import(insert_into_db=True))

# Import with custom date range
asyncio.run(jamzy_graph_import(
    start_time="2023-01-01", 
    end_time="2023-01-31",
    insert_into_db=True
))
```

### Import Specific Components

```python
import asyncio
from app.dune.jamzy.flow import (
    fetch_user_nodes, 
    fetch_cast_nodes, 
    fetch_edges, 
    fetch_cast_embeds
)

# Import only user nodes
asyncio.run(fetch_user_nodes(
    start_time="2023-01-01",
    end_time="2023-01-31",
    insert_into_db=True
))
```

## Required Dune Queries

Before using this pipeline, you need to set up the following Dune queries and update their IDs in the flow.py file:

1. User Nodes Query - Replace ID in fetch_user_nodes()
2. Cast Nodes Query - Replace ID in fetch_cast_nodes()
3. Edges Query - Replace ID in fetch_edges()
4. Cast Embeds Query - Replace ID in fetch_cast_embeds()

## Running the Pipeline

Ensure you have the DUNE_API_KEY environment variable set:

```bash
export DUNE_API_KEY=your_dune_api_key
```

Then run the pipeline:

```bash
cd pipelines
python -m app.dune.jamzy.flow
``` 
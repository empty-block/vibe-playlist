from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import List, Optional, Union, Dict, Any
from pydantic import BaseModel, field_validator, ConfigDict, Field

class UserNode(BaseModel):
    node_id: int  # FID (primary key)
    fname: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

class CastNode(BaseModel):
    node_id: str  # Cast hash (primary key)
    cast_text: str
    cast_created_at: str
    author_fid: int
    cast_channel: Optional[str] = None

class EdgeType(str, Enum):
    AUTHORED = "AUTHORED"
    LIKED = "LIKED"
    RECASTED = "RECASTED"

class Edge(BaseModel):
    from_id: Union[int, str]  # Source node ID (can be FID or cast hash)
    to_id: Union[int, str]  # Target node ID (can be FID or cast hash)
    edge_type: EdgeType
    created_at: str

class CastEmbed(BaseModel):
    cast_id: str  # Reference to cast node (updated from cast_hash)
    embed_url: str
    embed_type: str  # spotify | youtube | other
    embed_index: int
    artist: Optional[str] = None
    track_title: Optional[str] = None
    album: Optional[str] = None
    duration: Optional[int] = None
    platform_id: Optional[str] = None 
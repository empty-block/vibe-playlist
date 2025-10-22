from pydantic import BaseModel
from typing import Dict, List, Set, Optional
from datetime import datetime
from enum import Enum, auto

class UserNode(BaseModel):
    """Represents a user in the graph"""
    id: str
    fname: Optional[str] = None
    display_name: Optional[str] = None
    created_at: Optional[datetime] = None

class CastNode(BaseModel):
    """Represents a cast (post) in the graph"""
    id: str
    author_id: str
    created_at: datetime
    text: Optional[str] = None
    has_embed: bool = False
    embed_type: Optional[str] = None

class InteractionEdge(BaseModel):
    """Represents an interaction between users and casts"""
    user_id: str
    cast_id: str
    type: str  # 'like', 'recast', 'reply'
    created_at: datetime
    weight: float = 1.0

class GraphMetrics(BaseModel):
    """Basic metrics about a graph"""
    total_users: int
    total_casts: int
    total_interactions: int
    avg_user_degree: float
    avg_cast_degree: float

class UserMetrics(BaseModel):
    """Metrics for a user node"""
    pagerank: float
    in_degree: int  # interactions received
    out_degree: int  # interactions given
    engagement_velocity: Optional[float] = None  # interactions per time unit

class CastMetrics(BaseModel):
    """Metrics for a cast node"""
    interaction_count: int
    engagement_velocity: float  # interactions per hour
    author_pagerank: float  # pagerank of the author

class GraphAnalysis(BaseModel):
    """Results from analyzing a graph"""
    metrics: GraphMetrics
    user_metrics: Dict[str, UserMetrics]
    cast_metrics: Dict[str, CastMetrics]
    trending_users: Optional[List[str]] = None
    trending_casts: Optional[List[str]] = None

class NodeType(str, Enum):
    """Types of nodes in the graph"""
    USER = "USER"
    CAST = "CAST"

class EdgeType(str, Enum):
    """Types of edges in the graph"""
    AUTHOR = "AUTHOR"  # User authored a cast
    LIKED = "LIKED"    # User liked a cast
    RECASTED = "RECASTED"  # User recasted a cast
    REPLIED = "REPLIED"  # User replied to a cast
    MENTIONED = "MENTIONED"  # User mentioned another user
    FOLLOWS = "FOLLOWS"  # User follows another user
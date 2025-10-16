-- Migration: Fix interaction_edges target_id for cast-to-cast relationships
--
-- Problem: target_id foreign key referenced user_nodes, but REPLIED edges need
-- to reference cast_nodes (parent cast being replied to).
--
-- Solution: Make target_id polymorphic by removing the foreign key constraint.
-- Application code will ensure referential integrity.

-- Drop the foreign key constraint that limited target_id to user_nodes
ALTER TABLE interaction_edges
DROP CONSTRAINT IF EXISTS interaction_edges_target_id_fkey;

-- Add comments documenting the polymorphic nature of target_id
COMMENT ON COLUMN interaction_edges.target_id IS
'Polymorphic reference: NULL for AUTHORED/LIKED/RECASTED, cast_hash for REPLIED. No FK constraint to allow flexibility.';

COMMENT ON TABLE interaction_edges IS
'Graph edges representing user interactions with casts. Edge semantics by type:
- AUTHORED: source=author_fid, cast=authored_cast, target=NULL
- LIKED: source=liker_fid, cast=liked_cast, target=NULL
- RECASTED: source=recaster_fid, cast=recasted_cast, target=NULL
- REPLIED: source=replier_fid, cast=reply_cast, target=parent_cast_hash';

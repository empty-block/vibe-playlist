#!/bin/bash
export $(cat ../.env | grep SUPABASE_SERVICE_ROLE_KEY | xargs)
echo "$SUPABASE_SERVICE_ROLE_KEY" | wrangler secret put SUPABASE_KEY

#!/bin/bash
set -e

echo "📝 Setting Cloudflare Worker secrets from .env file..."

# Source the .env file from parent directory
if [ -f "../.env" ]; then
  export $(cat ../.env | grep -v '^#' | xargs)
else
  echo "❌ Error: .env file not found in parent directory"
  exit 1
fi

# Set each secret
echo "Setting SUPABASE_URL..."
echo "$SUPABASE_URL" | wrangler secret put SUPABASE_URL

echo "Setting SUPABASE_SERVICE_ROLE_KEY..."
echo "$SUPABASE_SERVICE_ROLE_KEY" | wrangler secret put SUPABASE_SERVICE_ROLE_KEY

echo "Setting NEYNAR_API_KEY..."
echo "$NEYNAR_API_KEY" | wrangler secret put NEYNAR_API_KEY

echo "Setting ANTHROPIC_API_KEY..."
echo "$ANTHROPIC_API_KEY" | wrangler secret put ANTHROPIC_API_KEY

echo "✅ All secrets set successfully!"

#!/bin/bash
# Deploy backend Worker to Cloudflare
# Usage: ./deploy-backend.sh

set -e

echo "🚀 Deploying jamzy-backend Worker..."
cd backend
wrangler deploy

echo ""
echo "✅ Backend deployed successfully!"
echo "🌍 URL: https://jamzy-backend.ncmaddrey.workers.dev"
echo ""
echo "Test with:"
echo "  curl https://jamzy-backend.ncmaddrey.workers.dev/api/health"

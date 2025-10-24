#!/bin/bash
# Build and deploy mini-app to Cloudflare Pages
# Usage: ./deploy-miniapp.sh

set -e

echo "🏗️  Building mini-app with production API URL..."
cd mini-app
VITE_API_URL=https://jamzy-backend.ncmaddrey.workers.dev bun --bun vite build

echo ""
echo "🚀 Deploying to Cloudflare Pages..."
cd ..
wrangler pages deploy mini-app/dist --project-name=jamzy-miniapp --commit-dirty=true

echo ""
echo "✅ Mini-app deployed successfully!"
echo "🌍 Deployment URL will be shown above"
echo ""
echo "Note: Production URL (jamzy-miniapp.pages.dev) requires promoting deployment via Cloudflare Dashboard"

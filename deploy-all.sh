#!/bin/bash
# Deploy both backend and mini-app to Cloudflare
# Usage: ./deploy-all.sh

set -e

echo "🚀 Deploying Jamzy to Cloudflare..."
echo ""

# Deploy backend
echo "================================================"
echo "1️⃣  BACKEND WORKER"
echo "================================================"
./deploy-backend.sh

echo ""
echo "================================================"
echo "2️⃣  MINI-APP FRONTEND"
echo "================================================"
./deploy-miniapp.sh

echo ""
echo "================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "🔗 Backend:  https://jamzy-backend.ncmaddrey.workers.dev"
echo "🔗 Mini-App: Check deployment URL above"
echo ""

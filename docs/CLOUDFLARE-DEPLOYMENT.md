# Cloudflare Deployment Guide

Complete guide for deploying Jamzy to Cloudflare infrastructure.

## Architecture Overview

### Deployments
- **jamzy-backend** - Cloudflare Worker
  - All API endpoints (`/api/*`)
  - AI processing via Cron Trigger (every 1 minute)
  - Connects to Supabase database

- **jamzy-miniapp** - Cloudflare Pages
  - SolidJS frontend
  - Served from global CDN
  - Points to jamzy-backend Worker API

### Local Development (Unchanged)
Local development continues to work exactly as before:
```bash
bun run dev:miniapp    # Mini-app + backend with AI worker
bun run dev:server     # Backend only
```

The code automatically detects the environment and uses:
- **Local**: `setInterval` for AI worker (30 second intervals)
- **Production**: Cloudflare Cron Triggers (1 minute intervals)

## Prerequisites

1. **Cloudflare Account** with Wrangler CLI authenticated
2. **Environment Variables** ready (see below)
3. **Bun** installed for building

## Step 1: Deploy Backend Worker

### 1.1 Set Environment Secrets

Use Wrangler CLI to set secrets (these are encrypted and not in wrangler.toml):

```bash
cd backend

# Set each secret
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put NEYNAR_API_KEY
wrangler secret put ANTHROPIC_API_KEY
```

> **Note**: Use `SUPABASE_SERVICE_ROLE_KEY` not the anon key for backend services.

### 1.2 Deploy Worker

```bash
cd backend
wrangler deploy
```

This will:
- Deploy the Hono API server
- Set up the Cron Trigger for AI processing
- Return your Worker URL (e.g., `https://jamzy-backend.workers.dev`)

**Save this URL** - you'll need it for the mini-app deployment.

### 1.3 Verify Backend Deployment

Test the health endpoint:
```bash
curl https://jamzy-backend.workers.dev/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-10-24T...",
  "service": "jamzy-backend-api"
}
```

## Step 2: Deploy Mini-App to Pages

### 2.1 Build with Production API URL

Set the Worker URL from Step 1.2:

```bash
cd mini-app
VITE_API_URL=https://jamzy-backend.workers.dev bun run build
```

This creates an optimized production build in `mini-app/dist/`.

### 2.2 Deploy to Cloudflare Pages

```bash
cd mini-app
wrangler pages deploy dist --project-name=jamzy-miniapp
```

On first deployment, this will:
- Create the `jamzy-miniapp` Pages project
- Upload the built files
- Return your Pages URL (e.g., `https://jamzy-miniapp.pages.dev`)

### 2.3 Set Production Environment Variable (Optional)

For future builds via Cloudflare's CI/CD:

```bash
wrangler pages project create jamzy-miniapp
wrangler pages secret put VITE_API_URL --project-name=jamzy-miniapp
# Enter: https://jamzy-backend.workers.dev
```

## Step 3: Verify Deployment

### Backend API Tests
```bash
# Health check
curl https://jamzy-backend.workers.dev/api/health

# Queue status
curl https://jamzy-backend.workers.dev/api/music-ai/status

# Channels
curl https://jamzy-backend.workers.dev/api/channels
```

### Mini-App Test
Visit your Pages URL: `https://jamzy-miniapp.pages.dev`

### Cron Trigger Verification
Check Cloudflare Dashboard → Workers → jamzy-backend → Logs

You should see logs every 1 minute:
```
[Cron] AI Worker triggered at: 2024-10-24T...
[Cron] Batch complete: X successful, Y failed, Z total processed
```

## Configuration Files

### backend/wrangler.toml
```toml
name = "jamzy-backend"
main = "server.ts"
compatibility_date = "2024-10-24"
compatibility_flags = ["nodejs_compat"]

[triggers]
crons = ["*/1 * * * *"]  # Every 1 minute

[vars]
AI_WORKER_BATCH_SIZE = "20"
NODE_ENV = "production"
```

### mini-app/wrangler.toml
```toml
name = "jamzy-miniapp"
compatibility_date = "2024-10-24"
pages_build_output_dir = "dist"
```

## Environment Variables Summary

### Backend Worker (Secrets)
| Variable | Description | How to Set |
|----------|-------------|------------|
| `SUPABASE_URL` | Supabase project URL | `wrangler secret put` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (not anon) | `wrangler secret put` |
| `NEYNAR_API_KEY` | Farcaster data API key | `wrangler secret put` |
| `ANTHROPIC_API_KEY` | Claude API for AI processing | `wrangler secret put` |

### Backend Worker (Vars)
| Variable | Description | Set in wrangler.toml |
|----------|-------------|---------------------|
| `AI_WORKER_BATCH_SIZE` | Tracks per batch (default: 20) | `[vars]` section |
| `NODE_ENV` | Environment name | `production` |

### Mini-App Pages (Build Time)
| Variable | Description | How to Set |
|----------|-------------|------------|
| `VITE_API_URL` | Backend Worker URL | Build command env var |

## Adding More Cron Jobs

The architecture supports multiple scheduled jobs in the same Worker:

### 1. Add Cron Schedule to wrangler.toml
```toml
[triggers]
crons = [
  "*/1 * * * *",     # AI processing - every minute
  "0 */6 * * *",     # Farcaster sync - every 6 hours
  "0 0 * * *"        # Daily cleanup - midnight
]
```

### 2. Update Scheduled Handler in server.ts
```typescript
async scheduled(event: any, env: any, ctx: any) {
  const cron = event.cron

  if (cron === "*/1 * * * *") {
    // AI processing
    await processBatch({ batchSize: 20 })
  } else if (cron === "0 */6 * * *") {
    // Farcaster sync
    await syncFarcasterData()
  } else if (cron === "0 0 * * *") {
    // Daily cleanup
    await cleanupOldRecords()
  }
}
```

## Updating Deployments

We've created convenient deployment scripts in the project root:

### Quick Deploy (Recommended)

```bash
# Deploy backend only
./deploy-backend.sh

# Deploy mini-app only
./deploy-miniapp.sh

# Deploy both at once
./deploy-all.sh
```

### Manual Deploy Commands

**Update Backend:**
```bash
cd backend
wrangler deploy
```
Changes take effect immediately. No downtime.

**Update Mini-App:**
```bash
cd mini-app
VITE_API_URL=https://jamzy-backend.ncmaddrey.workers.dev bun --bun vite build
cd ..
wrangler pages deploy mini-app/dist --project-name=jamzy-miniapp --commit-dirty=true
```

### Deployment URLs

After deploying, you'll get a unique deployment URL like:
- `https://[hash].jamzy-miniapp.pages.dev` (specific deployment)
- `https://[branch].jamzy-miniapp.pages.dev` (branch alias)

To promote a deployment to production (`jamzy-miniapp.pages.dev`):
1. Go to Cloudflare Dashboard → Pages → jamzy-miniapp
2. Find the deployment you want to promote
3. Click "..." → "Promote to production"

## Monitoring & Debugging

### View Logs
```bash
# Real-time backend logs
wrangler tail

# Real-time logs for specific Worker
wrangler tail jamzy-backend

# Pages deployment logs
wrangler pages deployment list --project-name=jamzy-miniapp
```

### Cloudflare Dashboard
- **Workers**: `https://dash.cloudflare.com/workers`
  - View cron trigger execution history
  - Monitor request volume and errors
  - Check CPU time usage

- **Pages**: `https://dash.cloudflare.com/pages`
  - View deployment history
  - Check build logs
  - Monitor bandwidth usage

### Common Issues

#### Backend API not responding
1. Check Worker logs: `wrangler tail jamzy-backend`
2. Verify secrets are set: Cloudflare Dashboard → Workers → jamzy-backend → Settings → Variables
3. Test health endpoint: `curl https://jamzy-backend.workers.dev/api/health`

#### Mini-app can't connect to backend
1. Check browser console for CORS errors
2. Verify `VITE_API_URL` was set during build
3. Check `mini-app/dist/assets/*.js` for hardcoded API URL

#### Cron trigger not running
1. Check Cloudflare Dashboard → Workers → jamzy-backend → Triggers
2. Verify cron syntax in `wrangler.toml`
3. Check logs for any errors during scheduled execution

## Cost Estimates

### Current Usage
- **Workers**: $5/month (includes 10M requests + unlimited cron triggers)
- **Pages**: Free tier (likely sufficient for current traffic)
- **Total**: ~$5/month

### What's Included
- Workers: 10M requests/month + unlimited cron + 30s CPU time per request
- Pages: Unlimited requests + 500 builds/month + 20k files + 25 MB per site

## Rolling Back

### Backend Rollback
```bash
# List recent deployments
wrangler deployments list

# Rollback to previous deployment
wrangler rollback [DEPLOYMENT_ID]
```

### Mini-App Rollback
Via Cloudflare Dashboard → Pages → jamzy-miniapp → Deployments → "Rollback to this deployment"

## Custom Domains (Future)

### Backend Worker Domain
```bash
wrangler domains add api.jamzy.app
```

Update mini-app builds to use: `VITE_API_URL=https://api.jamzy.app`

### Pages Custom Domain
Cloudflare Dashboard → Pages → jamzy-miniapp → Custom domains → Add domain

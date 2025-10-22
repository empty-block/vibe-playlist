# Jamzy Supabase Database

This directory contains migration files and configurations for our Supabase database.

## Database Schema

The database uses PostgreSQL schemas to organize tables:

- `jamzy` - Contains all social graph data (users, casts, embeds, edges)

## Local Development

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- Docker installed and running

### Starting Local Supabase

Start the local Supabase instance:

```bash
supabase start
```

This will create a local development environment with:
- PostgreSQL database at `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- API at `http://127.0.0.1:54321`
- Studio UI at `http://127.0.0.1:54323`

### Running Migrations

Apply all migrations to your local database:

```bash
supabase db reset
```

### Creating New Migrations

When you need to make schema changes:

```bash
supabase migration new your_migration_name
```

This creates a new timestamped SQL file in `supabase/migrations/`. Edit the file to add your schema changes, then apply using `supabase db reset`.

## Deployment to Production

### Linking to Production

First time only, link to your remote project:

```bash
supabase link --project-ref your-project-ref
```

### Pushing Migrations

To apply your migrations to the cloud Supabase instance:

```bash
supabase db push
```

## Python Connection Example

```python
from supabase import create_client

# Choose between local or production
is_local = True  # Set to False for production

if is_local:
    url = "http://127.0.0.1:54321"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
else:
    url = "https://your-project-id.supabase.co"
    key = "your-anon-key-from-supabase-dashboard"

# Initialize the client
supabase = create_client(url, key)

# Example query
users = supabase.from_("jamzy.user_nodes").select("*").limit(10).execute()
```

## Common Operations

### Table Access in Queries

When accessing tables, always include the schema name:

```python
# Correct
supabase.from_("jamzy.user_nodes").select("*")

# Incorrect
supabase.from_("user_nodes").select("*")
```

### Working with Relations

Query with nested relations:

```python
# Get casts with their embeds
casts_with_embeds = supabase.from_("jamzy.cast_nodes").select(
    "*,embeds(*)"
).execute()
```

## Troubleshooting

If you encounter issues:

1. Check if your local Supabase is running: `supabase status`
2. Restart local Supabase: `supabase stop` then `supabase start`
3. View logs: `supabase logs` 

## Local Development Credentials

When you start Supabase locally, you'll see the following credentials:

```
         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
   S3 Access Key: 625729a08b95bf1b7ff351a663f3a23c
   S3 Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
       S3 Region: local
```

These values are fixed for local development environments. 
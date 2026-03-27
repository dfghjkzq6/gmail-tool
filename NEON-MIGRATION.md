# Neon Database Migration Guide

This guide shows how to migrate your Gmail Tool from the current setup to Neon PostgreSQL for Vercel deployment.

## Migration Steps

### 1. Create Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string (DATABASE_URL)

### 2. Update Environment Variables

Create or update your `.env.local` file:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Add your Neon DATABASE_URL:
```env
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

### 3. Initialize Database

Start your development server and initialize the database:

```bash
npm run dev
# In another terminal:
curl -X POST http://localhost:3000/api/init-db
```

### 4. Test the Migration

Visit the debug endpoint to verify:
```bash
curl http://localhost:3000/api/debug
```

### 5. Deploy to Vercel

1. Push your changes to Git
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET` 
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Vercel app URL)
   - `DATABASE_URL` (from Neon)

## What Changed

### Database Layer
- **Before**: No persistent storage (session-only)
- **After**: Neon PostgreSQL with user persistence

### New Files
- `lib/db.js` - Database connection and operations
- `app/api/init-db/route.js` - Database initialization endpoint

### Updated Files
- `app/api/auth/[...nextauth]/route.js` - Now stores users in Neon
- `app/api/debug/route.js` - Shows database connection status
- `package.json` - Added @neondatabase/serverless dependency

### Database Schema
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Benefits

1. **Persistence**: User data survives server restarts
2. **Scalability**: Neon handles concurrent users
3. **Vercel Ready**: Works seamlessly with Vercel deployment
4. **Security**: Tokens stored securely in database
5. **Performance**: Fast queries with proper indexing

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if Neon project is active
- Ensure SSL mode is set to `require`

### Migration Issues
- Run `curl -X POST http://localhost:3000/api/init-db` to initialize schema
- Check `/api/debug` endpoint for connection status

### Token Storage Issues
- Tokens are automatically stored when users sign in
- Check database for user records after authentication

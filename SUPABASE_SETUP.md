# 🗄️ Supabase Setup Guide for Subnet Studio

## Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in or create an account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - **Name**: `subnet-studio`
     - **Database Password**: Generate a strong password
     - **Region**: Choose closest to you
   - Click "Create new project"

3. **Wait for Setup**
   - Project creation takes 2-3 minutes
   - You'll see "Project is ready" when complete

## Step 2: Get Project Credentials

1. **Go to Project Settings**
   - In your project dashboard, click "Settings" (gear icon)
   - Click "API" in the sidebar

2. **Copy Credentials**
   - **Project URL**: Copy the "Project URL"
   - **Anon Key**: Copy the "anon public" key
   - **Service Role Key**: Copy the "service_role" key (keep this secret!)

## Step 3: Run Database Schema

1. **Go to SQL Editor**
   - In your project dashboard, click "SQL Editor"
   - Click "New query"

2. **Run the Schema**
   - Copy the entire content from `SUPABASE_SCHEMA.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

3. **Verify Tables Created**
   - Go to "Table Editor" in the sidebar
   - You should see all tables created:
     - `user_profiles`
     - `subnet_configs`
     - `validators`
     - `deployments`
     - `subnet_templates`
     - `template_usage`
     - `monitoring_metrics`
     - `activity_logs`
     - `user_settings`

## Step 4: Configure Environment Variables

### Backend Configuration
```bash
# Edit backend/.env
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Frontend Configuration
```bash
# Edit frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 5: Test Database Connection

1. **Restart Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test Health Check**
   ```bash
   curl http://localhost:3001/health/database
   ```
   Should return: `{"status":"healthy","database":{"connected":true}}`

## Step 6: Enable Authentication (Optional)

1. **Go to Authentication Settings**
   - In Supabase dashboard, click "Authentication"
   - Click "Settings"

2. **Configure Auth Providers**
   - Enable "Email" provider
   - Configure "Site URL": `http://localhost:3000`
   - Add redirect URLs: `http://localhost:3000/auth/callback`

## Step 7: Set up Row Level Security (RLS)

The schema already includes RLS policies, but verify they're enabled:

1. **Check RLS Status**
   - Go to "Table Editor"
   - Click on any table
   - Verify "RLS" is enabled (toggle should be ON)

2. **Test Policies**
   - The schema includes policies for user data isolation
   - Users can only access their own data

## Troubleshooting

### Common Issues

1. **"Database not configured"**
   - Check environment variables are set correctly
   - Restart the backend server

2. **"Table doesn't exist"**
   - Run the schema again in SQL Editor
   - Check for any SQL errors

3. **"Permission denied"**
   - Verify RLS policies are correct
   - Check service role key is being used in backend

### Verification Commands

```bash
# Test database connection
curl http://localhost:3001/health/database

# Test template endpoints
curl http://localhost:3001/templates

# Test deployment endpoints
curl http://localhost:3001/deploy
```

## Next Steps

After Supabase is configured:

1. **Test Template Features**
   - Save subnet configurations as templates
   - Browse public templates
   - Load templates into builder

2. **Test Deployment Tracking**
   - Deploy subnets (with Avalanche CLI)
   - View deployment history
   - Monitor deployment status

3. **Test Monitoring**
   - Store monitoring metrics
   - View historical data
   - Track validator status

Your Supabase setup is complete! 🎉

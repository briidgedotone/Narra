# 🔧 Environment Setup Guide

This guide walks you through setting up all the necessary environment variables for Use Narra.

## 📁 Create Your Environment File

Create a `.env.local` file in your project root with the following variables:

```bash
# ======================
# USE NARRA - ENVIRONMENT VARIABLES
# ======================

# ------------------
# CLERK AUTHENTICATION
# ------------------
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URLs (customize these or use defaults)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ------------------
# SUPABASE DATABASE
# ------------------
# Get these from: Supabase Dashboard → Settings → Database → Connection String → URI
DATABASE_URL=postgresql://postgres.your_ref:[YOUR_PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres

# Get these from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your_project_ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Alternative direct database connection (if needed)
SUPABASE_DB_HOST=db.your_project_ref.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_database_password

# ------------------
# EXTERNAL APIS (Future Use)
# ------------------
# ScrapeCreators API
SCRAPECREATORS_API_KEY=your_scrapecreators_api_key_here

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Loops Email Marketing
LOOPS_API_KEY=your_loops_api_key_here

# ------------------
# REDIS CACHE (Future Use)
# ------------------
REDIS_URL=redis://localhost:6379

# ------------------
# APPLICATION SETTINGS
# ------------------
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ------------------
# ADMIN SETTINGS
# ------------------
# Comma-separated list of admin email addresses
ADMIN_EMAILS=admin@usenarra.com,you@yourdomain.com
```

## 🗄️ Setting Up Supabase Database

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click "New Project"
4. Name: `use-narra-production` (or similar)
5. Set a strong database password **and save it securely**
6. Choose a region close to your users
7. Click "Create new project"

### Step 2: Get Connection Details

#### Database URL

1. Go to **Settings → Database**
2. Scroll to **Connection String**
3. Copy the **URI** format
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. Use this as your `DATABASE_URL`

#### API Keys

1. Go to **Settings → API**
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Create Database Tables

Run the SQL schema from `database/schema.sql` in your Supabase SQL Editor:

1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste the entire schema from `database/schema.sql`
3. Click **Run** to create all tables

## 🔐 Setting Up Clerk Authentication

### Step 1: Get Clerk Keys

1. Go to your Clerk dashboard
2. Navigate to **API Keys**
3. Copy **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Copy **Secret key** → `CLERK_SECRET_KEY`

### Step 2: Configure URLs

Your Clerk URLs should be:

- Sign In URL: `/sign-in`
- Sign Up URL: `/sign-up`
- After Sign In: `/dashboard`
- After Sign Up: `/dashboard`

## ✅ Verification Steps

1. **Check Authentication**: Visit `/test-auth` to verify Clerk integration
2. **Check Database**: Visit `/test-sync` to verify database connection
3. **Check Dashboard**: Visit `/dashboard` to verify the full flow

## 🚨 Important Notes

- **Never commit your `.env.local` file** - it contains sensitive keys
- **Use different databases** for development and production
- **Rotate your keys regularly** for security
- **Test thoroughly** after any environment changes

## 🆘 Troubleshooting

### Common Issues:

1. **Database connection fails**: Check your DATABASE_URL format and password
2. **Auth redirects broken**: Verify your Clerk URL configuration
3. **API calls fail**: Ensure all keys are copied correctly without extra spaces

### Getting Help:

- Check the Supabase and Clerk documentation
- Review the project's development logs
- Test individual components using the test pages

# Quick Start Guide

Get your user management system running in 5 minutes!

## Step 1: Set Up Database (2 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Open your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `database-schema.sql`
6. Paste into the SQL editor
7. Click **Run**

✅ Your profiles table is now created with all security policies!

## Step 2: Test the App (1 minute)

1. Start your app (if not already running):
   ```bash
   npm start
   ```

2. Go to http://localhost:3000/register

3. Register a new user:
   - Username: `testuser`
   - Email: `testuser@example.com`
   - Password: `test123456`
   - Confirm Password: `test123456`

4. Click **Register**

✅ User created! Profile automatically created in database!

## Step 3: Create an Admin (2 minutes)

### Method 1: Using Supabase Dashboard

1. Go to your Supabase project
2. Click **Table Editor** in the left sidebar
3. Click the **profiles** table
4. Find your user (email: `testuser@example.com`)
5. Click the **role** cell and change it from `user` to `admin`
6. Press Enter to save

### Method 2: Using SQL

1. Go to **SQL Editor**
2. Run this query:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'testuser@example.com';
   ```
3. Click **Run**

✅ Your user is now an admin!

## Step 4: Test Admin Features

1. Go back to your app
2. Logout and login with your admin user
3. You should now see a **Users** tab in your dashboard
4. Click **Users**
5. You should see all registered users in a table

✅ Admin features are working!

## What You Have Now

- ✅ Secure user authentication
- ✅ Username, email, and role storage
- ✅ Password security (handled by Supabase Auth)
- ✅ Admin and User roles
- ✅ Admin user management dashboard
- ✅ All security policies active

## Need Help?

See `SETUP_GUIDE.md` for detailed documentation and troubleshooting.


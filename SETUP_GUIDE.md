# User Management Setup Guide

This guide will help you set up the user profiles table with username and role support in your To-Do app.

## Overview

Your app now has:
- **User profiles table** that stores username, email, and role
- **Admin and User roles** for different permission levels
- **Admin dashboard** to manage users
- **Automatic profile creation** during registration

## Important Notes

### Password Storage
**Passwords are stored in Supabase Auth** (not in your custom table). This is the secure and recommended approach. The `profiles` table stores additional user information like username and role.

### Email and Gmail
- Users register with an **email address** (can be Gmail or any email)
- Email is stored in **both** Supabase Auth and the profiles table
- Email from `auth.users` is the source of truth

## Database Setup

### Step 1: Run the SQL Schema

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database-schema.sql`
4. Click **Run** to execute the SQL

### Step 2: Verify the Table

After running the SQL, you should see:
- `profiles` table created
- RLS (Row Level Security) enabled
- Policies for user and admin access
- Trigger for automatic profile creation

### Step 3: Create Your First Admin

To create an admin user:

1. **Option A: Using the app**
   - Register a new user normally
   - Go to Supabase dashboard → Table Editor → profiles
   - Find your user and change `role` from `'user'` to `'admin'`

2. **Option B: Direct SQL**
   ```sql
   -- First, register the user in your app, then run:
   UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
   ```

## Testing

1. **Register a User**
   - Go to `/register`
   - Fill in: Username, Email, Password
   - Login

2. **Register an Admin**
   - Register another user
   - Manually change role to 'admin' in Supabase
   - Login as admin
   - You should see a "Users" tab in the dashboard

3. **Test Admin Features**
   - Click the "Users" tab
   - View all users
   - Edit user roles
   - Delete users

## Database Structure

### profiles Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | References auth.users(id) |
| `username` | VARCHAR(50) | Unique username |
| `email` | TEXT | User email |
| `role` | VARCHAR(20) | 'admin' or 'user' |
| `created_at` | TIMESTAMP | When profile was created |
| `updated_at` | TIMESTAMP | Last update time |

### Security (RLS Policies)

- Users can **view** their own profile
- Users can **update** their own profile
- Admins can **view all** profiles
- Admins can **update all** profiles
- Profiles are automatically linked to auth.users via trigger

## Troubleshooting

### Registration creates duplicate profiles
- The trigger and manual insert both run
- The trigger now checks if profile exists first
- This is safe - no duplicates will be created

### Can't see "Users" tab
- Check your role in Supabase: `SELECT * FROM profiles WHERE id = auth.uid()`
- Ensure role is exactly `'admin'` (lowercase)
- Refresh the page after changing role

### Can't delete users
- Ensure RLS policy allows DELETE
- You may need to add a DELETE policy:
  ```sql
  CREATE POLICY "Admins can delete users"
    ON profiles FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  ```

### Profile not created on registration
- Check browser console for errors
- Verify profiles table exists
- Check RLS policies allow insert
- Verify trigger is created

## Next Steps

- Add more fields to profiles (bio, avatar, etc.)
- Implement user profile editing page
- Add email verification
- Add password reset functionality
- Implement activity logs for admins


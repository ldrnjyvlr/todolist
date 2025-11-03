# Notification System Setup Guide

This guide explains how to set up the task notification system that alerts users when tasks are due in 1 hour.

## 🚨 Quick Start: Push Notifications on Your Phone

**Having trouble with notifications on your phone while they work on PC?**

### The Solution (2 Steps):

**Step 1: Install the App**
- Android: Browser menu (⋮) → "Add to Home screen" or "Install app"
- iPhone: Share button → "Add to Home Screen"

**Step 2: Enable Notifications**
- Open the installed app from your home screen
- Click 🔔 → "Enable Push Notifications" → Allow

**That's it!** See detailed instructions below.

---

## 📋 Features

- ✅ **Automatic 1-Hour Alerts**: Get notified exactly 1 hour before a task's due time
- 🔔 **Push Notifications**: Receive browser notifications on your device
- 📱 **Mobile Support**: Works on both desktop and mobile devices as a PWA
- 👀 **Notification History**: View all past notifications in the app
- ⏰ **Smart Tracking**: Prevents duplicate notifications for the same task

## 🗄️ Database Setup

### Step 1: Run the Notifications Schema

Open your Supabase SQL Editor and run the following file:

```sql
-- Run notifications-schema.sql
```

This will create two tables:
1. **notifications** - Stores all notification history
2. **notification_tracking** - Prevents duplicate notifications

### Step 2: Verify Tables Created

Check that the following tables exist in your Supabase dashboard:
- `notifications`
- `notification_tracking`

## 📱 Setting Up Push Notifications on Mobile

### ⚠️ IMPORTANT: Install the App First!

**Push notifications work best on mobile when the app is installed as a Progressive Web App (PWA).**

**This is required for reliable notifications on phones.**

### Step 1: Install the App on Your Phone

#### For Android (Chrome/Edge/Firefox):

1. Open the app in your mobile browser
2. Look for an **"Add to Home screen"** or **"Install app"** banner
3. If no banner appears, use the browser menu (three dots):
   - Chrome: Menu → "Add to Home screen" or "Install app"
   - Firefox: Menu → "Install"
4. Tap **"Install"** or **"Add"** to install the app
5. You'll now have an app icon on your home screen

#### For iPhone/iPad (Safari):

1. Open the app in Safari on your device
2. Tap the **Share button** (square with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Customize the name if needed
5. Tap **"Add"** in the top right
6. You'll now have an app icon on your home screen

### Step 2: Enable Notifications

**After installing the app:**

1. Open the installed app from your home screen
2. Navigate to the **🔔 Notifications** tab (tap the bell icon)
3. Click **"Enable Push Notifications"** button
4. Allow notifications when prompted by the browser
5. On Android/iOS, you may also need to allow notifications in system settings

### Step 3: Verify Installation

To confirm the app is properly installed:

**Android:**
- You should have an app icon on your home screen
- When you tap it, it opens fullscreen (like a native app)

**iPhone:**
- You should have an app icon on your home screen
- It opens without Safari's address bar when launched

### If You Don't Install the App

Without installing as a PWA, push notifications may not work reliably on mobile because:
- The app may close in the background
- System restrictions prevent background notifications
- Battery optimization may stop the app from checking reminders

**Desktop browsers don't have this restriction** - that's why notifications work fine on your PC!

## 🔔 How It Works

### Automatic Checking

The app automatically checks for tasks that are due in 1 hour:
- Checks run **every minute** when the dashboard is open
- Uses a **5-minute window** (55-65 minutes before) to catch the notification
- Each task can only trigger **one notification per day**

### Notification Types

1. **Task Reminder**: Sent 1 hour before due time
2. **Browser Notification**: Appears as a push notification on your device
3. **In-App Notification**: Stored in the Notifications tab

## 📖 Using Notifications

### Viewing Notifications

1. Click the **🔔 Notifications** tab in the dashboard
2. See all your notifications with:
   - Unread count badge
   - Notification details
   - Timestamp
   - Ability to mark as read or delete

### Notification Actions

- **Mark as Read**: Click ✓ to mark a notification as read
- **Delete**: Click × to remove a notification
- **Mark All Read**: Button to clear all read statuses
- **Show More**: Display older notifications

### Task Requirements for Notifications

To receive a notification, a task must have:
- ✅ A **due date** set
- ✅ Be **active** (not completed or archived)
- ✅ Have a due date/time within the next hour

**Note**: Due time is optional but recommended. If no time is set, midnight (00:00) is used.

## 🐛 Troubleshooting

### Notifications Not Appearing

1. **Check Browser Permission**:
   - Open browser settings
   - Find "Notifications" for your site
   - Ensure it's set to "Allow"

2. **Check Task Setup**:
   - Verify the task has a due date
   - Check the due date is in the future
   - Ensure time difference is exactly 1 hour

3. **Browser Support**:
   - Modern browsers supported: Chrome, Edge, Safari, Firefox
   - Older browsers may not support push notifications

### Mobile Issues

**🔴 "Notifications work on PC but not on my phone"**

This is the #1 issue! Solution: **Install the app on your phone first** (see Step 1 above).

**Android Chrome**:
- **Must install the app**: Use "Add to Home screen" from the browser menu
- Ensure you're using Chrome or Edge (not Samsung Internet)
- Try disabling and re-enabling notifications
- Check "Do Not Disturb" is not active
- Go to Phone Settings → Apps → Your App → Notifications (ensure enabled)

**iPhone Safari**:
- **Must add to home screen**: Tap Share → "Add to Home Screen"
- Open the app from the home screen icon (not from Safari)
- Check Settings → Your App → Notifications (ensure enabled)
- Settings → Safari → General → ensure notifications allowed
- Ensure iOS version is 12.1 or later

**Common Mistakes**:
1. ❌ Only visiting in browser without installing
2. ❌ Denying notification permission when asked
3. ❌ Trying to use notifications in browser tabs instead of installed app
4. ❌ System-level notification settings blocking the app

### Notification Delay

- Notifications are checked every **1 minute**
- Maximum delay: ~60 seconds after the trigger time
- Ensure the app/tab is open or recently used

## 🔐 Privacy & Security

- Notifications are **user-specific**
- Only you can see your notifications
- No data is shared with third parties
- All data stored securely in Supabase

## 🔄 Testing Notifications

To test if notifications work:

1. Create a test task with:
   - Due date: **Today**
   - Due time: **1 hour from now** (or slightly more)
2. Wait for the notification window
3. You should see:
   - Browser push notification
   - Notification in the app's Notifications tab

## 📝 Technical Details

### Notification Timing

```
Current Time: 2:00 PM
Task Due: 3:00 PM
Notification: 2:00 PM (1 hour before)

Window: 1:55 PM - 2:05 PM (10-minute window)
```

### Preventing Duplicates

The system tracks:
- Task ID
- Notification type
- Date sent

This ensures each task only triggers one notification per day.

## 🎯 Future Enhancements

Possible future features:
- Customizable reminder times (5 min, 30 min, 1 day)
- Email notifications
- SMS notifications
- Recurring task reminders
- Multiple time zone support

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify database setup is correct
3. Check browser console for errors
4. Ensure Supabase connection is working

---

**Enjoy staying on top of your tasks! 🎉**


# Notification System Setup Guide

This guide explains how to set up the task notification system that alerts users when tasks are due in 1 hour.

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

### For Android (Chrome/Edge)

1. Open the app in your mobile browser
2. Navigate to the **🔔 Notifications** tab
3. Click **"Enable Push Notifications"** button
4. Allow notifications when prompted

### For iPhone/iPad (Safari)

1. Open the app in Safari on your device
2. Go to **🔔 Notifications** tab
3. Click **"Enable Push Notifications"** button
4. Allow notifications when prompted
5. **Important**: For Safari, you may need to add the site to your home screen:
   - Tap the Share button (square with arrow)
   - Select "Add to Home Screen"
   - This enables better notification support

### Installing as PWA (Progressive Web App)

**Android:**
1. When visiting the site, Chrome will show an "Add to Home screen" banner
2. Tap "Add" to install the app
3. You'll now have an app icon on your home screen

**iPhone:**
1. Tap the Share button
2. Select "Add to Home Screen"
3. Customize the name if needed
4. Tap "Add"

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

**Android Chrome**:
- Ensure you're using Chrome (not other browsers)
- Try disabling and re-enabling notifications
- Check "Do Not Disturb" is not active

**iPhone Safari**:
- Add the site to home screen for best results
- Check Settings → Safari → Notifications
- Ensure iOS version is 12.1 or later

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


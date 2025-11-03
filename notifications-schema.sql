-- Notifications Table
-- This table stores notifications for users, particularly task reminders
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES task(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'task_reminder' CHECK (type IN ('task_reminder', 'task_due', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON notifications(task_id);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: System can insert notifications
CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Notification tracking table to prevent duplicate notifications
-- This tracks when notifications were sent for specific tasks
CREATE TABLE IF NOT EXISTS notification_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES task(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL,
  sent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, notification_type, sent_date)
);

CREATE INDEX IF NOT EXISTS idx_notification_tracking_task_id ON notification_tracking(task_id);
CREATE INDEX IF NOT EXISTS idx_notification_tracking_sent_at ON notification_tracking(sent_at);

-- Enable RLS on tracking table
ALTER TABLE notification_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notification tracking
CREATE POLICY "Users can view own tracking"
  ON notification_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM task
      WHERE task.id = notification_tracking.task_id
      AND task.user_id = auth.uid()
    )
  );

-- Policy: System can insert tracking records
CREATE POLICY "System can insert tracking"
  ON notification_tracking FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM task
      WHERE task.id = notification_tracking.task_id
      AND task.user_id = auth.uid()
    )
  );


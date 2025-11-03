-- Migration: Add due_date and due_time columns to task table
-- This allows tasks to have a due date and time for deadline tracking

-- Add due_date column (DATE type)
ALTER TABLE task 
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add due_time column (TIME type)
ALTER TABLE task 
ADD COLUMN IF NOT EXISTS due_time TIME;

-- Add index for faster queries on due_date (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_task_due_date ON task(due_date);

-- Optional: Add a comment to document the columns
COMMENT ON COLUMN task.due_date IS 'The date when the task is due';
COMMENT ON COLUMN task.due_time IS 'The time when the task is due on the due_date';


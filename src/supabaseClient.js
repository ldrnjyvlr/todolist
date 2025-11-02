import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nxgnwbxnnwvlpotsapam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54Z253Ynhubnd2bHBvdHNhcGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzM0NDgsImV4cCI6MjA3NzQwOTQ0OH0.WHTAsBO_oam2U00jPAnMIFS1FMIfjjRwVKCTQd20AB8';

export const supabase = createClient(supabaseUrl, supabaseKey);

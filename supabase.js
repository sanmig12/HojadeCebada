
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://dhwzywvsnzhzpxdfeeks.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_PLTRi_6XqxFy9SQbhChTqw_ungEuEKv';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

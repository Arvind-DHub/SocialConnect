import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// NEXT_PUBLIC_ prefix means this is exposed to the browser

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ADMIN CLIENT — server only, bypasses RLS

// SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix so Next.js will never send it to the browser

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

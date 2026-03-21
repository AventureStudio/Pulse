import { createClient } from "@supabase/supabase-js";

// ── Pulse Supabase admin client (OKR data) ──
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_PULSE_SUPABASE_URL!,
  process.env.PULSE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_PULSE_SUPABASE_ANON_KEY!
);

// ── Central Aventure Studio Supabase admin client (Auth) ──
export const supabaseAuthAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

import { createClient } from "@supabase/supabase-js";

const getSupabaseConfig = () => ({
  url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  key: process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
});

let supabaseClient: any = null;

export const getSupabase = () => {
  if (!supabaseClient) {
    const { url, key } = getSupabaseConfig();
    if (!url || !key) {
      throw new Error("Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_KEY.");
    }
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
};

let supabaseAdminClient: any = null;

export const getSupabaseAdmin = () => {
  if (!supabaseAdminClient) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!url || !serviceKey) {
      return null; // Return null if service role not available
    }
    supabaseAdminClient = createClient(url, serviceKey);
  }
  return supabaseAdminClient;
};

export const supabase = new Proxy({} as any, {
  get: (_target, prop) => {
    return getSupabase()[prop];
  },
});

let atSMS: any = null;

export async function getAfricasTalkingSMS() {
  if (!atSMS) {
    const apiKey = process.env.AFRICASTALKING_API_KEY;
    const username = process.env.AFRICASTALKING_USERNAME || "sandbox";

    if (!apiKey) return null;

    try {
      const AfricasTalkingLib = await import("africastalking");
      const ATConstructor = (AfricasTalkingLib as any).default || (AfricasTalkingLib as any);
      const at = ATConstructor({ apiKey, username });
      atSMS = at.SMS;
    } catch (err) {
      console.error("Failed to initialize Africa's Talking SDK", err);
      return null;
    }
  }
  return atSMS;
}

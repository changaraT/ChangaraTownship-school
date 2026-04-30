import { createClient } from "@supabase/supabase-js";
import AfricasTalking from "africastalking";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("CRITICAL: Supabase credentials missing from environment variables.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const atCredentials = {
  apiKey: process.env.AFRICASTALKING_API_KEY || "",
  username: process.env.AFRICASTALKING_USERNAME || "sandbox",
};

let atSMS: any = null;

export function getAfricasTalkingSMS() {
  if (!atSMS) {
    if (!atCredentials.apiKey || atCredentials.apiKey === "") {
      console.warn("AFRICASTALKING_API_KEY not set. SMS will be simulated.");
      return null;
    }
    try {
      const at = AfricasTalking(atCredentials);
      atSMS = at.SMS;
    } catch (err) {
      console.error("Failed to initialize Africa's Talking SDK", err);
      return null;
    }
  }
  return atSMS;
}

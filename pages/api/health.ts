import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../../lib/server/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { data, error } = await supabase.from('students').select('id').limit(1);
        if (error) {
            throw error;
        }

        return res.json({ status: 'ok', supabase: 'active', availableRows: data?.length ?? 0 });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error?.message || 'Failed to keep Supabase active' });
    }
}

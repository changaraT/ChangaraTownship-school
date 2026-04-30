import { VercelResponse } from "@vercel/node";
import { supabase, getAfricasTalkingSMS } from "../_utils/supabase";
import { authenticate, AuthenticatedRequest } from "../_utils/auth";

export default async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;

  try {
    const user = authenticate(req, res);

    // Announcements
    if (path.startsWith('announcements')) {
        const id = path.split('/')[1];
        if (req.method === "POST") {
            if (user.role !== "headteacher") return res.status(403).json({ error: "Forbidden" });
            const { data, error } = await supabase.from("announcements").insert(req.body).select().single();
            if (error) throw error;
            return res.json(data);
        }
        if (req.method === "PATCH" && id) {
            const { data, error } = await supabase.from("announcements").update(req.body).eq("id", id).select().single();
            if (error) throw error;
            return res.json(data);
        }
        if (req.method === "DELETE" && id) {
            await supabase.from("announcements").delete().eq("id", id);
            return res.json({ message: "Deleted" });
        }
    }

    // Messages
    if (req.method === "GET") {
        const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return res.json(data);
    }

    if (req.method === "POST") {
        const { target, className, content } = req.body;
        let phoneNumbers: string[] = [];
        if (className) {
            const { data } = await supabase.from("students").select("parent_phone").eq("class", className);
            phoneNumbers = data?.map(s => s.parent_phone).filter(p => !!p) || [];
        } else if (target) {
            const { data } = await supabase.from("students").select("parent_phone");
            phoneNumbers = data?.map(s => s.parent_phone).filter(p => !!p) || [];
        }

        const sms = await getAfricasTalkingSMS();
        let status: any = 'sent';
        if (sms && phoneNumbers.length > 0) {
            try { await sms.send({ to: phoneNumbers, message: content }); } 
            catch { status = 'failed'; }
        }
        await supabase.from("messages").insert({ sender_id: user.id, receiver_type: className || target, content, status });
        return res.json({ message: "Message processed" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

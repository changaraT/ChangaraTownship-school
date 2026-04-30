import { authenticate, getFullUserProfile } from "../_utils/auth";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Authenticate user
        const user = authenticate(req, res);
        // Get full user profile
        const profile = await getFullUserProfile(user);
        res.status(200).json({ success: true, profile });
    } catch (error: any) {
        res.status(401).json({ success: false, error: error.message || "Unauthorized" });
    }
}

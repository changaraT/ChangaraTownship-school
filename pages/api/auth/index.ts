import { authenticate, getFullUserProfile } from "../../../lib/server/auth";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

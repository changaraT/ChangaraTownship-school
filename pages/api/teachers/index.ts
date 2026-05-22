import type { NextApiRequest, NextApiResponse } from 'next';
import handler from './[...slug]';

export default async function rootHandler(req: NextApiRequest, res: NextApiResponse) {
    // Ensure the catch-all handler receives a slug array for the root path
    (req.query as any).slug = [];
    return handler(req as any, res);
}

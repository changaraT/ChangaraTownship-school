import type { NextApiResponse } from 'next';
import { supabase } from "../../../lib/server/supabase";
import { authenticate, AuthenticatedRequest } from "../../../lib/server/auth";

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
        const user = authenticate(req, res);

        // GET /api/finance/food-items - List all food items
        if (req.method === "GET") {
            const { data, error } = await supabase
                .from("school_food_items")
                .select("*")
                .order("name");

            if (error) throw error;
            return res.json(data || []);
        }

        // POST /api/finance/food-items - Add new food item (headteacher only)
        if (req.method === "POST") {
            if (user.role !== "headteacher") {
                return res.status(403).json({ error: "Forbidden" });
            }

            const { name, unit_price, description } = req.body;

            // Validate inputs
            if (!name || typeof name !== "string" || name.trim().length === 0) {
                return res.status(400).json({ error: "Name is required" });
            }

            const price = parseFloat(String(unit_price));
            if (isNaN(price) || price < 0) {
                return res.status(400).json({ error: "Price must be a valid positive number" });
            }

            const sanitizedName = name.trim().replace(/[<>\"']/g, "");
            const sanitizedDesc = description ? String(description).trim().replace(/[<>\"']/g, "") : "";

            const { data: foodItem, error } = await supabase
                .from("school_food_items")
                .insert({
                    name: sanitizedName,
                    unit_price: price,
                    description: sanitizedDesc,
                })
                .select()
                .single();

            if (error) throw error;
            return res.json(foodItem);
        }

        // PATCH /api/finance/food-items/[id] - Update food item
        if (req.method === "PATCH") {
            if (user.role !== "headteacher") {
                return res.status(403).json({ error: "Forbidden" });
            }

            const { id } = req.query;
            const { name, unit_price, description } = req.body;

            if (!id) {
                return res.status(400).json({ error: "ID is required" });
            }

            const price = unit_price ? parseFloat(String(unit_price)) : undefined;
            if (price && (isNaN(price) || price < 0)) {
                return res.status(400).json({ error: "Price must be a valid positive number" });
            }

            const updates: any = {};
            if (name) updates.name = String(name).trim().replace(/[<>\"']/g, "");
            if (price !== undefined) updates.unit_price = price;
            if (description !== undefined) updates.description = String(description).trim().replace(/[<>\"']/g, "");

            const { data, error } = await supabase
                .from("school_food_items")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return res.json(data);
        }

        // DELETE /api/finance/food-items/[id]
        if (req.method === "DELETE") {
            if (user.role !== "headteacher") {
                return res.status(403).json({ error: "Forbidden" });
            }

            const { id } = req.query;
            const { error } = await supabase
                .from("school_food_items")
                .delete()
                .eq("id", id);

            if (error) throw error;
            return res.json({ message: "Food item deleted" });
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (err: any) {
        console.error("Food items API error:", err);
        res.status(400).json({ error: "Operation failed" });
    }
}

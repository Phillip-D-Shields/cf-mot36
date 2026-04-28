import { RANKS, LICENSE_CLASSES } from '$lib/roster';

export async function load({ platform }) {
    if (!platform?.env?.DB) {
        return { volunteers: [], ranks: RANKS, licenseClasses: LICENSE_CLASSES };
    }

    try {
        const result = await platform.env.DB.prepare(`
            SELECT * FROM volunteers WHERE active = 1 ORDER BY name ASC
        `).all();

        return {
            volunteers: result.results,
            ranks: RANKS,
            licenseClasses: LICENSE_CLASSES
        };
    } catch (error) {
        console.error("Database error fetching volunteers:", error);
        return { volunteers: [], ranks: RANKS, licenseClasses: LICENSE_CLASSES };
    }
}

export const actions = {
    save: async ({ request, platform }) => {
        if (!platform?.env?.DB) return { success: false, message: "Database connection missing" };

        const data = await request.formData();
        const id = data.get('id')?.toString();
        const name = data.get('name')?.toString();
        const rank = data.get('rank')?.toString();
        const license_class = data.get('license_class')?.toString();
        const phone = data.get('phone')?.toString() || null;

        if (!name || !rank || !license_class) {
            return { success: false, message: "Missing required fields" };
        }

        try {
            if (id) {
                await platform.env.DB.prepare(
                    `UPDATE volunteers SET name = ?, rank = ?, license_class = ?, phone = ?, 
                     updated_at = datetime('now') WHERE id = ?`
                ).bind(name, rank, license_class, phone, id).run();
            } else {
                await platform.env.DB.prepare(
                    `INSERT INTO volunteers (name, rank, license_class, phone) VALUES (?, ?, ?, ?)`
                ).bind(name, rank, license_class, phone).run();
            }
            return { success: true };
        } catch (error) {
            console.error("Error saving volunteer:", error);
            return { success: false, message: "Failed to save volunteer." };
        }
    },

    delete: async ({ request, platform }) => {
        if (!platform?.env?.DB) return { success: false, message: "Database connection missing" };

        const data = await request.formData();
        const id = data.get('id')?.toString();

        if (!id) return { success: false, message: "No ID provided" };

        try {
            // Soft delete
            await platform.env.DB.prepare(
                `UPDATE volunteers SET active = 0, updated_at = datetime('now') WHERE id = ?`
            ).bind(id).run();
            return { success: true };
        } catch (error) {
            console.error("Error deleting volunteer:", error);
            return { success: false, message: "Failed to delete volunteer." };
        }
    }
};
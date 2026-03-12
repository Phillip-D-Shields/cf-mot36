export async function load({ platform }) {
    if (!platform?.env?.DB) {
        return { links: [] };
    }

    try {
        const result = await platform.env.DB.prepare(`
            SELECT * FROM links ORDER BY category, title ASC
        `).all();

        return { links: result.results };
    } catch (error) {
        console.error("Database error fetching links:", error);
        return { links: [] };
    }
}

export const actions = {
    save: async ({ request, platform }) => {
        if (!platform?.env?.DB) return { success: false, message: "Database connection missing" };

        const data = await request.formData();
        const id = data.get('id')?.toString();
        const title = data.get('title')?.toString();
        const url = data.get('url')?.toString();
        const category = data.get('category')?.toString();
        const description = data.get('description')?.toString() || null;

        if (!title || !url || !category) {
            return { success: false, message: "Missing required fields" };
        }

        try {
            if (id) {
                // Update existing link
                await platform.env.DB.prepare(
                    `UPDATE links SET title = ?, url = ?, category = ?, description = ? WHERE id = ?`
                ).bind(title, url, category, description, id).run();
            } else {
                // Insert new link
                await platform.env.DB.prepare(
                    `INSERT INTO links (title, url, category, description) VALUES (?, ?, ?, ?)`
                ).bind(title, url, category, description).run();
            }
            return { success: true };
        } catch (error) {
            console.error("Error saving link:", error);
            return { success: false, message: "Failed to save link." };
        }
    },

    delete: async ({ request, platform }) => {
        if (!platform?.env?.DB) return { success: false, message: "Database connection missing" };

        const data = await request.formData();
        const id = data.get('id')?.toString();

        if (!id) return { success: false, message: "No ID provided" };

        try {
            await platform.env.DB.prepare(`DELETE FROM links WHERE id = ?`).bind(id).run();
            return { success: true };
        } catch (error) {
            console.error("Error deleting link:", error);
            return { success: false, message: "Failed to delete link." };
        }
    }
};
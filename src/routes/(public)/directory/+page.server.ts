export async function load({ platform }) {
    if (!platform?.env?.DB) {
        return { links: [] };
    }

    try {
        // Fetch all links, ordered alphabetically so they look neat inside their groups
        const result = await platform.env.DB.prepare(`
            SELECT * FROM links ORDER BY title ASC
        `).all();

        return { links: result.results };
    } catch (error) {
        console.error("Database error fetching directory links:", error);
        return { links: [] };
    }
}
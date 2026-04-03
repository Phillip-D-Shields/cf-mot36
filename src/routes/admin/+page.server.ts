export async function load({ platform }) {
    if (!platform?.env?.DB) {
        return { 
            quizzes: [], 
            stats: { total: 0, active: 0 },
            linkStats: { total: 0, byCategory: {} }
        };
    }

    try {
        const [quizzesResult, linksCountResult, linksByCategoryResult] = await Promise.all([
            platform.env.DB.prepare(
                "SELECT * FROM quizzes ORDER BY created_at DESC"
            ).all(),
            platform.env.DB.prepare(
                "SELECT COUNT(*) as total FROM links"
            ).first(),
            platform.env.DB.prepare(
                "SELECT category, COUNT(*) as count FROM links GROUP BY category"
            ).all()
        ]);

        const quizzes = quizzesResult.results;

        const stats = {
            total: quizzes.length,
            active: quizzes.filter(q => q.is_active === 1).length
        };

        const byCategory: Record<string, number> = {};
        for (const row of linksByCategoryResult.results) {
            byCategory[row.category as string] = row.count as number;
        }

        const linkStats = {
            total: (linksCountResult?.total as number) || 0,
            byCategory
        };

        return {
            quizzes,
            stats,
            linkStats
        };
    } catch (error) {
        console.error("Database error:", error);
        return { 
            quizzes: [], 
            stats: { total: 0, active: 0 },
            linkStats: { total: 0, byCategory: {} }
        };
    }
}

export const actions = {
    delete: async ({ request, platform }) => {
        const formData = await request.formData();
        const id = formData.get('id');

        if (!id) return { success: false, error: "No ID provided" };

        try {
            await platform?.env.DB.prepare(
                "DELETE FROM quizzes WHERE id = ?"
            ).bind(id).run();
            
            return { success: true };
        } catch (error) {
            console.error("Delete error:", error);
            return { success: false, error: "Failed to delete quiz" };
        }
    }
};
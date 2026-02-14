export async function load({ platform }) {
    // Failsafe for local dev if DB isn't bound properly
    if (!platform?.env?.DB) {
        return { 
            quizzes: [], 
            stats: { total: 0, active: 0 } 
        };
    }

    try {
        // Fetch all quizzes
        const result = await platform.env.DB.prepare(
            "SELECT * FROM quizzes ORDER BY created_at DESC"
        ).all();

        const quizzes = result.results;

        // Calculate quick stats for the dashboard
        const stats = {
            total: quizzes.length,
            active: quizzes.filter(q => q.is_active === 1).length
        };

        return {
            quizzes,
            stats
        };
    } catch (error) {
        console.error("Database error:", error);
        return { 
            quizzes: [], 
            stats: { total: 0, active: 0 } 
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
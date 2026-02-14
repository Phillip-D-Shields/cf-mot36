export async function load({ platform }) {
    if (!platform?.env?.DB) {
        return { activeQuizzes: [] };
    }

    try {
        // Only fetch active quizzes for the public facing page
        const result = await platform.env.DB.prepare(
            "SELECT id, title, description, pass_threshold FROM quizzes WHERE is_active = 1 ORDER BY created_at DESC"
        ).all();

        return {
            activeQuizzes: result.results
        };
    } catch (error) {
        console.error("Database error:", error);
        return { activeQuizzes: [] };
    }
}
export async function load({ platform }) {
    if (!platform?.env?.DB) {
        return { submissions: [] };
    }

    try {
        const result = await platform.env.DB.prepare(`
            SELECT 
                s.id, 
                s.volunteer_name, 
                s.brigade_id, 
                s.score, 
                s.passed, 
                s.submission_date,
                s.answers_log,
                q.title as quiz_title
            FROM submissions s
            LEFT JOIN quizzes q ON s.quiz_id = q.id
            ORDER BY s.submission_date DESC
        `).all();

        // Parse the JSON answers_log so the frontend doesn't have to
        const submissions = result.results.map((sub: any) => {
            let parsedLog = [];
            if (sub.answers_log) {
                try {
                    parsedLog = JSON.parse(sub.answers_log);
                } catch (e) {
                    console.error("Failed to parse answers_log for submission", sub.id);
                }
            }
            return {
                ...sub,
                answers_log: parsedLog
            };
        });

        return { submissions };
    } catch (error) {
        console.error("Database error fetching submissions:", error);
        return { submissions: [] };
    }
}

export const actions = {
    delete: async ({ request, platform }) => {
        if (!platform?.env?.DB) {
            return { success: false, message: "Database connection missing" };
        }

        const formData = await request.formData();
        const idsString = formData.get('ids')?.toString();

        if (!idsString) return { success: false, message: "No IDs provided" };

        try {
            const ids = JSON.parse(idsString);
            
            if (!Array.isArray(ids) || ids.length === 0) {
                return { success: false, message: "Invalid IDs array" };
            }

            // Create a string of question marks equal to the number of IDs: "?, ?, ?"
            const placeholders = ids.map(() => '?').join(',');

            // Execute the deletion
            await platform.env.DB.prepare(
                `DELETE FROM submissions WHERE id IN (${placeholders})`
            ).bind(...ids).run();

            return { success: true };
        } catch (error) {
            console.error("Bulk delete failed:", error);
            return { success: false, message: "Failed to delete submissions." };
        }
    }
};
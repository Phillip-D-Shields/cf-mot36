// src/routes/admin/submissions/+page.server.ts
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
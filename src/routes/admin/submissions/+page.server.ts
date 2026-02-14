export async function load({ platform }) {
    if (!platform?.env?.DB) {
        return { submissions: [] };
    }

    try {
        // We use a JOIN to get the Quiz Title alongside the Submission data
        const result = await platform.env.DB.prepare(`
            SELECT 
                s.id, 
                s.volunteer_name, 
                s.brigade_id, 
                s.score, 
                s.passed, 
                s.submission_date,
                q.title as quiz_title
            FROM submissions s
            LEFT JOIN quizzes q ON s.quiz_id = q.id
            ORDER BY s.submission_date DESC
        `).all();

        return {
            submissions: result.results
        };
    } catch (error) {
        console.error("Database error fetching submissions:", error);
        return { submissions: [] };
    }
}
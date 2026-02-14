import { fail, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const actions = {
    default: async ({ request, platform }: RequestEvent) => {
        const formData = await request.formData();
        
        // 1. Extract Quiz Metadata
        const title = formData.get('title') as string | null;
        const description = formData.get('description') as string | null;
        const reference_url = formData.get('reference_url') as string | null;
        const pass_threshold = parseInt(formData.get('pass_threshold') as string);
        
        // 2. Extract and Parse Questions (We'll send them as a JSON string)
        const questionsRaw = formData.get('questions_json') as string | null;
        let questions = [];
        try {
            if (!questionsRaw) {
                return fail(400, { error: "Invalid question data" });
            }
            questions = JSON.parse(questionsRaw);
        } catch (e) {
            return fail(400, { error: "Invalid question data" });
        }

        if (!title || questions.length === 0) {
            return fail(400, { error: "Title and at least one question are required." });
        }

        // 3. Database Transaction (Insert Quiz -> Get ID -> Insert Questions)
        try {
            // A. Insert Quiz
            const quizResult = await platform?.env.DB.prepare(
                `INSERT INTO quizzes (title, description, reference_url, pass_threshold) 
                 VALUES (?, ?, ?, ?) RETURNING id`
            ).bind(title, description, reference_url, pass_threshold).first();

            const quizId = quizResult?.id;

            // B. Insert Questions (Loop through them)
            // Note: D1 supports batching, which is faster.
            const stmt = platform?.env.DB.prepare(
                `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer) 
                 VALUES (?, ?, ?, ?, ?)`
            );

            const batch = questions.map(q => {
                // Ensure options/answers are strings for storage
                return stmt?.bind(
                    quizId,
                    q.text,
                    q.type,
                    JSON.stringify(q.options),
                    JSON.stringify(q.correctAnswer)
                );
            });

            await platform?.env.DB.batch(batch);

        } catch (err) {
            console.error(err);
            return fail(500, { error: "Database error during save." });
        }

        // 4. Success! Redirect to Admin Dashboard
        throw redirect(303, '/admin');
    }
};
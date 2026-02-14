// src/routes/admin/edit/[id]/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export async function load({ params, platform }) {
    const quizId = params.id;

    if (!platform?.env?.DB) return { quiz: null, questions: [] };

    try {
        // 1. Fetch Quiz Metadata
        const quiz = await platform.env.DB.prepare(
            "SELECT * FROM quizzes WHERE id = ?"
        ).bind(quizId).first();

        if (!quiz) throw new Error("Quiz not found");

        // 2. Fetch Questions and parse the JSON fields
        const questionsResult = await platform.env.DB.prepare(
            "SELECT * FROM questions WHERE quiz_id = ?"
        ).bind(quizId).all();

        const questions = questionsResult.results.map(q => ({
            id: q.id.toString(), // Keep as string for UI keys
            text: q.question_text,
            type: q.question_type,
            options: JSON.parse(q.options),
            correctAnswer: JSON.parse(q.correct_answer)
        }));

        return { quiz, questions };
    } catch (err) {
        console.error(err);
        // Redirect back if not found
        throw redirect(303, '/admin');
    }
}

export const actions = {
    default: async ({ request, params, platform }) => {
        const quizId = params.id;
        const formData = await request.formData();
        
        const title = formData.get('title');
        const description = formData.get('description');
        const reference_url = formData.get('reference_url');
        const pass_threshold = parseInt(formData.get('pass_threshold'));
        const is_active = formData.get('is_active') === 'true' ? 1 : 0;
        
        let questions = [];
        try {
            questions = JSON.parse(formData.get('questions_json'));
        } catch (e) {
            return fail(400, { error: "Invalid question data" });
        }

        try {
            // A. Update the Quiz
            await platform?.env.DB.prepare(
                `UPDATE quizzes 
                 SET title = ?, description = ?, reference_url = ?, pass_threshold = ?, is_active = ?
                 WHERE id = ?`
            ).bind(title, description, reference_url, pass_threshold, is_active, quizId).run();

            // B. Wipe existing questions for this quiz
            await platform?.env.DB.prepare(
                "DELETE FROM questions WHERE quiz_id = ?"
            ).bind(quizId).run();

            // C. Insert the new/updated questions
            if (questions.length > 0) {
                const stmt = platform?.env.DB.prepare(
                    `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer) 
                     VALUES (?, ?, ?, ?, ?)`
                );

                const batch = questions.map(q => {
                    return stmt?.bind(
                        quizId,
                        q.text,
                        q.type,
                        JSON.stringify(q.options),
                        JSON.stringify(q.correctAnswer)
                    );
                });

                await platform.env.DB.batch(batch);
            }

        } catch (err) {
            console.error(err);
            return fail(500, { error: "Database error during update." });
        }

        throw redirect(303, '/admin');
    }
};
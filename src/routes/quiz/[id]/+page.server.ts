// src/routes/quiz/[id]/+page.server.js
import { error, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { Resend } from 'resend';

export async function load({ params, platform }) {
    const quizId = params.id;
    if (!platform?.env?.DB) return { quiz: null, questions: [] };

    try {
        // 1. Fetch Active Quiz
        const quiz = await platform.env.DB.prepare(
            "SELECT id, title, description, reference_url, pass_threshold FROM quizzes WHERE id = ? AND is_active = 1"
        ).bind(quizId).first();

        if (!quiz) throw error(404, "Quiz not found or is currently inactive.");

        // 2. Fetch Questions (Safely)
        const questionsResult = await platform.env.DB.prepare(
            "SELECT id, question_text, question_type, options FROM questions WHERE quiz_id = ?"
        ).bind(quizId).all();

        // Notice we do NOT select or send `correct_answer` to the client!
        const questions = questionsResult.results.map(q => ({
            id: q.id.toString(),
            text: q.question_text,
            type: q.question_type,
            options: JSON.parse(q.options)
        }));

        return { quiz, questions };
    } catch (err) {
        console.error(err);
        throw error(404, "Quiz not found");
    }
}

export const actions = {
    submit: async ({ request, params, platform }) => {
        const quizId = params.id;
        const formData = await request.formData();

        const volunteer_name = formData.get('volunteer_name');
        const brigade_id = formData.get('brigade_id') || 'N/A';
        const answersRaw = formData.get('answers_json');

        if (!volunteer_name || !answersRaw) {
            return fail(400, { error: "Missing required fields" });
        }

        const userAnswers = JSON.parse(answersRaw); // Format: { "question_id": "selected_option_id" }

        try {
            // 1. Fetch the CORRECT answers from the database to grade
            const correctAnswersResult = await platform?.env.DB.prepare(
                "SELECT id, correct_answer FROM questions WHERE quiz_id = ?"
            ).bind(quizId).all();

            let correctCount = 0;
            const totalQuestions = correctAnswersResult?.results.length || 0;

            // 2. Grade the test
            correctAnswersResult?.results.forEach(q => {
                const correctAnswer = JSON.parse(q.correct_answer);
                const userAnswer = userAnswers[q.id.toString()];

                // Simple check (handles single choice and true/false well)
                // Note: If you implement multi-select checkboxes later, array comparison logic goes here.
                if (userAnswer === correctAnswer) {
                    correctCount++;
                }
            });

            // 3. Calculate Score & Pass/Fail
            const score = Math.round((correctCount / totalQuestions) * 100);

            // Get pass threshold
            const quizMeta = await platform?.env.DB.prepare("SELECT pass_threshold FROM quizzes WHERE id = ?").bind(quizId).first();
            const passed = score >= quizMeta.pass_threshold ? 1 : 0;

            // 4. Save Submission to Database
            await platform?.env.DB.prepare(
                `INSERT INTO submissions (quiz_id, volunteer_name, brigade_id, score, passed, answers_log) 
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(
                quizId,
                volunteer_name,
                brigade_id,
                score,
                passed,
                JSON.stringify(userAnswers)
            ).run();

            const adminEmails = ["matua.phillip.shields@gmail.com", "kyle.silcock@fireandemergency.nz"]; 
            const RESEND_API_KEY = env.RESEND_API_KEY; // Make sure to set this in your environment variables
            const emailHtml = `
                <h2>New Certification Submitted</h2>
                <p><strong>Volunteer:</strong> ${volunteer_name} (ID: ${brigade_id})</p>
                <p><strong>Score:</strong> ${score}%</p>
                <p><strong>Result:</strong> ${passed === 1 ? '✅ PASSED' : '❌ FAILED'}</p>
                <br/>
                <p><a href="http://cf-mot35.pages.dev/admin/submissions">View all submissions here</a></p>
            `;
            const resend = new Resend(RESEND_API_KEY);

            // We wrap this in its own try/catch so an email failure 
            // doesn't crash the user's successful submission
            try {
                resend.emails.send({
                    from: 'brigade@digiwha-labs.com',
                    to: adminEmails,
                    subject: `New Certification Submission: ${volunteer_name} - ${score}%`,
                    html: emailHtml
                }).then(() => {
                    console.log("Notification email sent successfully");
                })
            } catch (emailErr) {
                console.error("Failed to send email:", emailErr);
            }
            // --- END NEW CODE ---

            return {
                success: true,
                score,
                passed: passed === 1,
                threshold: quizMeta?.pass_threshold || 0
            };

        } catch (err) {
            console.error(err);
            return fail(500, { error: "Failed to grade submission" });
        }
    }
};
// src/routes/quiz/[id]/+page.server.ts
import { error, fail } from '@sveltejs/kit';
import { RESEND_API_KEY } from '$env/static/private';
import { Resend } from 'resend';

const resend = new Resend(RESEND_API_KEY);

// Helper: Compare arrays for multi-choice questions regardless of order
const arraysMatch = (arr1: any[], arr2: any[]) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) return false;
    return arr1.every(val => arr2.includes(val));
};

// Helper: Generate Email HTML
const generateEmailHtml = (name: string, brigadeId: string, score: number, passed: boolean) => `
    <h2>New Certification Submitted</h2>
    <p><strong>Volunteer:</strong> ${name} (ID: ${brigadeId})</p>
    <p><strong>Score:</strong> ${score}%</p>
    <p><strong>Result:</strong> ${passed ? '✅ PASSED' : '❌ FAILED'}</p>
    <br/>
    <p><a href="http://cf-mot36.pages.dev/admin/submissions">View all submissions here</a></p>
`;

export async function load({ params, platform }) {
    const quizId = params.id;
    if (!platform?.env?.DB) return { quiz: null, questions: [] };

    try {
        const quiz = await platform.env.DB.prepare(
            "SELECT id, title, description, reference_url, pass_threshold FROM quizzes WHERE id = ? AND is_active = 1"
        ).bind(quizId).first();

        if (!quiz) throw error(404, "Quiz not found or is currently inactive.");

        const questionsResult = await platform.env.DB.prepare(
            "SELECT id, question_text, question_type, options FROM questions WHERE quiz_id = ?"
        ).bind(quizId).all();

        const questions = questionsResult.results.map(q => ({
            id: q.id.toString(),
            text: q.question_text,
            type: q.question_type,
            options: JSON.parse(q.options as string)
        }));

        return { quiz, questions };
    } catch (err) {
        console.error("Load Error:", err);
        throw error(404, "Quiz not found");
    }
}

export const actions = {
    submit: async ({ request, params, platform }) => {
        const quizId = params.id;
        const formData = await request.formData();

        const volunteer_name = formData.get('volunteer_name')?.toString();
        const brigade_id = formData.get('brigade_id')?.toString() || 'N/A';
        const answersRaw = formData.get('answers_json')?.toString();

        if (!volunteer_name || !answersRaw) {
            return fail(400, { error: "Missing required fields" });
        }

        const userAnswers = JSON.parse(answersRaw);

        try {
            // 1. Fetch correct answers & pass threshold concurrently
            const [correctAnswersResult, quizMeta] = await Promise.all([
                platform?.env.DB.prepare("SELECT id, correct_answer FROM questions WHERE quiz_id = ?").bind(quizId).all(),
                platform?.env.DB.prepare("SELECT pass_threshold FROM quizzes WHERE id = ?").bind(quizId).first()
            ]);

            // 2. Grade the test
            let correctCount = 0;
            const totalQuestions = correctAnswersResult?.results.length || 0;

            correctAnswersResult?.results.forEach(q => {
                const correctAnswer = JSON.parse(q.correct_answer as string);
                const userAnswer = userAnswers[q.id.toString()];

                if (Array.isArray(correctAnswer)) {
                    if (arraysMatch(correctAnswer, userAnswer)) correctCount++;
                } else if (userAnswer === correctAnswer) {
                    correctCount++;
                }
            });

            // 3. Calculate Score
            const score = Math.round((correctCount / totalQuestions) * 100);
            const passed = score >= (quizMeta?.pass_threshold as number) ? 1 : 0;

            // 4. Save Submission
            await platform?.env.DB.prepare(
                `INSERT INTO submissions (quiz_id, volunteer_name, brigade_id, score, passed, answers_log) 
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(quizId, volunteer_name, brigade_id, score, passed, answersRaw).run();

            // 5. Send Email Notification
            try {
                await resend.emails.send({
                    from: 'brigade@digiwha-labs.com',
                    to: ["matua.phillip.shields@gmail.com"],
                    subject: `New Certification Submission: ${volunteer_name} - ${score}%`,
                    html: generateEmailHtml(volunteer_name, brigade_id, score, passed === 1)
                });
            } catch (emailErr) {
                console.error("Failed to send email:", emailErr);
                // We intentionally don't fail the form if the email fails
            }

            return {
                success: true,
                score,
                passed: passed === 1,
                threshold: quizMeta?.pass_threshold || 0
            };

        } catch (err) {
            console.error("Submit Error:", err);
            return fail(500, { error: "Failed to grade submission" });
        }
    }
};
// src/routes/quiz/[id]/+page.server.ts
import { error, fail } from '@sveltejs/kit';
import { RESEND_API_KEY } from '$env/static/private';
import { Resend } from 'resend';

const resend = new Resend(RESEND_API_KEY);

// Helper: Compare arrays for multi-choice questions regardless of order
const arraysMatch = (arr1: any[], arr2: any[]) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) return false;
    // Map everything to strings so [1, 2] matches ["1", "2"]
    const str1 = arr1.map(String);
    const str2 = arr2.map(String);
    return str1.every(val => str2.includes(val));
};

// Helper: Translate answer IDs to readable text safely
const getAnswerText = (answer: any, type: string, optionsJson: string | null) => {
    if (type === 'true_false') return String(answer);
    if (!optionsJson) return String(answer);

    try {
        const options = JSON.parse(optionsJson);
        // Force the answer into an array so we can map it consistently
        const answerArray = Array.isArray(answer) ? answer : [answer];

        return answerArray.map(id => {
            // Use String() to prevent number vs string equality failures
            const option = options.find((o: any) => String(o.id) === String(id));
            return option ? option.text : id;
        }).join(', ');
    } catch {
        return String(answer);
    }
};

// Helper: Generate Email HTML
const generateEmailHtml = (name: string, brigadeId: string, score: number, passed: boolean, gradedAnswers: any[]) => {
    let html = `
        <h2>New Certification Submitted</h2>
        <p><strong>Volunteer:</strong> ${name} (ID: ${brigadeId})</p>
        <p><strong>Score:</strong> ${score}%</p>
        <p><strong>Result:</strong> ${passed ? '✅ PASSED' : '❌ FAILED'}</p>
        <hr />
        <h3>Submission Details:</h3>
        <ul style="list-style-type: none; padding-left: 0;">
    `;

    gradedAnswers.forEach(ans => {
        html += `
            <li style="margin-bottom: 15px; padding: 10px; background-color: ${ans.isCorrect ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${ans.isCorrect ? '#22c55e' : '#ef4444'};">
                <strong>Q: ${ans.question}</strong><br/>
                Your Answer: ${ans.userAnswer} ${ans.isCorrect ? '✅' : '❌'}<br/>
                ${!ans.isCorrect ? `<em style="color: #666;">Correct Answer: ${ans.correctAnswer}</em>` : ''}
            </li>
        `;
    });

    html += `
        </ul>
        <br/>
        <p><a href="http://cf-mot36.pages.dev/admin/submissions">View all submissions here</a></p>
    `;
    return html;
};

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
            // UPDATE: We now fetch question_text and options as well to map the readable text
            const [correctAnswersResult, quizMeta] = await Promise.all([
                platform?.env.DB.prepare("SELECT id, question_text, question_type, options, correct_answer FROM questions WHERE quiz_id = ?").bind(quizId).all(),
                platform?.env.DB.prepare("SELECT pass_threshold FROM quizzes WHERE id = ?").bind(quizId).first()
            ]);

            // 2. Grade the test and log rich data
            let correctCount = 0;
            const totalQuestions = correctAnswersResult?.results.length || 0;
            const gradedAnswers: any[] = [];

            correctAnswersResult?.results.forEach(q => {
                const correctAnswerRaw = JSON.parse(q.correct_answer as string);
                const userAnswerRaw = userAnswers[q.id.toString()];

                let isCorrect = false;

                // If it's multi_choice, strictly enforce array comparison
                if (q.question_type === 'multi_choice') {
                    const correctArr = Array.isArray(correctAnswerRaw) ? correctAnswerRaw : [correctAnswerRaw];
                    const userArr = Array.isArray(userAnswerRaw) ? userAnswerRaw : [userAnswerRaw].filter(Boolean);

                    if (arraysMatch(correctArr, userArr)) isCorrect = true;
                } else {
                    // Single choice or true/false (compare as strings)
                    if (String(userAnswerRaw) === String(correctAnswerRaw)) isCorrect = true;
                }

                if (isCorrect) correctCount++;

                // Build a readable log for this specific question
                gradedAnswers.push({
                    question: q.question_text,
                    userAnswer: getAnswerText(userAnswerRaw, q.question_type as string, q.options as string) || 'No answer provided',
                    correctAnswer: getAnswerText(correctAnswerRaw, q.question_type as string, q.options as string),
                    isCorrect
                });
            });

            // 3. Calculate Score
            const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
            const passed = score >= (quizMeta?.pass_threshold as number) ? 1 : 0;

            // 4. Save Submission (Saving the detailed graded array instead of raw IDs)
            const gradedAnswersJson = JSON.stringify(gradedAnswers);
            await platform?.env.DB.prepare(
                `INSERT INTO submissions (quiz_id, volunteer_name, brigade_id, score, passed, answers_log) 
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(quizId, volunteer_name, brigade_id, score, passed, gradedAnswersJson).run();

            // 5. Send Email Notification
            try {
                await resend.emails.send({
                    from: 'brigade@digiwha-labs.com',
                    to: [
                        "matua.phillip.shields@gmail.com",
                        // "jess.nelipovich@gmail.com", 
                        // "k_silcock@hotmail.com"
                    ],
                    subject: `New Certification Submission: ${volunteer_name} - ${score}%`,
                    html: generateEmailHtml(volunteer_name, brigade_id, score, passed === 1, gradedAnswers)
                });
            } catch (emailErr) {
                console.error("Failed to send email:", emailErr);
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
// src/routes/quiz/[id]/+page.server.ts
import { error, fail } from '@sveltejs/kit';
import { RESEND_API_KEY } from '$env/static/private';
import { Resend } from 'resend';

const resend = new Resend(RESEND_API_KEY);

// Helper: Translate answer IDs to readable text safely
const getAnswerText = (answer: any, type: string, optionsJson: string | null) => {
    if (type === 'true_false') return String(answer);
    if (!optionsJson) return String(answer);

    try {
        const options = JSON.parse(optionsJson);
        const answerArray = Array.isArray(answer) ? answer : [answer];

        return answerArray.map(id => {
            const option = options.find((o: any) => String(o.id) === String(id));
            return option ? option.text : id;
        }).join(', ');
    } catch {
        return String(answer);
    }
};

// Helper: Generate Email HTML
const generateEmailHtml = (quizTitle: string, name: string, brigadeId: string, score: number, passed: boolean, gradedAnswers: any[]) => {
    let html = `
        <h2>New Quiz Submitted</h2>
        <h3>${quizTitle}</h3>
        <p><strong>Volunteer:</strong> ${name} (ID: ${brigadeId})</p>
        <p><strong>Score:</strong> ${score}%</p>
        <p><strong>Result:</strong> ${passed ? '✅ PASSED' : '❌ FAILED'}</p>
        <hr />
        <h3>Submission Details:</h3>
        <ul style="list-style-type: none; padding-left: 0;">
    `;

    gradedAnswers.forEach(ans => {
        const bgColor = ans.isCorrect ? '#f0fdf4' : ans.isPartial ? '#fffbeb' : '#fef2f2';
        const borderColor = ans.isCorrect ? '#22c55e' : ans.isPartial ? '#f59e0b' : '#ef4444';
        const icon = ans.isCorrect ? '✅' : ans.isPartial ? `⚠️ (${ans.partialScore})` : '❌';

        html += `
            <li style="margin-bottom: 15px; padding: 10px; background-color: ${bgColor}; border-left: 4px solid ${borderColor};">
                <strong>Q: ${ans.question}</strong><br/>
                Your Answer: ${ans.userAnswer} ${icon}<br/>
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

        const quiz_title = formData.get('quiz_title')?.toString() || 'Unknown Quiz';
        const volunteer_name = formData.get('volunteer_name')?.toString();
        const brigade_id = formData.get('brigade_id')?.toString() || 'N/A';
        const answersRaw = formData.get('answers_json')?.toString();

        if (!volunteer_name || !answersRaw) {
            return fail(400, { error: "Missing required fields" });
        }

        const userAnswers = JSON.parse(answersRaw);

        try {
            const [correctAnswersResult, quizMeta] = await Promise.all([
                platform?.env.DB.prepare("SELECT id, question_text, question_type, options, correct_answer FROM questions WHERE quiz_id = ?").bind(quizId).all(),
                platform?.env.DB.prepare("SELECT pass_threshold FROM quizzes WHERE id = ?").bind(quizId).first()
            ]);

            // --- Partial credit grading ---
            let totalPointsEarned = 0;
            let totalPointsPossible = 0;
            const gradedAnswers: any[] = [];

            correctAnswersResult?.results.forEach(q => {
                const correctAnswerRaw = JSON.parse(q.correct_answer as string);
                const userAnswerRaw = userAnswers[q.id.toString()];

                let isCorrect = false;
                let isPartial = false;
                let partialScore = '';

                if (q.question_type === 'multi_choice') {
                    // Build sets of string IDs for reliable comparison
                    const correctSet = new Set(
                        (Array.isArray(correctAnswerRaw) ? correctAnswerRaw : [correctAnswerRaw]).map(String)
                    );
                    const userSet = new Set(
                        (Array.isArray(userAnswerRaw) ? userAnswerRaw : [userAnswerRaw].filter(Boolean)).map(String)
                    );

                    let earned = 0;
                    let penalty = 0;

                    for (const pick of userSet) {
                        if (correctSet.has(pick)) {
                            earned++;
                        } else {
                            penalty++;
                        }
                    }

                    const questionScore = Math.max(0, (earned - penalty) / correctSet.size);
                    totalPointsEarned += questionScore;
                    totalPointsPossible += 1;

                    isCorrect = questionScore === 1;
                    isPartial = !isCorrect && questionScore > 0;
                    partialScore = `${Math.round(questionScore * 100)}%`;

                } else {
                    // single_choice or true_false — still all-or-nothing
                    if (String(userAnswerRaw) === String(correctAnswerRaw)) {
                        isCorrect = true;
                        totalPointsEarned += 1;
                    }
                    totalPointsPossible += 1;
                }

                gradedAnswers.push({
                    question: q.question_text,
                    userAnswer: getAnswerText(userAnswerRaw, q.question_type as string, q.options as string) || 'No answer provided',
                    correctAnswer: getAnswerText(correctAnswerRaw, q.question_type as string, q.options as string),
                    isCorrect,
                    isPartial,
                    partialScore
                });
            });

            // 3. Calculate Score
            const score = totalPointsPossible > 0 ? Math.round((totalPointsEarned / totalPointsPossible) * 100) : 0;
            const passed = score >= (quizMeta?.pass_threshold as number) ? 1 : 0;

            // 4. Save Submission
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
                        "phillip.shields@fireandemergency.nz",
                        "jessica.nelipovich@fireandemergency.nz",
                        "kyle.silcock@fireandemergency.nz"
                    ],
                    subject: `New Quiz Submission: ${quiz_title} - ${volunteer_name} - ${score}%`,
                    html: generateEmailHtml(quiz_title, volunteer_name, brigade_id, score, passed === 1, gradedAnswers)
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
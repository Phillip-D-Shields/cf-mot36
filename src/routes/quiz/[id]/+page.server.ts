import { error, fail } from '@sveltejs/kit';
import { createMimeMessage } from 'mimetext';
import { env } from '$env/dynamic/private';

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
            options: JSON.parse(q.options)
        }));

        return { quiz, questions };
    } catch (err) {
        console.error(err);
        throw error(404, "Quiz not found");
    }
}

// DO NOT import { EmailMessage } from "cloudflare:email" at the top. 
// It will break local dev. We will use a workaround.

export const actions = {
    submit: async ({ request, params, platform }) => {
        const quizId = params.id;
        const formData = await request.formData();
        const volunteer_name = formData.get('volunteer_name');
        const brigade_id = formData.get('brigade_id') || 'N/A';
        const answersRaw = formData.get('answers_json');

        if (!volunteer_name || !answersRaw) return fail(400, { error: "Missing fields" });

        const userAnswers = JSON.parse(answersRaw);

        try {
            // 1. Grading & DB (Keep your existing logic here...)
            const correctAnswersResult = await platform?.env.DB.prepare(
                "SELECT id, correct_answer FROM questions WHERE quiz_id = ?"
            ).bind(quizId).all();

            let correctCount = 0;
            const totalQuestions = correctAnswersResult?.results.length || 0;
            correctAnswersResult?.results.forEach(q => {
                const correctAnswer = JSON.parse(q.correct_answer);
                if (userAnswers[q.id.toString()] === correctAnswer) correctCount++;
            });

            const score = Math.round((correctCount / totalQuestions) * 100);
            const quizMeta = await platform?.env.DB.prepare("SELECT pass_threshold FROM quizzes WHERE id = ?").bind(quizId).first();
            const passed = score >= (quizMeta?.pass_threshold || 80) ? 1 : 0;

            await platform?.env.DB.prepare(
                `INSERT INTO submissions (quiz_id, volunteer_name, brigade_id, score, passed, answers_log) VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(quizId, volunteer_name, brigade_id, score, passed, JSON.stringify(userAnswers)).run();


            if (platform?.env?.SEB) {
                const adminEmails = ["matua.phillip.shields@gmail.com", "phillip.shields@pm.me"];
                
                platform.context.waitUntil((async () => {
                    // 1. Dynamically import EmailMessage so Vite/Node doesn't freak out locally
                    let CFEmailMessage;
                    try {
                        const module = await import(/* @vite-ignore */ "cloudflare:email");
                        CFEmailMessage = module.EmailMessage;
                    } catch (err) {
                        console.error("Failed to load cloudflare:email module:", err);
                        return;
                    }

                    for (const recipient of adminEmails) {
                        try {
                            const msg = createMimeMessage();
                            msg.setSender({ name: "OS Quiz Results", addr: "brigade@digiwha-labs.com" });
                            msg.setRecipient(recipient);
                            msg.setSubject(`Quiz Result: ${volunteer_name} - ${score}%`);
                            msg.addMessage({
                                contentType: "text/html",
                                data: `<p>Volunteer: ${volunteer_name}</p><p>Score: ${score}%</p>`
                            });

                            // 2. Instantiate the exact class Cloudflare requires
                            const emailToSend = new CFEmailMessage(
                                "brigade@digiwha-labs.com",
                                recipient,
                                msg.asRaw()
                            );

                            // 3. Send the properly typed instance
                            await platform.env.SEB.send(emailToSend);
                        } catch (e) {
                            console.error("Email send error:", e);
                        }
                    }
                })());
            }

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
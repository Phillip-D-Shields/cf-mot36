<script>
    import { enhance } from '$app/forms';

    let { data, form } = $props();
    let quiz = $derived(data.quiz);
    let questions = $derived(data.questions || []);

    let step = $state('intro');
    let volunteerName = $state('');
    let brigadeId = $state('');
    let userAnswers = $state({});

    function startQuiz() {
        if (!volunteerName.trim()) {
            alert('Please enter your Full Name to begin.');
            return;
        }
        
        for (const q of questions) {
            if (q.type === 'multi_choice') {
                userAnswers[q.id] = [];
            }
        }
        step = 'quiz';
    }
</script>

<style>
    .quiz-container {
        max-width: 720px;
        margin: 2rem auto 0;
        padding: 2rem 1rem 4rem;
    }
    .intro-card {
        background: #fff;
        border: 1px solid #e9ecef;
        border-left: 4px solid #0d6efd;
        border-radius: 0.5rem;
        padding: 2rem;
    }
    .intro-card h2 {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 0.5rem;
        color: #212529;
    }
    .intro-card .lead {
        color: #6c757d;
        font-size: 1rem;
        margin-bottom: 1.5rem;
    }
    .detail-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6c757d;
        margin-bottom: 0.35rem;
    }
    .question-card {
        background: #fff;
        border: 1px solid #e9ecef;
        border-radius: 0.5rem;
        padding: 1.25rem;
        margin-bottom: 1rem;
    }
    .question-header {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }
    .question-number {
        flex-shrink: 0;
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 50%;
        background: #e9ecef;
        color: #495057;
        font-size: 0.8125rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 0.1rem;
    }
    .question-text {
        font-size: 0.9375rem;
        font-weight: 600;
        color: #212529;
        margin: 0;
        line-height: 1.5;
    }
    .option-label {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.625rem 0.875rem;
        border: 1px solid #e9ecef;
        border-radius: 0.375rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
        font-size: 0.9375rem;
        color: #212529;
        transition: border-color 0.15s ease, background 0.15s ease;
    }
    .option-label:hover {
        border-color: #c5d1dc;
        background: #f8f9fa;
    }
    .option-label input[type="radio"],
    .option-label input[type="checkbox"] {
        accent-color: #0d6efd;
        width: 1rem;
        height: 1rem;
        flex-shrink: 0;
    }
    .submit-bar {
        background: #fff;
        border: 1px solid #e9ecef;
        border-radius: 0.5rem;
        padding: 1.25rem;
        text-align: center;
        margin-top: 1.5rem;
    }
    .result-card {
        background: #fff;
        border: 1px solid #e9ecef;
        border-radius: 0.5rem;
        padding: 3rem 2rem;
        text-align: center;
    }
    .score-badge {
        display: inline-block;
        font-size: 2.5rem;
        font-weight: 700;
        padding: 0.5rem 2rem;
        border-radius: 0.5rem;
        margin: 1.5rem 0;
    }
    .score-pass {
        background: #e8f5e9;
        color: #198754;
    }
    .score-fail {
        background: #fdecea;
        color: #dc3545;
    }
</style>

<div class="quiz-container">
    {#if step === 'intro'}
        <div class="intro-card">
            <h2>{quiz.title}</h2>
            <p class="lead">{quiz.description}</p>

            {#if quiz.reference_url}
                <div class="alert alert-info mb-4">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    <strong>Reference Material:</strong> Please review the
                    <a href={quiz.reference_url} target="_blank" rel="noopener noreferrer" class="alert-link">
                        operational documentation
                    </a> before starting.
                </div>
            {/if}

            <hr class="my-4" />

            <p class="detail-label">Volunteer details</p>

            <div class="mb-3">
                <label class="form-label" for="vol-name">Full Name</label>
                <input type="text" id="vol-name" class="form-control" bind:value={volunteerName} placeholder="Randy McRescue" required />
            </div>

            <div class="mb-4">
                <label class="form-label" for="vol-id">FENZ ID</label>
                <input type="text" id="vol-id" class="form-control" bind:value={brigadeId} placeholder="876543" required />
            </div>

            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span class="text-muted small">Pass mark: {quiz.pass_threshold}%</span>
                <button class="btn btn-primary" onclick={startQuiz} disabled={!volunteerName}>
                    Begin Certification <i class="bi bi-arrow-right ms-1"></i>
                </button>
            </div>
        </div>
        
    {:else if step === 'quiz' || step === 'submitting'}
        <div class="mb-4">
            <h3 class="fw-bold" style="font-size: 1.25rem;">{quiz.title}</h3>
            <p class="text-muted small mb-0">
                {volunteerName}
                {brigadeId ? ` · #${brigadeId}` : ''}
                · {questions.length} questions
            </p>
        </div>

        <form
            method="POST"
            action="?/submit"
            use:enhance={() => {
                step = 'submitting';
                return async ({ update, result }) => {
                    await update();
                    if (result.type === 'success') {
                        step = 'result';
                    } else {
                        step = 'quiz'; 
                    }
                };
            }}
        >
            <input type="hidden" name="volunteer_name" value={volunteerName} />
            <input type="hidden" name="brigade_id" value={brigadeId} />
            <input type="hidden" name="answers_json" value={JSON.stringify(userAnswers)} />

            {#each questions as q, index}
                <div class="question-card">
                    <div class="question-header">
                        <span class="question-number">{index + 1}</span>
                        <p class="question-text">{q.text}</p>
                    </div>

                    <div style="padding-left: 2.5rem;">
                        {#if q.type === 'true_false'}
                            <label class="option-label" for={'t_' + q.id}>
                                <input type="radio" name={'q_' + q.id} id={'t_' + q.id} value="true" bind:group={userAnswers[q.id]} required />
                                True
                            </label>
                            <label class="option-label" for={'f_' + q.id}>
                                <input type="radio" name={'q_' + q.id} id={'f_' + q.id} value="false" bind:group={userAnswers[q.id]} required />
                                False
                            </label>
                        {:else if q.type === 'single_choice'}
                            {#each q.options as opt}
                                <label class="option-label" for={'opt_' + opt.id}>
                                    <input type="radio" name={'q_' + q.id} id={'opt_' + opt.id} value={opt.id} bind:group={userAnswers[q.id]} required />
                                    {opt.text}
                                </label>
                            {/each}
                        {:else if q.type === 'multi_choice'}
                            {#each q.options as opt}
                                <label class="option-label" for={'opt_' + opt.id}>
                                    <input type="checkbox" name={'q_' + q.id} id={'opt_' + opt.id} value={opt.id} bind:group={userAnswers[q.id]} />
                                    {opt.text}
                                </label>
                            {/each}
                        {/if}
                    </div>
                </div>
            {/each}

            {#if form?.error}
                <div class="alert alert-danger">{form.error}</div>
            {/if}

            <div class="submit-bar">
                <button type="submit" class="btn btn-success px-4" disabled={step === 'submitting'}>
                    {#if step === 'submitting'}
                        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Grading...
                    {:else}
                        Submit for Grading <i class="bi bi-check-lg ms-1"></i>
                    {/if}
                </button>
            </div>
        </form>
        
    {:else if step === 'result'}
        <div class="result-card">
            {#if form?.passed}
                <div style="font-size: 3rem; color: #198754; margin-bottom: 0.5rem;">
                    <i class="bi bi-check-circle-fill"></i>
                </div>
                <h2 class="fw-bold" style="color: #198754;">Certification Passed</h2>
                <p class="text-muted">Great job, {volunteerName}. Your skills certification is complete.</p>
            {:else}
                <div style="font-size: 3rem; color: #dc3545; margin-bottom: 0.5rem;">
                    <i class="bi bi-x-octagon-fill"></i>
                </div>
                <h2 class="fw-bold" style="color: #dc3545;">Certification Failed</h2>
                <p class="text-muted">Keep reviewing the materials, {volunteerName}.</p>
                <p class="text-muted small">You needed {form?.threshold}% to pass.</p>
            {/if}

            <div class="score-badge" class:score-pass={form?.passed} class:score-fail={!form?.passed}>
                {form?.score}%
            </div>

            <p class="text-muted small mb-4">
                Your results have been securely recorded and sent to the training officer.
            </p>

            <a href="/" class="btn btn-outline-primary">Return to Home</a>
        </div>
    {/if}
</div>
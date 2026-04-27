<script>
    import { enhance } from '$app/forms';

    let { data, form } = $props();
    let quiz = $derived(data.quiz);
    let questions = $derived(data.questions || []);

    let step = $state('intro');
    let quizTitle = $derived(quiz?.title);
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

<div class="container pt-5 mt-4 pb-5" style="max-width: 720px;">
    {#if step === 'intro'}
        <div class="card border-start border-primary border-4">
            <div class="card-body p-4">
                <h2 class="fw-bold fs-4 mb-1">{quizTitle}</h2>
                <p class="text-secondary mb-4">{quiz.description}</p>

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

                <p class="text-uppercase text-secondary fw-semibold small mb-2" style="letter-spacing: 0.05em;">Volunteer details</p>

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
        </div>
        
    {:else if step === 'quiz' || step === 'submitting'}
        <div class="mb-4">
            <h3 class="fw-bold fs-5">{quiz.title}</h3>
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
            <input type="hidden" name="quiz_title" value={quiz?.title} />
            <input type="hidden" name="volunteer_name" value={volunteerName} />
            <input type="hidden" name="brigade_id" value={brigadeId} />
            <input type="hidden" name="answers_json" value={JSON.stringify(userAnswers)} />

            {#each questions as q, index}
                <div class="card mb-3">
                    <div class="card-body p-3">
                        <div class="d-flex gap-3 mb-3">
                            <span class="badge rounded-circle bg-light text-dark d-flex align-items-center justify-content-center flex-shrink-0" style="width: 1.75rem; height: 1.75rem; font-size: 0.8125rem;">{index + 1}</span>
                            <p class="fw-semibold mb-0 lh-base">{q.text}</p>
                        </div>

                        <div>
                            {#if q.type === 'true_false'}
                                <div class="border rounded-2 p-2 px-3 mb-2 d-flex align-items-center gap-2">
                                    <input type="radio" class="form-check-input mt-0" name={'q_' + q.id} id={'t_' + q.id} value="true" bind:group={userAnswers[q.id]} required />
                                    <label class="form-check-label" for={'t_' + q.id}>True</label>
                                </div>
                                <div class="border rounded-2 p-2 px-3 mb-2 d-flex align-items-center gap-2">
                                    <input type="radio" class="form-check-input mt-0" name={'q_' + q.id} id={'f_' + q.id} value="false" bind:group={userAnswers[q.id]} required />
                                    <label class="form-check-label" for={'f_' + q.id}>False</label>
                                </div>
                            {:else if q.type === 'single_choice'}
                                {#each q.options as opt}
                                    <div class="border rounded-2 p-2 px-3 mb-2 d-flex align-items-center gap-2">
                                        <input type="radio" class="form-check-input mt-0" name={'q_' + q.id} id={'opt_' + opt.id} value={opt.id} bind:group={userAnswers[q.id]} required />
                                        <label class="form-check-label" for={'opt_' + opt.id}>{opt.text}</label>
                                    </div>
                                {/each}
                            {:else if q.type === 'multi_choice'}
                                {#each q.options as opt}
                                    <div class="border rounded-2 p-2 px-3 mb-2 d-flex align-items-center gap-2">
                                        <input type="checkbox" class="form-check-input mt-0" name={'q_' + q.id} id={'opt_' + opt.id} value={opt.id} bind:group={userAnswers[q.id]} />
                                        <label class="form-check-label" for={'opt_' + opt.id}>{opt.text}</label>
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}

            {#if form?.error}
                <div class="alert alert-danger">{form.error}</div>
            {/if}

            <div class="card mt-4">
                <div class="card-body text-center p-3">
                    <button type="submit" class="btn btn-success px-4" disabled={step === 'submitting'}>
                        {#if step === 'submitting'}
                            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Grading...
                        {:else}
                            Submit for Grading <i class="bi bi-check-lg ms-1"></i>
                        {/if}
                    </button>
                </div>
            </div>
        </form>
        
    {:else if step === 'result'}
        <div class="card">
            <div class="card-body text-center py-5 px-4">
                {#if form?.passed}
                    <div class="fs-1 text-success mb-2">
                        <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <h2 class="fw-bold text-success">Certification Passed</h2>
                    <p class="text-muted">Great job, {volunteerName}. Your skills certification is complete.</p>
                {:else}
                    <div class="fs-1 text-danger mb-2">
                        <i class="bi bi-x-octagon-fill"></i>
                    </div>
                    <h2 class="fw-bold text-danger">Certification Failed</h2>
                    <p class="text-muted">Keep reviewing the materials, {volunteerName}.</p>
                    <p class="text-muted small">You needed {form?.threshold}% to pass.</p>
                {/if}

                <div class="d-inline-block fs-1 fw-bold rounded-2 px-4 py-2 my-3 {form?.passed ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">
                    {form?.score}%
                </div>

                <p class="text-muted small mb-4">
                    Your results have been securely recorded and sent to the training officer.
                </p>

                <a href="/" class="btn btn-outline-primary">Return to Home</a>
            </div>
        </div>
    {/if}
</div>
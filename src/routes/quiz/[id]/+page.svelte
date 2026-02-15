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
		if (volunteerName.trim().length > 0) {
			// NEW: Pre-fill arrays for multi-choice questions so Svelte handles checkboxes correctly
			for (const q of questions) {
				if (q.type === 'multi_choice') {
					userAnswers[q.id] = []; // Initialize as array
				}
			}
			step = 'quiz';
		} else {
			alert('Please enter your Full Name to begin.');
		}
	}

	$effect(() => {
		if (form?.success) {
			step = 'result';
		}
	});
</script>

<div class="container py-5 max-w-md" style="max-width: 800px; margin: 0 auto;">
	{#if step === 'intro'}
		<div class="card shadow border-top border-primary border-4">
			<div class="card-body p-5">
				<h2 class="mb-3">{quiz.title}</h2>
				<p class="lead text-muted">{quiz.description}</p>

				{#if quiz.reference_url}
					<div class="alert alert-info mb-4">
						<i class="bi bi-info-circle-fill me-2"></i>
						<strong>Reference Material:</strong> Please review the
						<a
							href={quiz.reference_url}
							target="_blank"
							rel="noopener noreferrer"
							class="alert-link"
						>
							operational documentation
						</a> before starting.
					</div>
				{/if}

				<hr class="my-4" />
				<h5 class="mb-3">Volunteer Details</h5>

				<div class="mb-3">
					<label class="form-label">Full Name</label>
					<input
						type="text"
						class="form-control form-control-lg"
						bind:value={volunteerName}
						placeholder="Randy McRescue"
						required
					/>
				</div>

				<div class="mb-4">
					<label class="form-label">FENZ ID</label>
					<input
						type="text"
						class="form-control"
						bind:value={brigadeId}
						placeholder="876543"
						required
					/>
				</div>

				<div class="d-flex justify-content-between align-items-center">
					<span class="text-muted small">Passing requirement: {quiz.pass_threshold}%</span>
					<button class="btn btn-primary btn-lg" onclick={startQuiz} disabled={!volunteerName}>
						Begin Certification <i class="bi bi-arrow-right ms-2"></i>
					</button>
				</div>
			</div>
		</div>
	{:else if step === 'quiz' || step === 'submitting'}
		<div class="mb-4">
			<h3 class="text-primary">{quiz.title}</h3>
			<p class="text-muted">
				Volunteer: <strong>{volunteerName}</strong>
				{brigadeId ? `(#${brigadeId})` : ''}
			</p>
		</div>

		<form
			method="POST"
			action="?/submit"
			use:enhance={() => {
				step = 'submitting';
				return async ({ update }) => {
					await update();
				};
			}}
		>
			<input type="hidden" name="volunteer_name" value={volunteerName} />
			<input type="hidden" name="brigade_id" value={brigadeId} />
			<input type="hidden" name="answers_json" value={JSON.stringify(userAnswers)} />

			{#each questions as q, index}
				<div class="card shadow-sm mb-4">
					<div class="card-body p-4">
						<h5 class="mb-4">
							<span class="badge bg-secondary me-2">{index + 1}</span>
							{q.text}
						</h5>

						<div class="ms-3">
							{#if q.type === 'true_false'}
								<div class="form-check mb-2">
									<input
										class="form-check-input"
										type="radio"
										name={'q_' + q.id}
										id={'t_' + q.id}
										value="true"
										bind:group={userAnswers[q.id]}
										required
									/>
									<label class="form-check-label fs-5" for={'t_' + q.id}>True</label>
								</div>
								<div class="form-check">
									<input
										class="form-check-input"
										type="radio"
										name={'q_' + q.id}
										id={'f_' + q.id}
										value="false"
										bind:group={userAnswers[q.id]}
										required
									/>
									<label class="form-check-label fs-5" for={'f_' + q.id}>False</label>
								</div>
							{:else if q.type === 'single_choice'}
								{#each q.options as opt}
									<div class="form-check mb-2">
										<input
											class="form-check-input"
											type="radio"
											name={'q_' + q.id}
											id={'opt_' + opt.id}
											value={opt.id}
											bind:group={userAnswers[q.id]}
											required
										/>
										<label class="form-check-label fs-5" for={'opt_' + opt.id}>{opt.text}</label>
									</div>
								{/each}
							{:else if q.type === 'multi_choice'}
								{#each q.options as opt}
									<div class="form-check mb-2">
										<input
											class="form-check-input"
											type="checkbox"
											name={'q_' + q.id}
											id={'opt_' + opt.id}
											value={opt.id}
											bind:group={userAnswers[q.id]}
										/>
										<label class="form-check-label fs-5" for={'opt_' + opt.id}>{opt.text}</label>
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

			<div class="card shadow-sm mt-5">
				<div class="card-body text-center p-4">
					<h5 class="mb-3">Ready to submit?</h5>
					<button
						type="submit"
						class="btn btn-success btn-lg px-5"
						disabled={step === 'submitting'}
					>
						{#if step === 'submitting'}
							<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"
							></span>
							Grading...
						{:else}
							Submit for Grading
						{/if}
					</button>
				</div>
			</div>
		</form>
	{:else if step === 'result'}
		<div class="card shadow border-0 text-center py-5">
			<div class="card-body">
				{#if form?.passed}
					<div class="display-1 text-success mb-3"><i class="bi bi-check-circle-fill"></i></div>
					<h2 class="text-success fw-bold">Certification Passed!</h2>
					<p class="lead">Great job, {volunteerName}. Your skills certification is complete.</p>
				{:else}
					<div class="display-1 text-danger mb-3"><i class="bi bi-x-octagon-fill"></i></div>
					<h2 class="text-danger fw-bold">Certification Failed</h2>
					<p class="lead">Keep reviewing the materials, {volunteerName}.</p>
					<p class="text-muted">You needed a {form?.threshold}% to pass.</p>
				{/if}

				<div
					class="display-4 fw-bold my-4 border py-3 mx-auto rounded bg-light"
					style="max-width: 200px;"
				>
					{form?.score}%
				</div>

				<p class="text-muted small mb-5">
					Your results have been securely recorded and sent to the training officer.
				</p>

				<a href="/" class="btn btn-outline-primary btn-lg">Return to Home</a>
			</div>
		</div>
	{/if}
</div>

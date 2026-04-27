<script lang="ts">
	import { enhance } from '$app/forms';

	let { initialQuiz = {}, initialQuestions = [], isEdit = false } = $props();

	const quiz = $state.snapshot(initialQuiz);
	const questions = $state.snapshot(initialQuestions);

	// Initialize state with passed data or fall back to defaults for creation
	let formState = $state({
		title: quiz.title || '',
		description: quiz.description || '',
		reference_url: quiz.reference_url || '',
		pass_threshold: quiz.pass_threshold || 80,
		// Default to active for new quizzes, or check the database value (handling 1/0 or true/false)
		is_active:
			quiz.is_active !== undefined ? quiz.is_active === 1 || quiz.is_active === true : true,
		questions: questions.length
			? questions
			: ([] as Array<{
					id: string;
					text: string;
					type: string;
					options: Array<{ id: string; text: string }>;
					correctAnswer: string | string[];
				}>)
	});

	// UI states
	let isSubmitting = $state(false);
	let toastMessage = $state('');
	let toastType = $state('danger');

	function addQuestion() {
		formState.questions.push({
			id: crypto.randomUUID(),
			text: '',
			type: 'single_choice',
			options: [
				{ id: 'opt1', text: '' },
				{ id: 'opt2', text: '' }
			],
			correctAnswer: 'opt1'
		});
	}

	function removeQuestion(index) {
		formState.questions.splice(index, 1);
	}

	function addOption(questionIndex) {
		const id = 'opt' + Math.random().toString(36).substring(2, 7);
		formState.questions[questionIndex].options.push({ id, text: '' });
	}

	function removeOption(qIndex, oIndex) {
		formState.questions[qIndex].options.splice(oIndex, 1);
	}

	function handleTypeChange(question) {
		if (question.type === 'multi_choice') {
			question.correctAnswer = [];
		} else if (question.type === 'true_false') {
			question.correctAnswer = 'true';
		} else {
			question.correctAnswer = question.options[0]?.id || '';
		}
	}
</script>

<div class="container py-4">
	<div class="d-flex justify-content-between align-items-center mb-4">
		<h2>{isEdit ? 'Edit Quiz' : 'Create New Certification Quiz'}</h2>

		{#if isEdit}
			<div class="form-check form-switch fs-5">
				<label class="form-check-label" for="statusSwitch">
					{#if formState.is_active}
						<span class="text-success">Active</span>
					{:else}
						<span class="text-secondary">Archived</span>
					{/if}
				</label>
				<input
					class="form-check-input"
					type="checkbox"
					role="switch"
					id="statusSwitch"
					bind:checked={formState.is_active}
				/>
			</div>
		{/if}
	</div>

	<form
		method="POST"
		use:enhance={() => {
			isSubmitting = true;
			toastMessage = ''; // Clear any existing toasts

			return async ({ result, update }) => {
				isSubmitting = false; // Turn off loading state

				if (result.type === 'failure') {
					// Grab the error message you sent from the server, or use a fallback
					toastMessage = result.data?.error || 'An unexpected error occurred while saving.';
					toastType = 'danger';
				}

				// update() tells SvelteKit to finish its default behavior
				// (like redirecting to /admin if the action was a success)
				await update();
			};
		}}
	>
		{#if isEdit}
			<input type="hidden" name="is_active" value={formState.is_active} />
		{/if}

		<div class="card shadow-sm mb-4">
			<div class="card-header bg-light">
				<h5 class="mb-0">Quiz Details</h5>
			</div>
			<div class="card-body">
				<div class="mb-3">
					<label for="title" class="form-label">Quiz Title</label>
					<input
						type="text"
						class="form-control"
						name="title"
						bind:value={formState.title}
						required
						placeholder="e.g. Pump Operations Level 1"
					/>
				</div>

				<div class="row">
					<div class="col-md-8 mb-3">
						<label for="desc" class="form-label">Description</label>
						<input
							type="text"
							class="form-control"
							name="description"
							bind:value={formState.description}
						/>
					</div>
					<div class="col-md-4 mb-3">
						<label for="pass" class="form-label">Pass Threshold (%)</label>
						<input
							type="number"
							class="form-control"
							name="pass_threshold"
							bind:value={formState.pass_threshold}
							min="1"
							max="100"
						/>
					</div>
				</div>

				<div class="mb-3">
					<label for="ref" class="form-label">Reference Material URL</label>
					<input
						type="url"
						class="form-control"
						name="reference_url"
						bind:value={formState.reference_url}
						placeholder="https://brigade-docs.com/manual.pdf"
					/>
				</div>
			</div>
		</div>

		<div class="d-flex justify-content-between align-items-center mb-3">
			<h4>Questions ({formState.questions.length})</h4>
			<button type="button" class="btn btn-secondary btn-sm" onclick={addQuestion}
				>+ Add Question</button
			>
		</div>

		{#each formState.questions as question, qIndex (question.id)}
			<div class="card mb-3 border-start border-4 border-primary">
				<div class="card-body">
					<div class="d-flex justify-content-between mb-2">
						<h6 class="text-primary">Question #{qIndex + 1}</h6>
						<button
							type="button"
							class="btn-close"
							aria-label="Remove"
							onclick={() => removeQuestion(qIndex)}
						></button>
					</div>

					<div class="mb-3">
						<input
							type="text"
							class="form-control"
							placeholder="Enter question text here..."
							bind:value={question.text}
							required
						/>
					</div>

					<div class="mb-3">
						<label class="form-label small text-muted" for="type-{qIndex}">Type</label>
						<select
							class="form-select form-select-sm w-auto"
							id="type-{qIndex}"
							bind:value={question.type}
							onchange={() => handleTypeChange(question)}
						>
							<option value="single_choice">Multiple Choice (Single Answer)</option>
							<option value="multi_choice">Multiple Choice (Multiple Answers)</option>
							<option value="true_false">True / False</option>
						</select>
					</div>

					<div class="ms-4 p-3 bg-light rounded">
						{#if question.type === 'true_false'}
							<div class="form-check">
								<input
									id="q{qIndex}-true"
									class="form-check-input"
									type="radio"
									value="true"
									bind:group={question.correctAnswer}
								/>
								<label class="form-check-label" for="q{qIndex}-true">True</label>
							</div>
							<div class="form-check">
								<input
									id="q{qIndex}-false"
									class="form-check-input"
									type="radio"
									value="false"
									bind:group={question.correctAnswer}
								/>
								<label class="form-check-label" for="q{qIndex}-false">False</label>
							</div>
						{:else}
							{#each question.options as option, oIndex}
								<div class="input-group mb-2">
									<div class="input-group-text">
										{#if question.type === 'single_choice'}
											<input
												class="form-check-input mt-0"
												type="radio"
												name={'correct_' + qIndex}
												value={option.id}
												bind:group={question.correctAnswer}
											/>
										{:else}
											<input
												class="form-check-input mt-0"
												type="checkbox"
												value={option.id}
												bind:group={question.correctAnswer}
											/>
										{/if}
									</div>
									<input
										type="text"
										class="form-control"
										placeholder="Option text"
										bind:value={option.text}
									/>
									<button
										class="btn btn-outline-danger"
										type="button"
										onclick={() => removeOption(qIndex, oIndex)}>X</button
									>
								</div>
							{/each}
							<button
								type="button"
								class="btn btn-link btn-sm text-decoration-none"
								onclick={() => addOption(qIndex)}>+ Add Option</button
							>
						{/if}
					</div>
				</div>
			</div>
		{/each}

		<input type="hidden" name="questions_json" value={JSON.stringify(formState.questions)} />

		<hr class="my-4" />

		<div class="d-grid gap-2 d-md-flex justify-content-md-end">
			<a href="/admin" class="btn btn-light me-md-2">Cancel</a>
			<button type="submit" class="btn {isEdit ? 'btn-primary' : 'btn-success'} btn-lg px-5">
				{isEdit ? 'Save Changes' : 'Save Quiz'}
			</button>
		</div>
	</form>
	{#if toastMessage}
		<div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1055;">
			<div
				class="toast align-items-center text-bg-{toastType} border-0 show"
				role="alert"
				aria-live="assertive"
				aria-atomic="true"
			>
				<div class="d-flex">
					<div class="toast-body">
						{toastMessage}
					</div>
					<button
						type="button"
						class="btn-close btn-close-white me-2 m-auto"
						aria-label="Close"
						onclick={() => (toastMessage = '')}
					></button>
				</div>
			</div>
		</div>
	{/if}
</div>

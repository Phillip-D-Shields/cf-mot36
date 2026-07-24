<script>
	let { data } = $props();
	let quizzes = $derived(data.activeQuizzes || []);

	let searchTerm = $state('');

	let filteredQuizzes = $derived.by(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) return quizzes;
		return quizzes.filter(
			(quiz) =>
				quiz.title?.toLowerCase().includes(term) || quiz.description?.toLowerCase().includes(term)
		);
	});
</script>

<div class="bg-primary text-white py-1 mb-5 mt-3">
	<div class="container text-center py-5">
		<h1 class="display-5 fw-bold">Brigade Certification Portal</h1>
		<p class="lead mb-0">
			Select an operational skills test below to begin your certification or renewal.
		</p>
	</div>
</div>

<div class="container pb-5">
	{#if quizzes.length === 0}
		<div class="text-center py-5">
			<i class="bi bi-clipboard-x display-1 text-muted mb-3"></i>
			<h3 class="text-muted">No Active Certifications</h3>
			<p>There are currently no quizzes available. Please check back later.</p>
		</div>
	{:else}
		<div class="row mb-4">
			<div class="col-md-6 col-lg-4 mx-auto">
				<div class="input-group">
					<span class="input-group-text bg-primary text-white">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
							width="18"
							height="18"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
							/>
						</svg>
					</span>
					<input
						type="search"
						class="form-control"
						placeholder="Search quizzes by name..."
						bind:value={searchTerm}
						aria-label="Search quizzes"
					/>
				</div>
			</div>
		</div>

		{#if filteredQuizzes.length === 0}
			<div class="text-center py-5">
				<i class="bi bi-search display-1 text-muted mb-3"></i>
				<h3 class="text-muted">No matches found</h3>
				<p>Try a different search term.</p>
			</div>
		{:else}
			<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
				{#each filteredQuizzes as quiz (quiz.id)}
					<div class="col">
						<div class="card h-100 shadow-sm hover-shadow transition-all">
							<div class="card-body d-flex flex-column">
								<h5 class="card-title text-primary">{quiz.title}</h5>
								<p class="card-text text-muted flex-grow-1">
									{quiz.description || 'No description provided.'}
								</p>
								<hr class="text-muted" />
								<div class="d-flex justify-content-between align-items-center mb-3">
									<span class="small text-muted">
										<strong>Passing Score:</strong>
										{quiz.pass_threshold}%
									</span>
								</div>
								<a href="/quiz/{quiz.id}" class="btn btn-outline-primary w-100 mt-auto">
									Start Certification
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.hover-shadow:hover {
		transform: translateY(-3px);
		box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
		transition: all 0.3s ease-in-out;
	}
</style>

<script>
	import { enhance } from '$app/forms';
	// Svelte 5 Runes for receiving server data
	let { data } = $props();

	// Automatically update if data changes
	let quizzes = $derived(data.quizzes || []);
	let stats = $derived(data.stats || { total: 0, active: 0 });
	let quizToDelete = $state(null);
</script>

<div class="container py-4">
	<div class="d-flex justify-content-between align-items-center mb-4">
		<div>
			<h1 class="h3 mb-0">Brigade Admin</h1>
			<p class="text-muted small">Certification Management Dashboard</p>
		</div>
		<a href="/admin/create" class="btn btn-primary"> + New Quiz </a>
	</div>

	<div class="row mb-4">
		<div class="col-md-6 col-lg-3 mb-3 mb-lg-0">
			<div class="card shadow-sm border-start border-primary border-4 h-100">
				<div class="card-body">
					<h6 class="text-muted mb-2">Total Quizzes</h6>
					<h3 class="mb-0">{stats.total}</h3>
				</div>
			</div>
		</div>
		<div class="col-md-6 col-lg-3">
			<div class="card shadow-sm border-start border-success border-4 h-100">
				<div class="card-body">
					<h6 class="text-muted mb-2">Active Quizzes</h6>
					<h3 class="mb-0">{stats.active}</h3>
				</div>
			</div>
		</div>
		<div class="col-md-12 col-lg-6 mt-3 mt-lg-0">
			<div
				class="card shadow-sm border-start border-info border-4 h-100 bg-info bg-opacity-10 hover-shadow transition-all"
			>
				<div class="card-body d-flex justify-content-between align-items-center">
					<div>
						<h6 class="text-muted mb-2">Volunteer Submissions</h6>
						<h3 class="mb-0 text-info">View Results</h3>
					</div>
					<a href="/admin/submissions" class="btn btn-info text-white stretched-link">
						Open <i class="bi bi-arrow-right"></i>
					</a>
				</div>
			</div>
		</div>
	</div>

	<div class="container py-4">
		<div class="card shadow-sm">
			<div class="card-header bg-white py-3">
				<h5 class="mb-0">Recent Quizzes</h5>
			</div>
			<div class="card-body p-0">
				{#if quizzes.length === 0}{:else}
					<div class="table-responsive">
						<table class="table table-hover align-middle mb-0">
							<tbody>
								{#each quizzes as quiz}
									<tr>
										<td class="ps-4">
											<div class="fw-bold">{quiz.title}</div>
										</td>
										<td>{quiz.is_active ? 'Active' : 'Archived'}</td>
										<td>{quiz.pass_threshold}%</td>

										<td class="text-end pe-4">
											<div class="btn-group">
												<a href="/admin/edit/{quiz.id}" class="btn btn-sm btn-outline-secondary"
													>Edit</a
												>

												<button
													type="button"
													class="btn btn-sm btn-outline-danger"
													data-bs-toggle="modal"
													data-bs-target="#deleteModal"
													onclick={() => (quizToDelete = quiz)}
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div
		class="modal fade"
		id="deleteModal"
		tabindex="-1"
		aria-labelledby="deleteModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header bg-danger text-white">
					<h5 class="modal-title" id="deleteModalLabel">Confirm Deletion</h5>
					<button
						type="button"
						class="btn-close btn-close-white"
						data-bs-dismiss="modal"
						aria-label="Close"
					></button>
				</div>
				<div class="modal-body">
					<p>Are you sure you want to delete the quiz <strong>"{quizToDelete?.title}"</strong>?</p>
					<p class="text-danger small mb-0">
						<i class="bi bi-exclamation-triangle-fill"></i> This action cannot be undone and will permanently
						erase all associated questions.
					</p>
				</div>
				<div class="modal-footer border-top-0">
					<button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>

					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="id" value={quizToDelete?.id} />
						<button type="submit" class="btn btn-danger" data-bs-dismiss="modal">
							Yes, Delete Quiz
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>

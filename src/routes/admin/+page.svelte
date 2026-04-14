<script lang="ts">
    import { enhance } from '$app/forms';

    let { data } = $props();

    let quizzes = $derived(data.quizzes || []);
    let stats = $derived(data.stats || { total: 0, active: 0 });
    let linkStats = $derived(data.linkStats || { total: 0, byCategory: {} });
    let quizToDelete = $state(null);

    const categoryLabels: Record<string, { label: string, badgeClass: string }> = {
        request: { label: 'Forms', badgeClass: 'text-primary' },
        training: { label: 'Training', badgeClass: 'text-success' },
        defect: { label: 'Defects', badgeClass: 'text-danger' },
        welfare: { label: 'Welfare', badgeClass: 'text-warning' },
        feedback: { label: 'Feedback', badgeClass: 'text-info' }
    };
</script>

<div class="container pt-5 mt-4 pb-5" style="max-width: 960px;">
    <h1 class="fs-4 fw-bold mb-1">Overview</h1>
    <p class="text-secondary small mb-4">Manage certifications, submissions, and brigade resources.</p>

    <!-- Stats -->
    <div class="row g-3 mb-4 text-center">
        <div class="col-sm-4">
            <div class="bg-light rounded-3 p-3">
                <p class="small text-secondary mb-1">Total quizzes</p>
                <p class="fs-4 fw-bold mb-0">{stats.total}</p>
            </div>
        </div>
        <div class="col-sm-4">
            <div class="bg-light rounded-3 p-3">
                <p class="small text-secondary mb-1">Active quizzes</p>
                <p class="fs-4 fw-bold mb-0">{stats.active}</p>
            </div>
        </div>
        <div class="col-sm-4">
            <div class="bg-light rounded-3 p-3">
                <p class="small text-secondary mb-1">Directory links</p>
                <p class="fs-4 fw-bold mb-0">{linkStats.total}</p>
            </div>
        </div>
    </div>

    <!-- Directory breakdown -->
    {#if linkStats.total > 0}
        <div class="d-flex flex-wrap gap-2 mb-4">
            {#each Object.entries(linkStats.byCategory) as [cat, count]}
                {@const config = categoryLabels[cat]}
                {#if config}
                    <span class="badge bg-light text-body-secondary rounded-pill fw-medium px-3 py-2">
                        <i class="bi bi-circle-fill small {config.badgeClass} me-1" style="font-size: 0.5rem; vertical-align: middle;"></i>
                        {config.label}: {count}
                    </span>
                {/if}
            {/each}
        </div>
    {/if}

    <!-- Quick Actions -->
    <p class="fw-semibold text-muted text-uppercase small mb-3" style="letter-spacing: 0.05em; font-size: 0.75rem;">Quick actions</p>

    <a href="/admin/submissions" class="card text-decoration-none mb-2">
        <div class="card-body d-flex align-items-center justify-content-between py-3 px-3">
            <div>
                <p class="fw-semibold mb-0 text-body">Volunteer Submissions</p>
                <p class="small text-secondary mb-0 mt-1">View and manage certification results</p>
            </div>
            <i class="bi bi-arrow-right text-secondary"></i>
        </div>
    </a>

    <a href="/admin/links" class="card text-decoration-none mb-2">
        <div class="card-body d-flex align-items-center justify-content-between py-3 px-3">
            <div>
                <p class="fw-semibold mb-0 text-body">Directory Links</p>
                <p class="small text-secondary mb-0 mt-1">Manage forms, training, and resource links</p>
            </div>
            <i class="bi bi-arrow-right text-secondary"></i>
        </div>
    </a>

    <!-- Quizzes Table -->
    <p class="fw-semibold text-muted text-uppercase small mb-3 mt-4" style="letter-spacing: 0.05em; font-size: 0.75rem;">Certifications</p>

    <div class="card">
        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h2 class="fs-6 fw-semibold mb-0">All Quizzes</h2>
            <a href="/admin/create" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-plus-lg me-1"></i> New
            </a>
        </div>

        {#if quizzes.length === 0}
            <div class="text-center text-secondary py-5 px-3">
                <p class="mb-0">No quizzes yet. Create one to get started.</p>
            </div>
        {:else}
            <div class="list-group list-group-flush">
                {#each quizzes as quiz}
                    <div class="list-group-item d-flex align-items-center justify-content-between gap-3 py-3">
                        <div class="min-vw-0 flex-grow-1">
                            <p class="fw-semibold mb-0">{quiz.title}</p>
                            <p class="small text-secondary mb-0 mt-1">
                                <span class="badge rounded-pill {quiz.is_active === 1 ? 'bg-success-subtle text-success' : 'bg-light text-secondary'}">
                                    {quiz.is_active ? 'Active' : 'Archived'}
                                </span>
                                <span class="ms-1">· Pass: {quiz.pass_threshold}%</span>
                            </p>
                        </div>
                        <div class="d-flex gap-2 flex-shrink-0">
                            <a href="/admin/edit/{quiz.id}" class="btn btn-sm btn-outline-secondary">Edit</a>
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
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<!-- Delete Modal -->
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
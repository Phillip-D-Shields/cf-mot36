<script lang="ts">
    import { enhance } from '$app/forms';

    let { data } = $props();

    let quizzes = $derived(data.quizzes || []);
    let stats = $derived(data.stats || { total: 0, active: 0 });
    let linkStats = $derived(data.linkStats || { total: 0, byCategory: {} });
    let quizToDelete = $state(null);

    const categoryLabels: Record<string, { label: string, color: string }> = {
        request: { label: 'Forms', color: '#0d6efd' },
        training: { label: 'Training', color: '#198754' },
        defect: { label: 'Defects', color: '#dc3545' },
        welfare: { label: 'Welfare', color: '#fd7e14' },
        feedback: { label: 'Feedback', color: '#0dcaf0' }
    };
</script>

<style>
    .dash-container {
        max-width: 960px;
        margin: 0 auto;
        padding: 2rem 1rem 4rem;
    }
    .page-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #212529;
        margin: 0 0 0.25rem;
    }
    .page-subtitle {
        font-size: 0.875rem;
        color: #6c757d;
        margin: 0 0 2rem;
    }
    .section-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6c757d;
        margin-bottom: 0.75rem;
    }
    .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.75rem;
        margin-bottom: 2rem;
    }
    .stat-card {
        background: #f8f9fa;
        border-radius: 0.5rem;
        padding: 1rem 1.25rem;
    }
    .stat-card-label {
        font-size: 0.75rem;
        color: #6c757d;
        margin: 0 0 0.25rem;
    }
    .stat-card-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #212529;
        margin: 0;
    }
    .action-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        background: #fff;
        border: 1px solid #e9ecef;
        border-radius: 0.5rem;
        padding: 1rem 1.25rem;
        margin-bottom: 0.75rem;
        text-decoration: none;
        color: inherit;
        transition: box-shadow 0.15s ease;
    }
    .action-card:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .action-card-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: #212529;
        margin: 0;
    }
    .action-card-desc {
        font-size: 0.8125rem;
        color: #6c757d;
        margin: 0.125rem 0 0;
    }
    .action-card-arrow {
        flex-shrink: 0;
        color: #adb5bd;
    }
    .quiz-table-card {
        background: #fff;
        border: 1px solid #e9ecef;
        border-radius: 0.5rem;
        overflow: hidden;
    }
    .quiz-table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e9ecef;
    }
    .quiz-table-title {
        font-size: 1rem;
        font-weight: 600;
        color: #212529;
        margin: 0;
    }
    .quiz-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.875rem 1.25rem;
        border-bottom: 1px solid #f1f3f5;
    }
    .quiz-row:last-child {
        border-bottom: none;
    }
    .quiz-row-info {
        min-width: 0;
        flex: 1;
    }
    .quiz-row-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: #212529;
        margin: 0;
    }
    .quiz-row-meta {
        font-size: 0.75rem;
        color: #6c757d;
        margin: 0.125rem 0 0;
    }
    .badge-status {
        display: inline-block;
        font-size: 0.6875rem;
        font-weight: 600;
        padding: 0.2rem 0.625rem;
        border-radius: 1rem;
    }
    .badge-active {
        background: #e8f5e9;
        color: #198754;
    }
    .badge-archived {
        background: #f1f3f5;
        color: #6c757d;
    }
    .quiz-row-actions {
        display: flex;
        gap: 0.5rem;
        flex-shrink: 0;
    }
    .btn-sm-clean {
        font-size: 0.8125rem;
        font-weight: 500;
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
        border: 1px solid #dee2e6;
        background: #fff;
        color: #495057;
        cursor: pointer;
        transition: all 0.15s ease;
        text-decoration: none;
    }
    .btn-sm-clean:hover {
        background: #f8f9fa;
        border-color: #c5cdd5;
    }
    .btn-sm-danger {
        color: #dc3545;
        border-color: #f5c6cb;
    }
    .btn-sm-danger:hover {
        background: #fdecea;
        border-color: #dc3545;
    }
    .link-breakdown {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }
    .link-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        padding: 0.25rem 0.625rem;
        border-radius: 1rem;
        background: #f1f3f5;
        color: #495057;
    }
    .link-tag-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }
    .empty-state {
        padding: 3rem 1rem;
        text-align: center;
        color: #6c757d;
    }
</style>

<div class="dash-container">
    <h1 class="page-title">Overview</h1>
    <p class="page-subtitle">Manage certifications, submissions, and brigade resources.</p>

    <!-- Stats -->
    <div class="stat-grid text-center">
        <div class="stat-card">
            <p class="stat-card-label">Total quizzes</p>
            <p class="stat-card-value">{stats.total}</p>
        </div>
        <div class="stat-card">
            <p class="stat-card-label">Active quizzes</p>
            <p class="stat-card-value">{stats.active}</p>
        </div>
        <div class="stat-card">
            <p class="stat-card-label">Directory links</p>
            <p class="stat-card-value">{linkStats.total}</p>
        </div>
    </div>

    <!-- Directory breakdown -->
    {#if linkStats.total > 0}
        <div style="margin-bottom: 2rem;">
            <div class="link-breakdown">
                {#each Object.entries(linkStats.byCategory) as [cat, count]}
                    {@const config = categoryLabels[cat]}
                    {#if config}
                        <span class="link-tag">
                            <span class="link-tag-dot" style="background: {config.color};"></span>
                            {config.label}: {count}
                        </span>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}

    <!-- Quick Actions -->
    <p class="section-label">Quick actions</p>

    <a href="/admin/submissions" class="action-card">
        <div>
            <p class="action-card-title">Volunteer Submissions</p>
            <p class="action-card-desc">View and manage certification results</p>
        </div>
        <i class="bi bi-arrow-right action-card-arrow"></i>
    </a>

    <a href="/admin/links" class="action-card">
        <div>
            <p class="action-card-title">Directory Links</p>
            <p class="action-card-desc">Manage forms, training, and resource links</p>
        </div>
        <i class="bi bi-arrow-right action-card-arrow"></i>
    </a>

    <!-- Quizzes Table -->
    <p class="section-label" style="margin-top: 2rem;">Certifications</p>

    <div class="quiz-table-card">
        <div class="quiz-table-header">
            <h2 class="quiz-table-title">All Quizzes</h2>
            <a href="/admin/create" class="btn-sm-clean" style="color: #0d6efd; border-color: #b6d4fe;">
                <i class="bi bi-plus-lg me-1"></i> New
            </a>
        </div>

        {#if quizzes.length === 0}
            <div class="empty-state">
                <p>No quizzes yet. Create one to get started.</p>
            </div>
        {:else}
            {#each quizzes as quiz}
                <div class="quiz-row">
                    <div class="quiz-row-info">
                        <p class="quiz-row-title">{quiz.title}</p>
                        <p class="quiz-row-meta">
                            <span class="badge-status" class:badge-active={quiz.is_active === 1} class:badge-archived={quiz.is_active !== 1}>
                                {quiz.is_active ? 'Active' : 'Archived'}
                            </span>
                            · Pass: {quiz.pass_threshold}%
                        </p>
                    </div>
                    <div class="quiz-row-actions">
                        <a href="/admin/edit/{quiz.id}" class="btn-sm-clean">Edit</a>
                        <button
                            type="button"
                            class="btn-sm-clean btn-sm-danger"
                            data-bs-toggle="modal"
                            data-bs-target="#deleteModal"
                            onclick={() => (quizToDelete = quiz)}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<!-- Delete Modal (unchanged logic) -->
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
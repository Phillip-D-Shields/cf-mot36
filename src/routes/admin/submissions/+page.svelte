<script lang="ts">
    let { data } = $props();
    let submissions = $derived(data.submissions || []);

    function formatDate(dateString) {
        if (!dateString) return 'Unknown Date';
        const date = new Date(dateString + 'Z'); 
        return date.toLocaleDateString('en-NZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
</script>

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h1 class="h3 mb-0">Submission Records</h1>
            <p class="text-muted small">Review volunteer certification results</p>
        </div>
        <a href="/admin" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left"></i> Back to Dashboard
        </a>
    </div>

    <div class="card shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-0">All Results</h5>
            <span class="badge bg-primary rounded-pill">{submissions.length} Total</span>
        </div>
        <div class="card-body p-0">
            {#if submissions.length === 0}
                <div class="text-center py-5">
                    <i class="bi bi-inbox display-4 text-muted mb-3"></i>
                    <p class="text-muted mb-0">No submissions have been recorded yet.</p>
                </div>
            {:else}
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Date</th>
                                <th>Volunteer</th>
                                <th>Quiz</th>
                                <th class="text-center">Score</th>
                                <th class="text-center pe-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each submissions as sub}
                                <tr>
                                    <td class="ps-4 text-muted small border-bottom-0">
                                        {formatDate(sub.submission_date)}
                                    </td>
                                    <td class="border-bottom-0">
                                        <div class="fw-bold">{sub.volunteer_name}</div>
                                        {#if sub.brigade_id && sub.brigade_id !== 'N/A'}
                                            <div class="small text-muted">ID: {sub.brigade_id}</div>
                                        {/if}
                                    </td>
                                    <td class="border-bottom-0">
                                        {sub.quiz_title || 'Unknown/Deleted Quiz'}
                                    </td>
                                    <td class="text-center fw-bold border-bottom-0">
                                        {sub.score}%
                                    </td>
                                    <td class="text-center pe-4 border-bottom-0">
                                        {#if sub.passed === 1}
                                            <span class="badge bg-success bg-opacity-10 text-success border border-success-subtle px-3 py-2">
                                                <i class="bi bi-check-circle me-1"></i> Pass
                                            </span>
                                        {:else}
                                            <span class="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-3 py-2">
                                                <i class="bi bi-x-circle me-1"></i> Fail
                                            </span>
                                        {/if}
                                    </td>
                                </tr>
                                
                                {#if sub.answers_log && sub.answers_log.length > 0}
                                    {@const incorrectAnswers = sub.answers_log.filter(a => !a.isCorrect)}
                                    {#if incorrectAnswers.length > 0}
                                        <tr>
                                            <td colspan="5" class="pt-0 pb-3 border-bottom">
                                                <details class="ms-4 bg-light p-3 rounded border">
                                                    <summary class="text-danger fw-bold" style="cursor: pointer;">
                                                        <i class="bi bi-exclamation-triangle me-1"></i> Review ${incorrectAnswers.length} Incorrect Answer(s)
                                                    </summary>
                                                    <ul class="mt-3 mb-0 text-muted small" style="list-style-type: none; padding-left: 0;">
                                                        {#each incorrectAnswers as inc}
                                                            <li class="mb-3">
                                                                <strong>Q: {inc.question}</strong><br>
                                                                <span class="text-danger">Volunteer Answered: <em>{inc.userAnswer}</em></span><br>
                                                                <span class="text-success">Correct Answer: <em>{inc.correctAnswer}</em></span>
                                                            </li>
                                                        {/each}
                                                    </ul>
                                                </details>
                                            </td>
                                        </tr>
                                    {:else}
                                        <tr><td colspan="5" class="p-0 border-bottom"></td></tr>
                                    {/if}
                                {:else}
                                    <tr><td colspan="5" class="p-0 border-bottom"></td></tr>
                                {/if}
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    </div>
</div>
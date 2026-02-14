<script>
    let { data } = $props();
    let quizzes = $derived(data.activeQuizzes || []);
</script>

<div class="bg-primary text-white py-5 mb-5">
    <div class="container text-center">
        <h1 class="display-5 fw-bold">Brigade Certification Portal</h1>
        <p class="lead mb-0">Select an operational skills test below to begin your certification or renewal.</p>
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
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {#each quizzes as quiz}
                <div class="col">
                    <div class="card h-100 shadow-sm hover-shadow transition-all">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title text-primary">{quiz.title}</h5>
                            <p class="card-text text-muted flex-grow-1">
                                {quiz.description || 'No description provided.'}
                            </p>
                            <hr class="text-muted">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="small text-muted">
                                    <strong>Passing Score:</strong> {quiz.pass_threshold}%
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
</div>

<style>
    /* Add a little hover effect for the cards to make them feel interactive */
    .hover-shadow:hover {
        transform: translateY(-3px);
        box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
        transition: all 0.3s ease-in-out;
    }
</style>
<script lang="ts">
    let { data } = $props();
    let links = $derived(data.links || []);

    // Configuration for how each category looks to the public
    const categoryConfig: Record<string, { title: string, icon: string, colorClass: string }> = {
        request: { title: 'Forms & Requests', icon: 'bi-file-earmark-text', colorClass: 'text-primary' },
        training: { title: 'Training & Resources', icon: 'bi-journal-bookmark', colorClass: 'text-success' },
        defect: { title: 'Defect Reporting', icon: 'bi-tools', colorClass: 'text-danger' },
        welfare: { title: 'Health & Welfare', icon: 'bi-heart-pulse', colorClass: 'text-warning' },
        feedback: { title: 'Feedback & Suggestions', icon: 'bi-chat-quote', colorClass: 'text-info' }
    };

    // Group the flat array of links into an object categorized by their type
    let groupedLinks = $derived(
        links.reduce((acc, link) => {
            if (!acc[link.category]) {
                acc[link.category] = [];
            }
            acc[link.category].push(link);
            return acc;
        }, {} as Record<string, typeof links>)
    );

    // Ensure we render them in a consistent order, not just the order they appear in the DB
    const displayOrder = ['request', 'training', 'defect', 'welfare', 'feedback'];
</script>

<style>
    .hover-lift {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .hover-lift:hover {
        transform: translateY(-3px);
        box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
    }
</style>

<div class="bg-dark text-white py-5 mb-5 text-center">
    <div class="container py-5">
        <h1 class="display-5 fw-bold mb-3">
            <i class="bi bi-compass me-2"></i>Brigade Directory
        </h1>
        <p class="lead text-white-50 mb-0">Quick access to important forms, training, and resources.</p>
    </div>
</div>

<div class="container pb-5">
    {#if links.length === 0}
        <div class="text-center py-5">
            <i class="bi bi-folder2-open display-1 text-muted mb-3"></i>
            <h3 class="text-muted">Directory is Empty</h3>
            <p class="text-muted">Links will appear here once added by an administrator.</p>
        </div>
    {:else}
        {#each displayOrder as categoryKey}
            {#if groupedLinks[categoryKey] && groupedLinks[categoryKey].length > 0}
                {@const config = categoryConfig[categoryKey]}
                
                <div class="mb-5">
                    <div class="d-flex align-items-center mb-4 border-bottom pb-2">
                        <i class="bi {config.icon} fs-3 {config.colorClass} me-3"></i>
                        <h2 class="h4 mb-0 fw-bold">{config.title}</h2>
                    </div>

                    <div class="row g-4">
                        {#each groupedLinks[categoryKey] as link}
                            <div class="col-md-6 col-lg-4">
                                <div class="card h-100 shadow-sm border-0 hover-lift relative">
                                    <div class="card-body d-flex flex-column">
                                        <h5 class="card-title fw-bold mb-2 text-dark">
                                            {link.title}
                                        </h5>
                                        
                                        {#if link.description}
                                            <p class="card-text text-muted small mb-4">
                                                {link.description}
                                            </p>
                                        {:else}
                                            <p class="card-text text-muted small mb-4 fst-italic">
                                                No description provided.
                                            </p>
                                        {/if}

                                        <div class="mt-auto text-end">
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" class="text-decoration-none fw-bold stretched-link {config.colorClass}">
                                                Open <i class="bi bi-box-arrow-up-right ms-1"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        {/each}
    {/if}
</div>
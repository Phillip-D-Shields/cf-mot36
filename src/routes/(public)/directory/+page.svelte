<script lang="ts">
    let { data } = $props();
    let links = $derived(data.links || []);

    const categoryConfig: Record<string, { title: string, pillLabel: string, icon: string, borderClass: string }> = {
        request: { title: 'Requests & Forms', pillLabel: 'Requests', icon: 'bi-file-earmark-text', borderClass: 'border-primary' },
        training: { title: 'Training & Resources', pillLabel: 'Training', icon: 'bi-journal-bookmark', borderClass: 'border-success' },
        defect: { title: 'Defect Reporting', pillLabel: 'Defects', icon: 'bi-tools', borderClass: 'border-danger' },
        welfare: { title: 'Health & Welfare', pillLabel: 'Welfare', icon: 'bi-heart-pulse', borderClass: 'border-warning' },
        feedback: { title: 'Feedback & Suggestions', pillLabel: 'Feedback', icon: 'bi-chat-quote', borderClass: 'border-info' }
    };

    let activeCategory = $state('all');

    let groupedLinks = $derived(
        links.reduce((acc, link) => {
            if (!acc[link.category]) {
                acc[link.category] = [];
            }
            acc[link.category].push(link);
            return acc;
        }, {} as Record<string, typeof links>)
    );

    const displayOrder = ['request', 'training', 'defect', 'welfare', 'feedback'];

    let availableCategories = $derived(
        displayOrder.filter(key => groupedLinks[key] && groupedLinks[key].length > 0)
    );

    let visibleCategories = $derived(
        activeCategory === 'all'
            ? availableCategories
            : availableCategories.filter(key => key === activeCategory)
    );
</script>

<div class="bg-dark text-white py-1 mb-4 text-center" style="margin-top: 56px;">
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
        <!-- Filter Pills -->
        <div class="d-flex flex-wrap gap-2 mb-4">
            <button
                class="btn btn-sm rounded-pill {activeCategory === 'all' ? 'btn-dark' : 'btn-outline-secondary'}"
                onclick={() => activeCategory = 'all'}
            >
                All
            </button>
            {#each availableCategories as categoryKey}
                {@const config = categoryConfig[categoryKey]}
                <button
                    class="btn btn-sm rounded-pill {activeCategory === categoryKey ? 'btn-dark' : 'btn-outline-secondary'}"
                    onclick={() => activeCategory = categoryKey}
                >
                    <i class="bi {config.icon} me-1"></i>
                    {config.pillLabel}
                </button>
            {/each}
        </div>

        <!-- Category Sections -->
        {#each visibleCategories as categoryKey}
            {@const config = categoryConfig[categoryKey]}

            <div class="mb-4">
                <h2 class="fw-bold text-muted text-uppercase small mb-3" style="letter-spacing: 0.05em; font-size: 0.75rem;">
                    {config.title}
                </h2>

                <div class="d-flex flex-column gap-2">
                    {#each groupedLinks[categoryKey] as link}
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="card text-decoration-none border-start border-3 {config.borderClass}"
                        >
                            <div class="card-body d-flex align-items-center justify-content-between gap-3 py-3 px-3">
                                <div class="min-vw-0">
                                    <p class="fw-semibold mb-0 text-body">{link.title}</p>
                                    {#if link.description}
                                        <p class="small text-secondary mb-0 mt-1">{link.description}</p>
                                    {/if}
                                </div>
                                <i class="bi bi-box-arrow-up-right text-secondary flex-shrink-0"></i>
                            </div>
                        </a>
                    {/each}
                </div>
            </div>
        {/each}
    {/if}
</div>
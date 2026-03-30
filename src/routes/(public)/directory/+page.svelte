<script lang="ts">
    let { data } = $props();
    let links = $derived(data.links || []);

    const categoryConfig: Record<string, { title: string, pillLabel: string, icon: string, accentColor: string }> = {
        request: { title: 'Forms & Requests', pillLabel: 'Forms', icon: 'bi-file-earmark-text', accentColor: '#0d6efd' },
        training: { title: 'Training & Resources', pillLabel: 'Training', icon: 'bi-journal-bookmark', accentColor: '#198754' },
        defect: { title: 'Defect Reporting', pillLabel: 'Defects', icon: 'bi-tools', accentColor: '#dc3545' },
        welfare: { title: 'Health & Welfare', pillLabel: 'Welfare', icon: 'bi-heart-pulse', accentColor: '#fd7e14' },
        feedback: { title: 'Feedback & Suggestions', pillLabel: 'Feedback', icon: 'bi-chat-quote', accentColor: '#0dcaf0' }
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

<style>
    .filter-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    .filter-pill {
        border: none;
        background: transparent;
        color: #6c757d;
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .filter-pill:hover {
        background: #e9ecef;
        color: #212529;
    }
    .filter-pill.active {
        background: #212529;
        color: #fff;
    }
    .link-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        background: #fff;
        border: 1px solid #e9ecef;
        border-left: 3px solid var(--accent);
        border-radius: 0.5rem;
        padding: 0.875rem 1rem;
        text-decoration: none;
        color: inherit;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .link-card:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        border-color: #dee2e6;
        border-left-color: var(--accent);
    }
    .link-card-title {
        font-size: 0.9375rem;
        font-weight: 600;
        margin: 0;
        color: #212529;
    }
    .link-card-desc {
        font-size: 0.8125rem;
        color: #6c757d;
        margin: 0.2rem 0 0;
    }
    .link-card-arrow {
        flex-shrink: 0;
        color: #adb5bd;
    }
</style>

<div class="bg-dark text-white py-5 mb-4 text-center">
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
        <div class="filter-tabs mb-4">
            <button
                class="filter-pill"
                class:active={activeCategory === 'all'}
                onclick={() => activeCategory = 'all'}
            >
                All
            </button>
            {#each availableCategories as categoryKey}
                {@const config = categoryConfig[categoryKey]}
                <button
                    class="filter-pill"
                    class:active={activeCategory === categoryKey}
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
                <div class="d-flex align-items-center mb-3">
                    <h2 class="h6 mb-0 fw-bold text-muted text-uppercase" style="letter-spacing: 0.05em; font-size: 0.75rem;">
                        {config.title}
                    </h2>
                </div>

                <div class="d-flex flex-column gap-2">
                    {#each groupedLinks[categoryKey] as link}
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="link-card"
                            style="--accent: {config.accentColor};"
                        >
                            <div style="min-width: 0;">
                                <p class="link-card-title">{link.title}</p>
                                {#if link.description}
                                    <p class="link-card-desc">{link.description}</p>
                                {/if}
                            </div>
                            <i class="bi bi-box-arrow-up-right link-card-arrow"></i>
                        </a>
                    {/each}
                </div>
            </div>
        {/each}
    {/if}
</div>
<script lang="ts">
    import { page } from '$app/state';
    let { children } = $props();
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
    <div class="container">
        <a class="navbar-brand fw-bold" href="/">
            <i class="bi bi-shield-fill-check me-2"></i>Brigade Portal
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#publicNavbar">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="publicNavbar">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-link" class:active={page.url.pathname === '/'} href="/">
                        Home
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" class:active={page.url.pathname.startsWith('/quiz')} href="/quiz">
                        Certifications
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" class:active={page.url.pathname.startsWith('/directory')} href="/directory">
                        Directory
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>

<main class="min-vh-100 bg-light">
    {@render children()}
</main>

<footer class="bg-dark text-light py-4 text-center">
    <div class="container">
        <p class="mb-0 small text-white-50">© {new Date().getFullYear()} Brigade Portal. All rights reserved.</p>
    </div>
</footer>
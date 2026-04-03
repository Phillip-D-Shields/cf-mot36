<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
	<div class="container">
		<a class="navbar-brand fw-bold" href="/admin">
			<i class="bi bi-shield-shaded"></i>MOT36 Admin
		</a>

		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#adminNavbar"
			aria-controls="adminNavbar"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>

		<div class="collapse navbar-collapse" id="adminNavbar">
			<ul class="navbar-nav ms-auto mb-2 mb-lg-0">
				<li class="nav-item">
					<a class="nav-link" class:active={page.url.pathname === '/admin'} href="/admin">
						Dashboard
					</a>
				</li>
				<li class="nav-item">
					<a
						class="nav-link"
						class:active={page.url.pathname === '/admin/create'}
						href="/admin/create"
					>
						+ Create Quiz
					</a>
				</li>
				<li class="nav-item">
					<a
						class="nav-link"
						class:active={page.url.pathname.startsWith('/admin/submissions')}
						href="/admin/submissions"
					>
						Submissions
					</a>
				</li>
				<li class="nav-item">
					<a
						class="nav-link"
						class:active={page.url.pathname.startsWith('/admin/links')}
						href="/admin/links"
					>
						Directory
					</a>
				</li>
			</ul>
		</div>
	</div>
</nav>

<main class="bg-light min-vh-100 pb-5">
	{@render children()}
</main>

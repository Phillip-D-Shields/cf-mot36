<script lang="ts">
	import { enhance } from '$app/forms';
	import QRCode from 'qrcode';

	let { data } = $props();
	let links = $derived(data.links || []);

	// State for modals
	let editingLink = $state<{
		id?: number;
		title: string;
		url: string;
		category: string;
		description: string;
	}>({
		title: '',
		url: '',
		category: 'request',
		description: ''
	});
	let linkToDelete = $state<{ id: number; title: string } | null>(null);

	const categories = ['request', 'training', 'feedback', 'defect', 'welfare'];

	// Helper to format category for badges
	function formatCategory(cat: string) {
		return cat.charAt(0).toUpperCase() + cat.slice(1);
	}

	// Helper to assign specific colors to categories
	function getCategoryBadge(cat: string) {
		const styles: Record<string, string> = {
			request: 'bg-primary bg-opacity-10 text-primary border-primary-subtle',
			training: 'bg-success bg-opacity-10 text-success border-success-subtle',
			feedback: 'bg-info bg-opacity-10 text-info border-info-subtle',
			defect: 'bg-danger bg-opacity-10 text-danger border-danger-subtle',
			welfare: 'bg-warning bg-opacity-10 text-warning border-warning-subtle'
		};
		return `badge border px-3 py-2 ${styles[cat] || 'bg-secondary'}`;
	}

	function openAddModal() {
		editingLink = { title: '', url: '', category: 'request', description: '' };
	}

	function openEditModal(link: any) {
		editingLink = { ...link };
	}

	// generate and download the QR code on the fly
	async function downloadQR(link: { title: string; url: string }) {
		try {
			// Generate a 300x300 PNG data URL
			const qrDataUrl = await QRCode.toDataURL(link.url, {
				width: 300,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#ffffff'
				}
			});

			// Create a temporary, invisible link element to trigger the download
			const downloadLink = document.createElement('a');
			downloadLink.href = qrDataUrl;
			// Create a clean filename like "pump-training-qr.png"
			downloadLink.download = `${link.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-qr.png`;

			// Append, click, and clean up
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
		} catch (error) {
			console.error('Failed to generate QR code:', error);
			alert('There was an error generating the QR code.');
		}
	}
</script>

<div class="container py-4">
	<div class="d-flex justify-content-between align-items-center mb-4">
		<div>
			<h1 class="h3 mb-0">Link Directory</h1>
			<p class="text-muted small">Manage external resources and forms</p>
		</div>
		<button
			class="btn btn-primary shadow-sm"
			data-bs-toggle="modal"
			data-bs-target="#linkModal"
			onclick={openAddModal}
		>
			+ Add Link
		</button>
	</div>

	<div class="card shadow-sm">
		<div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
			<h5 class="mb-0">Directory</h5>
			<span class="badge bg-primary rounded-pill">{links.length} Links</span>
		</div>
		<div class="card-body p-0">
			{#if links.length === 0}
				<div class="text-center py-5">
					<i class="bi bi-link-45deg display-4 text-muted mb-3"></i>
					<p class="text-muted mb-0">No links have been added yet.</p>
				</div>
			{:else}
				<div class="table-responsive">
					<table class="table table-hover align-middle mb-0">
						<thead class="table-light">
							<tr>
								<th class="ps-4">Resource</th>
								<th>Category</th>
								<th>URL</th>
								<th class="text-end pe-4">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each links as link}
								<tr>
									<td class="ps-4 border-bottom-0 py-3">
										<div class="fw-bold">{link.title}</div>
										{#if link.description}
											<div class="small text-muted mt-1">{link.description}</div>
										{/if}
									</td>
									<td class="border-bottom-0">
										<span class={getCategoryBadge(link.category)}>
											{formatCategory(link.category)}
										</span>
									</td>
									<td class="border-bottom-0">
										<a
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											class="text-decoration-none small text-truncate d-inline-block"
											style="max-width: 250px;"
										>
											{link.url}
										</a>
									</td>
									<td class="text-end pe-4 border-bottom-0">
										<div class="btn-group">
											<button
												class="btn btn-sm btn-outline-primary"
												title="Download QR Code"
												onclick={() => downloadQR(link)}
											>
												<i class="bi bi-qr-code"></i> QR
											</button>
											<button
												class="btn btn-sm btn-outline-secondary"
												data-bs-toggle="modal"
												data-bs-target="#linkModal"
												onclick={() => openEditModal(link)}
											>
												Edit
											</button>
											<button
												class="btn btn-sm btn-outline-danger"
												data-bs-toggle="modal"
												data-bs-target="#deleteModal"
												onclick={() => (linkToDelete = link)}
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

<div class="modal fade" id="linkModal" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<form
				method="POST"
				action="?/save"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						// Optional: Close modal automatically via JS if desired,
						// Bootstrap usually requires manual hide unless using data-bs-dismiss on submit
					};
				}}
			>
				<div class="modal-header">
					<h5 class="modal-title">{editingLink?.id ? 'Edit Link' : 'Add New Link'}</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
					></button>
				</div>
				<div class="modal-body">
					{#if editingLink?.id}
						<input type="hidden" name="id" value={editingLink.id} />
					{/if}

					<div class="mb-3">
						<label for="title" class="form-label">Title</label>
						<input
							type="text"
							class="form-control"
							name="title"
							bind:value={editingLink.title}
							required
						/>
					</div>

					<div class="mb-3">
						<label for="url" class="form-label">URL</label>
						<input
							type="url"
							class="form-control"
							name="url"
							bind:value={editingLink.url}
							placeholder="https://..."
							required
						/>
					</div>

					<div class="mb-3">
						<label for="category" class="form-label">Category</label>
						<select class="form-select" name="category" bind:value={editingLink.category}>
							{#each categories as cat}
								<option value={cat}>{formatCategory(cat)}</option>
							{/each}
						</select>
					</div>

					<div class="mb-3">
						<label for="description" class="form-label">
							Description <span class="text-muted small">(Optional)</span></label
						>
						<textarea
							class="form-control"
							name="description"
							rows="2"
							bind:value={editingLink.description}
						></textarea>
					</div>
				</div>
				<div class="modal-footer bg-light">
					<button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
					<button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Save Link</button>
				</div>
			</form>
		</div>
	</div>
</div>

<div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header bg-danger text-white">
				<h5 class="modal-title">Confirm Deletion</h5>
				<button
					type="button"
					class="btn-close btn-close-white"
					data-bs-dismiss="modal"
					aria-label="Close"
				></button>
			</div>
			<div class="modal-body">
				<p>Are you sure you want to delete the link <strong>"{linkToDelete?.title}"</strong>?</p>
				<p class="text-danger small mb-0">This action cannot be undone.</p>
			</div>
			<div class="modal-footer border-top-0">
				<button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
				<form method="POST" action="?/delete" use:enhance>
					<input type="hidden" name="id" value={linkToDelete?.id} />
					<button type="submit" class="btn btn-danger" data-bs-dismiss="modal">Yes, Delete</button>
				</form>
			</div>
		</div>
	</div>
</div>

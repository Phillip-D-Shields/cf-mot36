<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
	let volunteers = $derived(data.volunteers || []);

	let editingVolunteer = $state<{
		id?: number;
		name: string;
		rank: string;
		license_class: string;
		phone: string;
	}>({
		name: '',
		rank: 'Firefighter',
		license_class: 'Full',
		phone: ''
	});
	let volunteerToDelete = $state<{ id: number; name: string } | null>(null);

	function getLicenseBadge(license: string) {
		const styles: Record<string, string> = {
			Learner: 'bg-secondary bg-opacity-10 text-secondary border-secondary-subtle',
			Full: 'bg-info bg-opacity-10 text-info border-info-subtle',
			'Class 2 Learner': 'bg-warning bg-opacity-10 text-warning border-warning-subtle',
			'Class 2': 'bg-primary bg-opacity-10 text-primary border-primary-subtle',
			'Class 4 Learner': 'bg-warning bg-opacity-10 text-warning border-warning-subtle',
			'Class 4': 'bg-success bg-opacity-10 text-success border-success-subtle'
		};
		return `badge border px-3 py-2 ${styles[license] || 'bg-secondary'}`;
	}

	function getRankBadge(rank: string) {
		const styles: Record<string, string> = {
			'Firefighter': 'bg-secondary bg-opacity-10 text-secondary border-secondary-subtle',
			'Senior Firefighter': 'bg-secondary bg-opacity-10 text-secondary border-secondary-subtle',
			'Qualified Firefighter': 'bg-primary bg-opacity-10 text-primary border-primary-subtle',
			'Station Officer': 'bg-danger bg-opacity-10 text-danger border-danger-subtle',
			'Senior Station Officer': 'bg-danger bg-opacity-10 text-danger border-danger-subtle',
			'Chief Fire Officer': 'bg-danger bg-opacity-10 text-danger border-danger-subtle'
		};
		return `badge border px-3 py-2 ${styles[rank] || 'bg-secondary'}`;
	}

	function openAddModal() {
		editingVolunteer = {
			name: '',
			rank: 'Firefighter',
			license_class: 'Full',
			phone: ''
		};
	}

	function openEditModal(volunteer: any) {
		editingVolunteer = { ...volunteer };
	}
</script>

<svelte:head>
	<title>Volunteers | MOT36 Admin</title>
</svelte:head>

<div class="container py-4">
	<div class="d-flex justify-content-between align-items-center mb-4">
		<div>
			<h1 class="h3 mb-0">Volunteers</h1>
			<p class="text-muted small">Manage brigade members and qualifications</p>
		</div>
		<button
			class="btn btn-primary shadow-sm"
			data-bs-toggle="modal"
			data-bs-target="#volunteerModal"
			onclick={openAddModal}
		>
			+ Add Volunteer
		</button>
	</div>

	<div class="card shadow-sm">
		<div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
			<h5 class="mb-0">Roster</h5>
			<span class="badge bg-primary rounded-pill">{volunteers.length} Member{volunteers.length !== 1 ? 's' : ''}</span>
		</div>
		<div class="card-body p-0">
			{#if volunteers.length === 0}
				<div class="text-center py-5">
					<p class="text-muted mb-0">No volunteers have been added yet.</p>
				</div>
			{:else}
				<div class="table-responsive">
					<table class="table table-hover align-middle mb-0">
						<thead class="table-light">
							<tr>
								<th class="ps-4">Name</th>
								<th>Rank</th>
								<th>License</th>
								<th>Phone</th>
								<th class="text-end pe-4">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each volunteers as vol}
								<tr>
									<td class="ps-4 border-bottom-0 py-3">
										<div class="fw-bold">{vol.name}</div>
									</td>
									<td class="border-bottom-0">
										<span class={getRankBadge(vol.rank)}>
											{vol.rank}
										</span>
									</td>
									<td class="border-bottom-0">
										<span class={getLicenseBadge(vol.license_class)}>
											{vol.license_class}
										</span>
									</td>
									<td class="border-bottom-0">
										{#if vol.phone}
											<a href="tel:{vol.phone}" class="text-decoration-none small">{vol.phone}</a>
										{:else}
											<span class="text-muted small">—</span>
										{/if}
									</td>
									<td class="text-end pe-4 border-bottom-0">
										<div class="btn-group">
											<button
												class="btn btn-sm btn-outline-secondary"
												data-bs-toggle="modal"
												data-bs-target="#volunteerModal"
												onclick={() => openEditModal(vol)}
											>
												Edit
											</button>
											<button
												class="btn btn-sm btn-outline-danger"
												data-bs-toggle="modal"
												data-bs-target="#deleteModal"
												onclick={() => (volunteerToDelete = vol)}
											>
												Remove
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

<!-- Add/Edit Volunteer Modal -->
<div class="modal fade" id="volunteerModal" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<form
				method="POST"
				action="?/save"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
					};
				}}
			>
				<div class="modal-header">
					<h5 class="modal-title">{editingVolunteer?.id ? 'Edit Volunteer' : 'Add New Volunteer'}</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					{#if editingVolunteer?.id}
						<input type="hidden" name="id" value={editingVolunteer.id} />
					{/if}

					<div class="mb-3">
						<label for="name" class="form-label">Name</label>
						<input
							type="text"
							class="form-control"
							name="name"
							bind:value={editingVolunteer.name}
							required
						/>
					</div>

					<div class="mb-3">
						<label for="phone" class="form-label">
							Phone <span class="text-muted small">(Optional)</span>
						</label>
						<input
							type="tel"
							class="form-control"
							name="phone"
							bind:value={editingVolunteer.phone}
							placeholder="e.g. 027 123 4567"
						/>
					</div>

					<div class="row g-3 mb-3">
						<div class="col-6">
							<label for="rank" class="form-label">Rank</label>
							<select class="form-select" name="rank" bind:value={editingVolunteer.rank}>
								{#each data.ranks as rank}
									<option value={rank}>{rank}</option>
								{/each}
							</select>
						</div>
						<div class="col-6">
							<label for="license_class" class="form-label">License Class</label>
							<select class="form-select" name="license_class" bind:value={editingVolunteer.license_class}>
								{#each data.licenseClasses as lc}
									<option value={lc}>{lc}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
				<div class="modal-footer bg-light">
					<button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
					<button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Save Volunteer</button>
				</div>
			</form>
		</div>
	</div>
</div>

<!-- Delete Confirmation Modal -->
<div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header bg-danger text-white">
				<h5 class="modal-title">Confirm Removal</h5>
				<button
					type="button"
					class="btn-close btn-close-white"
					data-bs-dismiss="modal"
					aria-label="Close"
				></button>
			</div>
			<div class="modal-body">
				<p>Are you sure you want to remove <strong>"{volunteerToDelete?.name}"</strong> from the roster?</p>
				<p class="text-muted small mb-0">They will be deactivated and can be restored later.</p>
			</div>
			<div class="modal-footer border-top-0">
				<button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
				<form method="POST" action="?/delete" use:enhance>
					<input type="hidden" name="id" value={volunteerToDelete?.id} />
					<button type="submit" class="btn btn-danger" data-bs-dismiss="modal">Yes, Remove</button>
				</form>
			</div>
		</div>
	</div>
</div>
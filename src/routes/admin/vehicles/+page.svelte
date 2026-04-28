<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
	let vehicles = $derived(data.vehicles || []);

	let editingVehicle = $state<{
		id?: number;
		name: string;
		callsign: string;
		type: string;
		license_required: string;
		seat_count: number;
		min_crew: number;
		notes: string;
	}>({
		name: '',
		callsign: '',
		type: 'appliance',
		license_required: 'Class 2',
		seat_count: 6,
		min_crew: 4,
		notes: ''
	});
	let vehicleToDelete = $state<{ id: number; name: string } | null>(null);

	function formatType(type: string) {
		return type.charAt(0).toUpperCase() + type.slice(1);
	}

	function getTypeBadge(type: string) {
		const styles: Record<string, string> = {
			appliance: 'bg-danger bg-opacity-10 text-danger border-danger-subtle',
			tanker: 'bg-primary bg-opacity-10 text-primary border-primary-subtle',
			van: 'bg-success bg-opacity-10 text-success border-success-subtle',
			support: 'bg-info bg-opacity-10 text-info border-info-subtle'
		};
		return `badge border px-3 py-2 ${styles[type] || 'bg-secondary'}`;
	}

	function getLicenseBadge(license: string) {
		const styles: Record<string, string> = {
			Full: 'bg-info bg-opacity-10 text-info border-info-subtle',
			'Class 2': 'bg-primary bg-opacity-10 text-primary border-primary-subtle',
			'Class 4': 'bg-success bg-opacity-10 text-success border-success-subtle'
		};
		return `badge border px-3 py-2 ${styles[license] || 'bg-secondary'}`;
	}

	function openAddModal() {
		editingVehicle = {
			name: '',
			callsign: '',
			type: 'appliance',
			license_required: 'Class 2',
			seat_count: 6,
			min_crew: 4,
			notes: ''
		};
	}

	function openEditModal(vehicle: any) {
		editingVehicle = { ...vehicle };
	}
</script>

<svelte:head>
	<title>Vehicles | MOT36 Admin</title>
</svelte:head>

<div class="container py-4">
	<div class="d-flex justify-content-between align-items-center mb-4">
		<div>
			<h1 class="h3 mb-0">Vehicles</h1>
			<p class="text-muted small">Manage brigade appliances and support vehicles</p>
		</div>
		<button
			class="btn btn-primary shadow-sm"
			data-bs-toggle="modal"
			data-bs-target="#vehicleModal"
			onclick={openAddModal}
		>
			+ Add Vehicle
		</button>
	</div>

	<div class="card shadow-sm">
		<div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
			<h5 class="mb-0">Fleet</h5>
			<span class="badge bg-primary rounded-pill">{vehicles.length} Vehicle{vehicles.length !== 1 ? 's' : ''}</span>
		</div>
		<div class="card-body p-0">
			{#if vehicles.length === 0}
				<div class="text-center py-5">
					<p class="text-muted mb-0">No vehicles have been added yet.</p>
				</div>
			{:else}
				<div class="table-responsive">
					<table class="table table-hover align-middle mb-0">
						<thead class="table-light">
							<tr>
								<th class="ps-4">Vehicle</th>
								<th>Type</th>
								<th>License Required</th>
								<th>Crew</th>
								<th class="text-end pe-4">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each vehicles as vehicle}
								<tr>
									<td class="ps-4 border-bottom-0 py-3">
										<div class="fw-bold">
											{vehicle.name}
											{#if vehicle.callsign}
												<span class="text-muted fw-normal ms-1">({vehicle.callsign})</span>
											{/if}
										</div>
										{#if vehicle.notes}
											<div class="small text-muted mt-1">{vehicle.notes}</div>
										{/if}
									</td>
									<td class="border-bottom-0">
										<span class={getTypeBadge(vehicle.type)}>
											{formatType(vehicle.type)}
										</span>
									</td>
									<td class="border-bottom-0">
										<span class={getLicenseBadge(vehicle.license_required)}>
											{vehicle.license_required}
										</span>
									</td>
									<td class="border-bottom-0">
										<span class="text-muted small">
											{vehicle.min_crew} min / {vehicle.seat_count} max
										</span>
									</td>
									<td class="text-end pe-4 border-bottom-0">
										<div class="btn-group">
											<button
												class="btn btn-sm btn-outline-secondary"
												data-bs-toggle="modal"
												data-bs-target="#vehicleModal"
												onclick={() => openEditModal(vehicle)}
											>
												Edit
											</button>
											<button
												class="btn btn-sm btn-outline-danger"
												data-bs-toggle="modal"
												data-bs-target="#deleteModal"
												onclick={() => (vehicleToDelete = vehicle)}
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

<!-- Add/Edit Vehicle Modal -->
<div class="modal fade" id="vehicleModal" tabindex="-1" aria-hidden="true">
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
					<h5 class="modal-title">{editingVehicle?.id ? 'Edit Vehicle' : 'Add New Vehicle'}</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					{#if editingVehicle?.id}
						<input type="hidden" name="id" value={editingVehicle.id} />
					{/if}

					<div class="mb-3">
						<label for="name" class="form-label">Name</label>
						<input
							type="text"
							class="form-control"
							name="name"
							bind:value={editingVehicle.name}
							placeholder="e.g. Appliance 367"
							required
						/>
					</div>

					<div class="mb-3">
						<label for="callsign" class="form-label">
							Callsign <span class="text-muted small">(Optional)</span>
						</label>
						<input
							type="text"
							class="form-control"
							name="callsign"
							bind:value={editingVehicle.callsign}
							placeholder="e.g. 367"
						/>
					</div>

					<div class="row g-3 mb-3">
						<div class="col-6">
							<label for="type" class="form-label">Type</label>
							<select class="form-select" name="type" bind:value={editingVehicle.type}>
								{#each data.vehicleTypes as t}
									<option value={t}>{formatType(t)}</option>
								{/each}
							</select>
						</div>
						<div class="col-6">
							<label for="license_required" class="form-label">License Required</label>
							<select class="form-select" name="license_required" bind:value={editingVehicle.license_required}>
								{#each data.licenseOptions as lc}
									<option value={lc}>{lc}</option>
								{/each}
							</select>
						</div>
					</div>

					<div class="row g-3 mb-3">
						<div class="col-6">
							<label for="seat_count" class="form-label">Max Seats</label>
							<input
								type="number"
								class="form-control"
								name="seat_count"
								bind:value={editingVehicle.seat_count}
								min="1"
								max="20"
								required
							/>
						</div>
						<div class="col-6">
							<label for="min_crew" class="form-label">Min Crew</label>
							<input
								type="number"
								class="form-control"
								name="min_crew"
								bind:value={editingVehicle.min_crew}
								min="1"
								max="20"
								required
							/>
						</div>
					</div>

					<div class="mb-3">
						<label for="notes" class="form-label">
							Notes <span class="text-muted small">(Optional)</span>
						</label>
						<textarea
							class="form-control"
							name="notes"
							rows="2"
							bind:value={editingVehicle.notes}
							placeholder="e.g. Seating arrangement, special requirements"
						></textarea>
					</div>
				</div>
				<div class="modal-footer bg-light">
					<button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
					<button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Save Vehicle</button>
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
				<h5 class="modal-title">Confirm Deletion</h5>
				<button
					type="button"
					class="btn-close btn-close-white"
					data-bs-dismiss="modal"
					aria-label="Close"
				></button>
			</div>
			<div class="modal-body">
				<p>Are you sure you want to remove <strong>"{vehicleToDelete?.name}"</strong> from the fleet?</p>
				<p class="text-muted small mb-0">The vehicle will be deactivated and can be restored later.</p>
			</div>
			<div class="modal-footer border-top-0">
				<button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
				<form method="POST" action="?/delete" use:enhance>
					<input type="hidden" name="id" value={vehicleToDelete?.id} />
					<button type="submit" class="btn btn-danger" data-bs-dismiss="modal">Yes, Remove</button>
				</form>
			</div>
		</div>
	</div>
</div>
import { VEHICLE_TYPES, LICENSE_REQUIRED_OPTIONS } from '$lib/roster';

export async function load({ platform }) {
    if (!platform?.env?.DB) {
        return { vehicles: [], vehicleTypes: VEHICLE_TYPES, licenseOptions: LICENSE_REQUIRED_OPTIONS };
    }

    try {
        const result = await platform.env.DB.prepare(`
            SELECT * FROM vehicles WHERE active = 1 ORDER BY name ASC
        `).all();

        return {
            vehicles: result.results,
            vehicleTypes: VEHICLE_TYPES,
            licenseOptions: LICENSE_REQUIRED_OPTIONS
        };
    } catch (error) {
        console.error("Database error fetching vehicles:", error);
        return { vehicles: [], vehicleTypes: VEHICLE_TYPES, licenseOptions: LICENSE_REQUIRED_OPTIONS };
    }
}

export const actions = {
    save: async ({ request, platform }) => {
        if (!platform?.env?.DB) return { success: false, message: "Database connection missing" };

        const data = await request.formData();
        const id = data.get('id')?.toString();
        const name = data.get('name')?.toString();
        const callsign = data.get('callsign')?.toString() || null;
        const type = data.get('type')?.toString();
        const license_required = data.get('license_required')?.toString();
        const seat_count = parseInt(data.get('seat_count')?.toString() || '6');
        const min_crew = parseInt(data.get('min_crew')?.toString() || '2');
        const notes = data.get('notes')?.toString() || null;

        if (!name || !type || !license_required) {
            return { success: false, message: "Missing required fields" };
        }

        try {
            if (id) {
                await platform.env.DB.prepare(
                    `UPDATE vehicles SET name = ?, callsign = ?, type = ?, license_required = ?, 
                     seat_count = ?, min_crew = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`
                ).bind(name, callsign, type, license_required, seat_count, min_crew, notes, id).run();
            } else {
                await platform.env.DB.prepare(
                    `INSERT INTO vehicles (name, callsign, type, license_required, seat_count, min_crew, notes) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`
                ).bind(name, callsign, type, license_required, seat_count, min_crew, notes).run();
            }
            return { success: true };
        } catch (error) {
            console.error("Error saving vehicle:", error);
            return { success: false, message: "Failed to save vehicle." };
        }
    },

    delete: async ({ request, platform }) => {
        if (!platform?.env?.DB) return { success: false, message: "Database connection missing" };

        const data = await request.formData();
        const id = data.get('id')?.toString();

        if (!id) return { success: false, message: "No ID provided" };

        try {
            // Soft delete
            await platform.env.DB.prepare(
                `UPDATE vehicles SET active = 0, updated_at = datetime('now') WHERE id = ?`
            ).bind(id).run();
            return { success: true };
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            return { success: false, message: "Failed to delete vehicle." };
        }
    }
};
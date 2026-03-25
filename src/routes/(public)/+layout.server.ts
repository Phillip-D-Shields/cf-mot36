import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
    // Check if our 30-day auth cookie exists
    const isAuthenticated = cookies.get('brigade_auth') === 'true';

    if (!isAuthenticated) {
        // If not, bounce them to the login page
        throw redirect(303, '/login');
    }

    return {};
};
import { fail, redirect } from '@sveltejs/kit';
import { BRIGADE_PIN } from '$env/static/private';
import type { Actions } from './$types';

const BRIGADE_PIN = process.env.BRIGADE_PIN || '0000'; 

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const pin = data.get('pin');

        if (pin === BRIGADE_PIN) {
            // cookie that lasts for 30 days
            cookies.set('brigade_auth', 'true', {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30 // 30 days in seconds
            });
            
            throw redirect(303, '/');
        }

        return fail(400, { incorrect: true });
    }
};
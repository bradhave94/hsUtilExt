import type { APIRoute } from 'astro';
import { restorePage } from '../../../lib/hubspot/api';

export const POST: APIRoute = async ({ request, cookies }) => {
    const accessToken = cookies.get('hubspot_access_token')?.value;
    if (!accessToken) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const { pageId } = await request.json();
        console.log('Attempting to restore page with ID:', pageId);
        await restorePage(accessToken, pageId);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error restoring page:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to restore page' }), { status: 500 });
    }
};
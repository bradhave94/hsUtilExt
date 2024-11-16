import axios from 'axios';
import type { HubSpotPage } from '../types/HubSpotPage';

const CLIENT_ID = import.meta.env.HUBSPOT_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.HUBSPOT_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:4321/callback';
const SCOPES = 'content';

const AUTH_URL = 'https://app.hubspot.com/oauth/authorize';
const TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token';
const SITE_PAGES_URL = 'https://api.hubapi.com/content/api/v2/pages?limit=1000';
const TEMPLATES_URL = 'https://api.hubapi.com/content/api/v2/templates?is_available_for_new_content=true&limit=1000';

interface HubSpotTemplate {
    id: string;
    name: string;
    type: string;
    path: string;
    updated: number;
}

export function getAuthUrl() {
    return `${AUTH_URL}?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}`;
}

export async function getAccessToken(code: string) {
    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            code: code
        })
    });
    const data = await response.json();
    return data.access_token;
}
export async function getSitePages(accessToken: string): Promise<HubSpotPage[]> {
    const response = await fetch(SITE_PAGES_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data.objects as HubSpotPage[];
}

export async function getTemplates(accessToken: string): Promise<HubSpotTemplate[]> {
    try {
        const response = await fetch(TEMPLATES_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const data = await response.json();
        return data.objects as HubSpotTemplate[];
    } catch (error) {
        console.error('Error fetching templates:', error);
        throw error;
    }
}

export async function updatePagesBatch(accessToken: string, batchInputJsonNode: any) {
    const response = await fetch('https://api.hubapi.com/cms/v3/pages/site-pages/batch/update', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(batchInputJsonNode)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}
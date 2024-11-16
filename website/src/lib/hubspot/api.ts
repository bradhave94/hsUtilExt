import type { HubSpotPage } from '../../types/HubSpotPage';
import type { HubSpotTemplate } from '../../types/HubSpotTemplate';

const CLIENT_ID = import.meta.env.HUBSPOT_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.HUBSPOT_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:4321/callback';
const SCOPES = 'content';

const AUTH_URL = 'https://app.hubspot.com/oauth/authorize';
const TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token';
const SITE_PAGES_URL = 'https://api.hubapi.com/cms/v3/pages/site-pages?limit=100&archived=true';
const TEMPLATES_URL = 'https://api.hubapi.com/content/api/v2/templates?is_available_for_new_content=true&limit=1000';


export function getAuthUrl() {
    return `${AUTH_URL}?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}`;
}

export async function getAccessTokenFromCode(code: string): Promise<{ accessToken: string, portalId: string }> {
    const tokenResponse = await fetch(TOKEN_URL, {
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
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
        throw new Error(`Failed to get access token: ${tokenData.error}`);
    }

    const accessToken = tokenData.access_token;

    // Make an additional API call to get the portal ID
    const portalResponse = await fetch('https://api.hubapi.com/oauth/v1/access-tokens/' + accessToken, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    const portalData = await portalResponse.json();
    if (!portalResponse.ok) {
        throw new Error(`Failed to get portal ID: ${portalData.error}`);
    }

    const portalId = portalData.hub_id.toString();

    console.log('Access token:', accessToken);
    console.log('Portal ID:', portalId);

    return { accessToken, portalId };
}

export function getAccessTokenFromRequest(request: Request): string | null {
    return request.headers.get('Cookie')
        ?.split(';')
        .find(c => c.trim().startsWith('hubspot_access_token='))
        ?.split('=')[1] || null;
}

export async function getSitePages(accessToken: string): Promise<HubSpotPage[]> {
    let allPages: HubSpotPage[] = [];
    let nextPageUrl = SITE_PAGES_URL;

    try {
        while (nextPageUrl) {
            const response = await fetch(nextPageUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.results || !Array.isArray(data.results)) {
                throw new Error('Unexpected API response structure');
            }

            const pages = data.results.map((page: any): HubSpotPage => ({
                id: page.id,
                name: page.name,
                slug: page.slug,
                state: page.state,
                currentState: page.currentState,
                createdAt: page.createdAt,
                updatedAt: page.updatedAt,
                publishDate: page.publishDate,
                archived: page.archivedAt !== "1970-01-01T00:00:00Z",
                archivedAt: page.archivedAt,
                absolute_url: page.url,
                templatePath: page.templatePath,
                template_path: page.templatePath,
            }));

            allPages = allPages.concat(pages);

            nextPageUrl = data.paging?.next?.link || null;
        }

        return allPages;
    } catch (error) {
        console.error('Error fetching site pages:', error);
        throw new Error(`Failed to fetch site pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getArchivedSitePages(accessToken: string): Promise<HubSpotPage[]> {
    try {
        const response = await fetch(ARCHIVED_PAGES_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (!data.results || !Array.isArray(data.results)) {
            console.error('Unexpected API response structure for archived pages:', data);
            return [];
        }

        return data.results.map((page: any): HubSpotPage => ({
            id: page.id,
            name: page.name,
            slug: page.slug,
            state: page.state,
            currentState: page.currentState,
            createdAt: page.createdAt,
            updatedAt: page.updatedAt,
            publishDate: page.publishDate,
            archived: true,
            archivedAt: page.archivedAt,
            absolute_url: page.url,
            templatePath: page.templatePath,
            template_path: page.templatePath, // Ensure both properties are set
        }));
    } catch (error) {
        console.error('Error fetching archived site pages:', error);
        throw error;
    }
}

function formatDate(dateString: string): string {
    if (!dateString || dateString === "1970-01-01T00:00:00Z") {
        return '';
    }
    const date = new Date(dateString);
    return date.toLocaleString(); // This will format the date according to the user's locale
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

export async function updatePageTemplate(pageId: string, templatePath: string, accessToken: string) {
    const response = await fetch(`https://api.hubapi.com/cms/v3/pages/site-pages/${pageId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ templatePath })
    });

    if (!response.ok) {
        throw new Error(`HubSpot API responded with status ${response.status}`);
    }

    return response.json();
}

export async function handleApiError(error: unknown) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred' }), { status: 500 });
}

export async function restorePage(accessToken: string, pageId: string): Promise<void> {
    const response = await fetch(`https://api.hubapi.com/cms/v3/pages/site-pages/${pageId}?archived=true`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            archived: false
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to restore page: ${response.status} ${response.statusText}. Body: ${errorBody}`);
    }

    const result = await response.json();
    console.log('Restore page result:', result);
}
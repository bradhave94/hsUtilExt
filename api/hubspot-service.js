import fetch from 'node-fetch';

// Server-side token management and API calls
export const getAccountInfo = async (accessToken) => {
    const response = await fetch('https://api.hubapi.com/account-info/v3/details', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status}`);
    }
    
    return response.json();
}

export const getModuleInfo = async (moduleId, accessToken) => {
    const response = await fetch(`https://api.hubapi.com/content/api/v4/custom_widgets/${moduleId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    });
    
    if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status}`);
    }
    
    return response.json();
}

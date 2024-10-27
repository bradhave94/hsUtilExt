const CLIENT_ID = 'd265053b-d8ee-47d1-b4b8-b14ac07b00cd'
const CLIENT_SECRET = null
const REDIRECT_URI = chrome.identity.getRedirectURL()
const VERCEL_API_URL = 'https://hs-util-ext.vercel.app/api/token-exchange';

export const initiateHubSpotAuth = async () => {
    const authUrl = `https://app.hubspot.com/oauth/authorize` + 
        `?client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=content%20oauth`;  // Add your required scopes

    try {
        // This handles the entire OAuth flow securely
        const responseUrl = await chrome.identity.launchWebAuthFlow({
            url: authUrl,
            interactive: true
        });
        
        // Extract the code from the response URL
        const url = new URL(responseUrl);
        const code = url.searchParams.get('code');
        
        if (!code) {
            throw new Error('No code received');
        }

        // Exchange the code for tokens
        return exchangeCodeForToken(code);
    } catch (error) {
        console.error('Auth error:', error);
        throw error;
    }
}

export const exchangeCodeForToken = async (code) => {
    try {
        const response = await fetch(VERCEL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Extension-Id': chrome.runtime.id
            },
            body: JSON.stringify({ 
                code,
                redirect_uri: chrome.identity.getRedirectURL()
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Token exchange failed:', errorData);
            throw new Error(`Token exchange failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Token exchange response:', data);  // Debug log
        
        // Make sure we have both tokens
        if (!data.access_token || !data.refresh_token) {
            console.error('Missing required tokens in response:', data);
            throw new Error('Incomplete token data received');
        }
        
        return data;
    } catch (error) {
        console.error('Error in exchangeCodeForToken:', error);
        throw error;
    }
}

export const getAccountInfo = async (accessToken) => {
    const response = await fetch('https://api.hubapi.com/account-info/v3/details', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
    return response.json()
}

export const refreshAccessToken = async (refreshToken) => {
    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: refreshToken
        })
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error('Token refresh failed:', errorData);
        throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Token refresh response:', data);
    return data;
};

// Helper function to check if token needs refresh
export const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
        // Check if token is JWT format
        if (token.includes('.')) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiryTime = payload.exp * 1000; // Convert to milliseconds
            return Date.now() >= expiryTime;
        }
        
        // If not JWT, assume expired after 5.5 hours (HubSpot tokens last 6 hours)
        // You might want to store the token creation time separately
        return true;  // For now, always refresh to be safe
    } catch (error) {
        console.error('Error checking token expiry:', error);
        return true; // If we can't check, assume it's expired
    }
};

// Wrapper function to ensure fresh token
export const ensureFreshToken = async (account) => {
    if (!account || !account.refreshToken) {
        throw new Error('Invalid account or missing refresh token');
    }

    try {
        if (isTokenExpired(account.accessToken)) {
            console.log('Token expired, refreshing...');
            const newTokens = await refreshAccessToken(account.refreshToken);
            
            // Update account in storage with new tokens
            const result = await chrome.storage.sync.get('hubspotAccounts');
            const accounts = result.hubspotAccounts || [];
            const updatedAccounts = accounts.map(acc => 
                acc.hubId === account.hubId 
                    ? { 
                        ...acc, 
                        accessToken: newTokens.access_token, 
                        refreshToken: newTokens.refresh_token,
                        tokenTimestamp: Date.now() // Add timestamp
                    }
                    : acc
            );
            await chrome.storage.sync.set({ hubspotAccounts: updatedAccounts });
            
            return newTokens.access_token;
        }
        return account.accessToken;
    } catch (error) {
        console.error('Token refresh error:', error);
        throw new Error('Failed to refresh token. Please re-authenticate.');
    }
};

// Update getModuleInfo to handle token errors
export const getModuleInfo = async (moduleId, account) => {
    try {
        const freshToken = await ensureFreshToken(account);
        
        const response = await fetch(`https://api.hubapi.com/content/api/v4/custom_widgets/${moduleId}`, {
            headers: {
                'Authorization': `Bearer ${freshToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Module info fetch failed:', errorData);
            
            // If unauthorized, try to refresh token one more time
            if (response.status === 401) {
                console.log('Unauthorized, attempting token refresh...');
                const newToken = await ensureFreshToken({ ...account, accessToken: null });
                
                // Retry with new token
                const retryResponse = await fetch(`https://api.hubapi.com/content/api/v4/custom_widgets/${moduleId}`, {
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json',
                    }
                });
                
                if (!retryResponse.ok) {
                    throw new Error(`Failed to fetch module info: ${retryResponse.status}`);
                }
                
                return retryResponse.json();
            }
            
            throw new Error(`Failed to fetch module info: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Module info error:', error);
        throw error;
    }
};

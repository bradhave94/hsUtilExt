const CLIENT_ID = 'd265053b-d8ee-47d1-b4b8-b14ac07b00cd'
const REDIRECT_URI = chrome.identity.getRedirectURL()

// Define API URLs based on environment
const API_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000/api'  // Remove trailing slash
    : 'https://hs-util-ext.vercel.app/api';

console.log('Using API URL:', API_URL); // Debug log

export const initiateHubSpotAuth = async () => {
    const authUrl = `https://app.hubspot.com/oauth/authorize` + 
        `?client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=content%20oauth`;

    try {
        const responseUrl = await chrome.identity.launchWebAuthFlow({
            url: authUrl,
            interactive: true
        });
        
        const url = new URL(responseUrl);
        const code = url.searchParams.get('code');
        
        if (!code) {
            throw new Error('No code received');
        }

        return exchangeCodeForToken(code);
    } catch (error) {
        console.error('Auth error:', error);
        throw error;
    }
}

export const exchangeCodeForToken = async (code) => {
    try {
        const response = await fetch(`${API_URL}/token-exchange`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Extension-Id': chrome.runtime.id
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
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
        return data;
    } catch (error) {
        console.error('Error in exchangeCodeForToken:', error);
        throw error;
    }
}

export const getAccountInfo = async (accessToken) => {
    const response = await fetch(`${API_URL}/account-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Extension-Id': chrome.runtime.id
        },
        body: JSON.stringify({ access_token: accessToken })
    });
    return response.json();
}

export const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await fetch(`${API_URL}/token-refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Extension-Id': chrome.runtime.id
            },
            body: JSON.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Token refresh failed:', errorData);
            throw new Error(`Token refresh failed: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in refreshAccessToken:', error);
        throw error;
    }
}

// Helper to check if token needs refresh
const isTokenExpired = (account) => {
    // If no expiration time, consider it expired
    if (!account.expiresAt) {
        console.log('No expiration time found for account:', account);
        return true;
    }
    
    // Add a 5-minute buffer before expiration
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const currentTime = Date.now();
    
    console.log('Token expiration check:', {
        currentTime,
        expiresAt: account.expiresAt,
        timeUntilExpiration: account.expiresAt - currentTime,
        isExpired: currentTime + bufferTime > account.expiresAt
    });

    return currentTime + bufferTime > account.expiresAt;
};

// Wrapper function to ensure fresh token
export const ensureFreshToken = async (account) => {
    if (!account || !account.refreshToken) {
        throw new Error('Invalid account or missing refresh token');
    }

    try {
        if (isTokenExpired(account)) {
            console.log('Token expired, refreshing...', account);
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
                        expiresAt: Date.now() + (newTokens.expires_in * 1000)
                    }
                    : acc
            );
            await chrome.storage.sync.set({ hubspotAccounts: updatedAccounts });
            console.log('Updated account:', updatedAccounts.find(acc => acc.hubId === account.hubId));
            
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
    const freshToken = await ensureFreshToken(account);
    
    const response = await fetch(`${API_URL}/module-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Extension-Id': chrome.runtime.id
        },
        body: JSON.stringify({
            moduleId,
            access_token: freshToken
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch module info: ${response.status}`);
    }

    return response.json();
};

// Add a function to handle token expiration and refresh
export const handleTokenRefresh = async (account) => {
    try {
        console.log('Token expired, refreshing...', account);
        
        if (!account.refreshToken) {
            throw new Error('No refresh token available');
        }

        const tokens = await refreshAccessToken(account.refreshToken);
        
        // Update the stored account with new tokens
        const updatedAccount = {
            ...account,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: Date.now() + (tokens.expires_in * 1000)
        };

        // Get all accounts and update this one
        const accounts = await getAccounts();
        const updatedAccounts = accounts.map(acc => 
            acc.hubId === account.hubId ? updatedAccount : acc
        );
        
        // Save updated accounts
        await saveAccounts(updatedAccounts);
        
        return updatedAccount;
    } catch (error) {
        console.error('Token refresh error:', error);
        // If refresh fails, we might want to remove the account or mark it as needing re-auth
        throw new Error('Failed to refresh token. Please re-authenticate.');
    }
}

// Update the API call function to handle token expiration
export const makeHubSpotRequest = async (url, account, options = {}) => {
    try {
        // Only refresh if actually expired
        if (isTokenExpired(account)) {
            console.log('Token expired, refreshing...');
            const tokenData = await refreshAccessToken(account.refreshToken);
            account = await saveAccountWithExpiration(tokenData, account);
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${account.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        // If we get a 401, try refreshing token once
        if (response.status === 401) {
            console.log('Got 401, refreshing token...');
            const tokenData = await refreshAccessToken(account.refreshToken);
            account = await saveAccountWithExpiration(tokenData, account);
            
            // Retry the request with new token
            const retryResponse = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${account.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!retryResponse.ok) {
                throw new Error(`Request failed: ${retryResponse.status}`);
            }

            return retryResponse.json();
        }

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Helper to store account with expiration
const saveAccountWithExpiration = async (tokenData, account) => {
    const expiresAt = Date.now() + (tokenData.expires_in * 1000); // Convert seconds to milliseconds
    
    const updatedAccount = {
        ...account,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || account.refreshToken,
        tokenType: tokenData.token_type || 'bearer',
        expiresAt // Store the actual expiration timestamp
    };

    const accounts = await getAccounts();
    const updatedAccounts = accounts.map(acc => 
        acc.hubId === account.hubId ? updatedAccount : acc
    );
    
    await saveAccounts(updatedAccounts);
    return updatedAccount;
};

// Update handleAddAccount to store expiration
export const handleAddAccount = async () => {
    try {
        const tokenData = await exchangeCodeForToken(code);
        const accountInfo = await getAccountInfo(tokenData.access_token);
        
        const newAccount = {
            hubId: accountInfo.portalId,
            name: accountInfo.accountName,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenType: tokenData.token_type || 'bearer',
            expiresAt: Date.now() + (tokenData.expires_in * 1000)
        };

        const accounts = await getAccounts();
        const updatedAccounts = [...accounts, newAccount];
        await saveAccounts(updatedAccounts);
        
        return newAccount;
    } catch (error) {
        console.error('Failed to add account:', error);
        throw error;
    }
}

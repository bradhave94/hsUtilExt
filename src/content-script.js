// Helper function to get account matching portal ID
const getAccounts = async (portalId) => {
    const result = await chrome.storage.sync.get('hubspotAccounts');
    const accounts = result.hubspotAccounts || [];
    console.log('All accounts from storage:', accounts);  // Debug log
    
    const matchingAccount = accounts.find(account => String(account.hubId) === String(portalId));
    console.log('Matching account:', matchingAccount);  // Debug log
    
    if (matchingAccount) {
        console.log('Access Token:', matchingAccount.accessToken);
        console.log('Refresh Token:', matchingAccount.refreshToken);
    }
    
    return matchingAccount || null;
};

// Extract module ID from URL function
const getModuleIdFromUrl = (url) => {
    const matches = url.match(/\/modules\/(\d+)/);
    return matches ? matches[1] : null;
};

// Check if we're on the HubSpot Design Manager page
if (window.location.href.startsWith('https://app.hubspot.com/design-manager/')) {
    console.log('Design Manager page detected');
    
    const portalId = window.location.href.split('/design-manager/')[1].split('/')[0];
    const moduleId = getModuleIdFromUrl(window.location.href);
    
    if (moduleId) {
        console.log('Portal ID:', portalId);
        console.log('Module ID:', moduleId);
        
        // Get the matching account and fetch module info
        getAccounts(portalId).then(async account => {
            if (account && account.accessToken && account.refreshToken) {
                console.log('Found valid account with tokens');
                try {
                    console.log('Sending message to background script');
                    const response = await chrome.runtime.sendMessage({
                        action: "getModuleInfo",
                        moduleId: moduleId,
                        account: {
                            hubId: account.hubId,
                            accessToken: account.accessToken,
                            refreshToken: account.refreshToken,
                            expiresAt: account.expiresAt,  // Add this
                            tokenType: account.tokenType    // Add this
                        }
                    });
                    
                    if (response.success) {
                        console.log('Module Info:', response.data);
                    } else {
                        console.error('Failed to get module info:', response.error);
                    }
                } catch (error) {
                    console.error('Message passing failed:', error);
                }
            } else {
                console.error('Account missing required tokens:', account);
                // You might want to trigger a re-authentication here
            }
        });
    }
}

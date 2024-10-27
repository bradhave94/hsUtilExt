import * as hubspot from './utils/hubspot.js';

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed')
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request);
    
    if (request.action === "getModuleInfo") {
        console.log('Processing getModuleInfo request');
        console.log('Module ID:', request.moduleId);
        console.log('Access Token:', request.account.accessToken);
        
        hubspot.getModuleInfo(request.moduleId, request.account)
            .then(data => {
                console.log('Module info retrieved successfully:', data);
                sendResponse({ success: true, data: data });
            })
            .catch(error => {
                console.error('Error getting module info:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep the message channel open for async response
    }
});

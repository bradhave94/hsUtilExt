export const corsMiddleware = (handler) => async (req, res) => {
    const ALLOWED_EXTENSION_ID = process.env.ALLOWED_EXTENSION_ID;    
    
    // Get the actual requesting origin
    const requestOrigin = req.headers.origin;
    
    // Set CORS headers with the actual origin
    res.setHeader('Access-Control-Allow-Origin', requestOrigin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Extension-Id');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight requests immediately
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only validate extension ID for POST requests
    if (req.method === 'POST') {
        const extensionId = req.headers['x-extension-id'];
        if (!extensionId || extensionId !== ALLOWED_EXTENSION_ID) {
            return res.status(401).json({ error: 'Unauthorized extension' });
        }
    }

    return handler(req, res);
};

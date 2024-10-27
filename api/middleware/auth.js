export const corsMiddleware = (handler) => async (req, res) => {
    const ALLOWED_EXTENSION_ID = process.env.ALLOWED_EXTENSION_ID;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // In development, log headers and extension ID for debugging
    if (isDevelopment) {
        console.log('Request headers:', req.headers);
        console.log('Extension ID:', req.headers['x-extension-id']);
        console.log('Expected Extension ID:', ALLOWED_EXTENSION_ID);
    }

    const origin = `chrome-extension://${ALLOWED_EXTENSION_ID}`;

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Extension-Id, Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // More lenient validation in development
    if (!isDevelopment) {
        const extensionId = req.headers['x-extension-id'];
        if (!extensionId || extensionId !== ALLOWED_EXTENSION_ID) {
            return res.status(401).json({ error: 'Unauthorized extension' });
        }
    }

    // Handle the actual request
    return handler(req, res);
};

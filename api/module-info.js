import { getModuleInfo } from './hubspot-service';
import { corsMiddleware } from './middleware/auth.js';

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { moduleId, access_token } = req.body;
        const moduleInfo = await getModuleInfo(moduleId, access_token);
        res.status(200).json(moduleInfo);
    } catch (error) {
        console.error('Module info error:', error);
        res.status(500).json({ error: 'Failed to fetch module info' });
    }
}

export default corsMiddleware(handler);

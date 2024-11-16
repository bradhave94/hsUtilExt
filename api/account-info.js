import fetch from 'node-fetch';
import { corsMiddleware } from './middleware/auth.js';

async function handler(req, res) {
    if (req.method === 'GET') {
        return res.status(200).json({ message: 'GET method is not supported.' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { access_token } = req.body;
        
        const response = await fetch('https://api.hubapi.com/account-info/v3/details', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('HubSpot API error:', data);
            return res.status(response.status).json(data);
        }

        // Log success without exposing sensitive data
        console.log('Account info retrieved successfully');
        
        return res.status(200).json(data);
    } catch (error) {
        console.error('Account info error:', error);
        return res.status(500).json({ error: 'Failed to fetch account info' });
    }
}

export default corsMiddleware(handler);

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
        const { grant_type, code, refresh_token } = req.body;
        console.log('Token request:', { grant_type, code, refresh_token }); // Debug log

        const params = {
            grant_type,
            client_id: process.env.HUBSPOT_CLIENT_ID,
            client_secret: process.env.HUBSPOT_CLIENT_SECRET,
        };

        if (grant_type === 'authorization_code') {
            params.code = code;
            params.redirect_uri = process.env.REDIRECT_URI;
        } else if (grant_type === 'refresh_token') {
            params.refresh_token = refresh_token;
        } else {
            return res.status(400).json({ error: 'Invalid grant_type' });
        }

        console.log('Making request to HubSpot with params:', {
            ...params,
            client_secret: '[REDACTED]'
        }); // Debug log without exposing secret

        const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(params)
        });

        const data = await response.json();
        console.log('HubSpot response:', {
            ...data,
            access_token: data.access_token ? '[REDACTED]' : undefined,
            refresh_token: data.refresh_token ? '[REDACTED]' : undefined
        }); // Debug log without exposing tokens

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Token exchange error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default corsMiddleware(handler);

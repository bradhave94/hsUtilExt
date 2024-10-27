import fetch from 'node-fetch';

// At the top of your file
const ALLOWED_EXTENSION_ID = process.env.ALLOWED_EXTENSION_ID;

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', `chrome-extension://${ALLOWED_EXTENSION_ID}`);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Extension-Id, Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // After setting CORS headers
  const extensionId = req.headers['x-extension-id'];
  
  if (extensionId !== ALLOWED_EXTENSION_ID) {
    return res.status(401).json({ error: 'Unauthorized extension' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.HUBSPOT_CLIENT_ID,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code: code
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('HubSpot API error:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

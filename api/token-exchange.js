import fetch from 'node-fetch';

export default async function handler(req, res) {
  // List of valid extension IDs (from Chrome Web Store)
  const VALID_EXTENSION_IDS = ['your-extension-id-1', 'your-extension-id-2'];
  
  const extensionId = req.headers['x-extension-id'];
  
  if (!VALID_EXTENSION_IDS.includes(extensionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, extensionAuth } = req.body;

    // Verify request is from your extension
    if (extensionAuth !== process.env.EXTENSION_AUTH_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
    return res.status(200).json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

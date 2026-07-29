// Callback van GitHub OAuth. Wisselt de authorization code in voor een access
// token en stuurt die terug naar het Decap CMS-venster via postMessage, zoals
// het protocol van Decap/Netlify CMS voorschrijft.

export default async function handler(req: any, res: any) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  const code = req.query?.code;

  if (!clientId || !clientSecret) {
    res.status(500).send('OAUTH_GITHUB_CLIENT_ID of OAUTH_GITHUB_CLIENT_SECRET ontbreekt.');
    return;
  }

  if (!code) {
    res.status(400).send('Geen authorization code ontvangen van GitHub.');
    return;
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('GitHub OAuth fout:', tokenData);
      res.status(502).send('Kon geen access token ophalen bij GitHub.');
      return;
    }

    const token = tokenData.access_token;
    const content = {
      token,
      provider: 'github',
    };

    // Decap CMS verwacht dit exacte postMessage-protocol
    const script = `
      <!doctype html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <script>
            (function() {
              function receiveMessage(message) {
                window.opener.postMessage(
                  'authorization:github:success:${JSON.stringify(content).replace(/'/g, "\\'")}',
                  message.origin
                );
                window.removeEventListener('message', receiveMessage, false);
              }
              window.addEventListener('message', receiveMessage, false);
              window.opener.postMessage('authorizing:github', '*');
            })();
          <\/script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(script);
  } catch (error) {
    console.error('Onverwachte fout bij OAuth callback:', error);
    res.status(500).send('Er ging iets mis tijdens het inloggen. Probeer het opnieuw.');
  }
}

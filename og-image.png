// Start van de OAuth-flow voor Decap CMS.
// Vereist environment variables: OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET
// (aan te maken via GitHub → Settings → Developer settings → OAuth Apps)

export default async function handler(req: any, res: any) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;

  if (!clientId) {
    res.status(500).send('OAUTH_GITHUB_CLIENT_ID ontbreekt in environment variables.');
    return;
  }

  const redirectUri = `https://${req.headers.host}/api/callback`;
  const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;

  res.writeHead(302, { Location: authorizeUrl });
  res.end();
}

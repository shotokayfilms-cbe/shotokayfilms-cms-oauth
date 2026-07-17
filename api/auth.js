export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return res.status(500).send("GITHUB_CLIENT_ID is not configured");
  }

  const redirectUri = `https://${req.headers.host}/api/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo,user"
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

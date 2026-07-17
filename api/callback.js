export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code
        })
      }
    );

    const data = await response.json();

    if (!data.access_token) {
      return res.status(400).send("GitHub authentication failed");
    }

    const content = JSON.stringify({
      token: data.access_token,
      provider: "github"
    });

    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!doctype html>
      <html>
        <body>
          <script>
            (function () {
              function receiveMessage(e) {
                if (e.data === "authorizing:github") {
                  window.opener.postMessage(
                    "authorization:github:success:${content.replace(/"/g, '\\"')}",
                    e.origin
                  );
                  window.removeEventListener("message", receiveMessage, false);
                }
              }

              window.addEventListener("message", receiveMessage, false);
              window.opener.postMessage("authorizing:github", "*");
            })();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("OAuth authentication error");
  }
}

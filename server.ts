import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Discord OAuth Configuration
  const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const REDIRECT_URI = `${process.env.APP_URL}/auth/callback`;

  // API Route to get Discord Auth URL
  app.get("/api/auth/discord/url", (req, res) => {
    if (!CLIENT_ID) {
      return res.status(500).json({ error: "Discord Client ID not configured" });
    }
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "identify email",
    });
    const url = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    res.json({ url });
  });

  // Discord OAuth Callback
  app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("No code provided");
    }

    try {
      const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: CLIENT_ID!,
          client_secret: CLIENT_SECRET!,
          grant_type: "authorization_code",
          code: code.toString(),
          redirect_uri: REDIRECT_URI,
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const tokens = await tokenResponse.json();
      
      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error);
      }

      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      const discordUser = await userResponse.json();

      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  user: {
                    id: '${discordUser.id}',
                    username: '${discordUser.username}',
                    avatar: '${discordUser.avatar}',
                    role: 'USER'
                  }
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentification réussie. Cette fenêtre va se fermer...</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Discord OAuth Error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

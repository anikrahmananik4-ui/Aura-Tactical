import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";

interface User {
  id: string;
  codename: string;
  channel: string;
  ws: WebSocket;
  isSpeaking: boolean;
  joinedAt: number;
}

const users = new Map<string, User>();

function broadcastToChannel(channel: string, messageObj: any, excludeUserId?: string) {
  const jsonString = JSON.stringify(messageObj);
  for (const user of users.values()) {
    if (user.channel === channel && user.id !== excludeUserId) {
      if (user.ws.readyState === WebSocket.OPEN) {
        try {
          user.ws.send(jsonString);
        } catch (e) {
          console.error(`Error sending message to user ${user.id}:`, e);
        }
      }
    }
  }
}

function broadcastUsersList(channel: string) {
  const channelUsers = Array.from(users.values())
    .filter((u) => u.channel === channel)
    .map((u) => ({
      id: u.id,
      codename: u.codename,
      isSpeaking: u.isSpeaking,
      joinedAt: u.joinedAt,
    }));

  broadcastToChannel(channel, {
    type: "users",
    users: channelUsers,
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API router / health checks
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", activeChannels: Array.from(new Set(Array.from(users.values()).map(u => u.channel))).length });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSockets upgrading
  server.on("upgrade", (request, socket, head) => {
    try {
      const host = request.headers.host || "localhost";
      const pathname = new URL(request.url || "", `http://${host}`).pathname;
      if (pathname === "/ws" || pathname.startsWith("/ws")) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      socket.destroy();
    }
  });

  // Manage client connections
  wss.on("connection", (ws: WebSocket) => {
    let currentUser: User | null = null;

    ws.on("message", (messageData) => {
      try {
        const message = JSON.parse(messageData.toString());

        switch (message.type) {
          case "join": {
            const { codename, channel } = message;
            if (!codename || !channel) return;

            const cleanCodename = codename.trim();
            const cleanChannel = channel.trim().toLowerCase();

            currentUser = {
              id: Math.random().toString(36).substring(2, 9),
              codename: cleanCodename,
              channel: cleanChannel,
              ws,
              isSpeaking: false,
              joinedAt: Date.now(),
            };

            users.set(currentUser.id, currentUser);

            // Send joining acknowledgement
            ws.send(
              JSON.stringify({
                type: "joined",
                userId: currentUser.id,
                codename: currentUser.codename,
                channel: currentUser.channel,
              })
            );

            // Update channel user presence lists
            broadcastUsersList(currentUser.channel);
            break;
          }

          case "status": {
            if (!currentUser) return;
            currentUser.isSpeaking = !!message.speaking;
            
            // Broadcast live talk indicator
            broadcastToChannel(
              currentUser.channel,
              {
                type: "status",
                userId: currentUser.id,
                codename: currentUser.codename,
                isSpeaking: currentUser.isSpeaking,
              },
              currentUser.id
            );
            break;
          }

          case "audio": {
            if (!currentUser) return;

            // Forward the voice buffer payload to all other listeners
            broadcastToChannel(
              currentUser.channel,
              {
                type: "audio",
                userId: currentUser.id,
                codename: currentUser.codename,
                data: message.data,
              },
              currentUser.id
            );
            break;
          }

          case "chat": {
            if (!currentUser) return;
            // Forward the chat message or files to all other listeners
            broadcastToChannel(
              currentUser.channel,
              {
                type: "chat",
                id: Math.random().toString(36).substring(2, 9),
                userId: currentUser.id,
                codename: currentUser.codename,
                text: message.text,
                file: message.file,
                timestamp: Date.now(),
              },
              currentUser.id
            );
            break;
          }

          case "signal": {
            if (!currentUser) return;
            const { target, signal } = message;
            if (!target) return;
            const targetUser = users.get(target);
            if (targetUser && targetUser.channel === currentUser.channel) {
              targetUser.ws.send(
                JSON.stringify({
                  type: "signal",
                  sender: currentUser.id,
                  senderCodename: currentUser.codename,
                  signal,
                })
              );
            }
            break;
          }

          case "ping": {
            ws.send(JSON.stringify({ type: "pong" }));
            break;
          }
        }
      } catch (err) {
        console.error("Error processing websocket message:", err);
      }
    });

    ws.on("close", () => {
      if (currentUser) {
        users.delete(currentUser.id);
        broadcastUsersList(currentUser.channel);
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket connection error:", err);
      if (currentUser) {
        users.delete(currentUser.id);
        broadcastUsersList(currentUser.channel);
      }
    });
  });

  // Serve static assets using Vite middleware or prod bundles
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Unified server is running on http://localhost:${PORT}`);
  });
}

startServer();

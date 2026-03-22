import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

import { contactHandler } from "./api/contact.js";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(rootDir, "public");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8000);

const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/contact") {
    await contactHandler(req, res);
    return;
  }

  serveStatic(url.pathname, res);
});

server.listen(port, host, () => {
  console.log(`ProMaterial website running at http://${host}:${port}`);
});

function serveStatic(pathname, res) {
  const normalizedPath = normalize(pathname === "/" ? "/index.html" : pathname).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = join(publicDir, normalizedPath);

  if (!requestedPath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  let filePath = requestedPath;

  if (!existsSync(filePath)) {
    const publicFallback = join(rootDir, normalizedPath.replace(/^[/\\]+/, ""));
    if (existsSync(publicFallback)) {
      filePath = publicFallback;
    } else {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
  }

  const stats = statSync(filePath);
  if (stats.isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(res);
}

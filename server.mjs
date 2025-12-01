import { createServer } from "http";
import { readFile } from "fs/promises";
import { createReadStream, statSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.join(__dirname, "build", "client");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

const server = createServer(async (req, res) => {
  try {
    const urlPath = req.url?.split("?")[0] || "/";
    const requestedPath = path.join(clientDir, decodeURIComponent(urlPath));
    let filePath = requestedPath;

    if (!existsSync(filePath) || statSafe(filePath)?.isDirectory()) {
      filePath = path.join(clientDir, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });

    if (mime === "text/html") {
      const html = await readFile(filePath, "utf8");
      res.end(html);
    } else {
      createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error("SPA server error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
});

function statSafe(p) {
  try {
    return statSync(p);
  } catch {
    return null;
  }
}

server.listen(port, host, () => {
  console.log(`SPA server listening on http://${host}:${port}`);
});

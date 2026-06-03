import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 5500);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function getFilePath(requestUrl) {
  const url = new URL(requestUrl || "/", `http://localhost:${PORT}`);
  let safeUrlPath = decodeURIComponent(url.pathname);
  safeUrlPath = path.normalize(safeUrlPath).replace(/^([.][.][\\/])+/, "");

  let filePath = path.join(__dirname, safeUrlPath);

  if (safeUrlPath === "/" || safeUrlPath === ".") {
    filePath = path.join(__dirname, "index.html");
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, "index.html");
    filePath = existsSync(indexPath) ? indexPath : path.join(__dirname, "index.html");
  }

  return filePath;
}

const server = http.createServer((req, res) => {
  try {
    const filePath = getFilePath(req.url);

    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Frontend dev server error");
  }
});

server.listen(PORT, () => {
  console.log(`Frontend запущено: http://localhost:${PORT}`);
});

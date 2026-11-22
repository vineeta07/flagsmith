// Minimal static file server for the demo (Node built-ins only).
// Serves ./public and exposes the Flagsmith SDK's ES module build at /vendor/flagsmith/.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const mounts = [
  { prefix: '/vendor/flagsmith/', dir: resolve(root, 'node_modules/@flagsmith/flagsmith') },
  { prefix: '/', dir: resolve(root, 'public') },
];

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json',
};

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const mount = mounts.find((m) => path.startsWith(m.prefix));
  const rel = path.slice(mount.prefix.length) || 'index.html';
  const file = normalize(join(mount.dir, rel));
  if (!file.startsWith(mount.dir)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(PORT, () => {
  console.log(`Demo shop running at http://localhost:${PORT}`);
});

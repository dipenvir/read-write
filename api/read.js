// /api/read.js
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    // We'll pass the filename via ?file=... using a rewrite
    const file = url.searchParams.get('file');

    if (!file) {
      res.statusCode = 400;
      res.setHeader('Content-Type','text/plain; charset=utf-8');
      res.end('Bad Request: file name is required.');
      return;
    }

    // Prevent path traversal – allow only a bare filename like "file.txt"
    if (file.includes('/') || file.includes('\\') || file.includes('..')) {
      res.statusCode = 400;
      res.setHeader('Content-Type','text/plain; charset=utf-8');
      res.end('Bad Request: invalid file name.');
      return;
    }

    const filePath = process.env.VERCEL ? '/tmp/' + file : path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.setHeader('Content-Type','text/plain; charset=utf-8');
      res.end(`404 Not Found: ${file}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    // Return as text so the browser displays it (no download)
    res.statusCode = 200;
    res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.end(content);
  } catch {
    res.statusCode = 500;
    res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.end('Internal Server Error');
  }
};

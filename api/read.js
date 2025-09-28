// /api/read.js
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = (req, res) => {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const file = url.searchParams.get('file') || 'file.txt'; // default

    if (file.includes('/') || file.includes('\\') || file.includes('..')) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Bad Request: invalid file name.');
      return;
    }

    const filePath = process.env.VERCEL
      ? path.join(os.tmpdir(), file)              // => /tmp/file.txt on Vercel
      : path.join(process.cwd(), file);           // local dev

    if (!fs.existsSync(filePath)) {
      console.log('[READ] missing', filePath);
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`404 Not Found: ${file}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    console.log('[READ] served', filePath, 'bytes=', content.length);

    res.statusCode = 200;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8'); // display in browser
    res.end(content);
  } catch (e) {
    console.error('[READ] error:', e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Internal Server Error');
  }
};

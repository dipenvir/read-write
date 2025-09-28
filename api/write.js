// /api/write.js
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const text = (url.searchParams.get('text') || '').trim();

    if (!text) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Bad Request: query string "text" is required.');
      return;
    }

    // Always use the same path logic for Vercel (ephemeral) vs local
    const filePath = process.env.VERCEL
      ? path.join(os.tmpdir(), 'file.txt')        // => /tmp/file.txt on Vercel
      : path.join(process.cwd(), 'file.txt');     // local dev

    await fs.promises.appendFile(filePath, text + '\n', 'utf8'); // creates if missing
    console.log('[WRITE] appended to', filePath, 'text=', text);

    res.statusCode = 200;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('OK: appended');
  } catch (e) {
    console.error('[WRITE] error:', e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Internal Server Error');
  }
};

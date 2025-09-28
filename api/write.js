// /api/write.js
const fs = require('fs');
const path = require('path');

function escapeHtml(s=''){return String(s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  .replace(/'/g,'&#39;');}

module.exports = (req, res) => {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const text = url.searchParams.get('text');

    if (!text || !text.trim()) {
      res.statusCode = 400;
      res.setHeader('Content-Type','text/plain; charset=utf-8');
      res.end('Bad Request: query string "text" is required.');
      return;
    }

    // Use /tmp on Vercel (ephemeral). For local dev, write in project root.
    const filePath = process.env.VERCEL ? '/tmp/file.txt' : path.join(process.cwd(), 'file.txt');

    fs.appendFile(filePath, text + '\n', 'utf8', (err) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type','text/plain; charset=utf-8');
        res.end('Internal Server Error: could not append.');
        return;
      }
      // Simple confirmation; styling not required for C, but okay to return HTML.
      res.statusCode = 200;
      res.setHeader('Content-Type','text/html; charset=utf-8');
      res.end(`<!doctype html><meta charset="utf-8"><p>Appended to <b>file.txt</b>: ${escapeHtml(text)}</p>`);
    });
  } catch {
    res.statusCode = 500;
    res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.end('Internal Server Error');
  }
};

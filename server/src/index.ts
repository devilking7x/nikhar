import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { apiRouter } from './jobs.js';
import { WEB_DIST } from './config.js';

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));

// Lightweight in-memory rate limiter for the API (per IP, per minute).
const hits = new Map<string, number[]>();
app.use('/api/', (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  if (arr.length > 120) {
    res.status(429).json({ error: 'Too many requests — please slow down a little.' });
    return;
  }
  next();
});

app.use('/api', apiRouter);

// Static frontend (built by `npm --prefix web run build`).
app.use(express.static(WEB_DIST, { maxAge: '1d', index: false }));

// SPA fallback — must not swallow /api routes.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(WEB_DIST, 'index.html'));
});

// Upload / validation errors -> clean 400 JSON.
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!err) return next();
  const msg =
    err.code === 'LIMIT_FILE_SIZE'
      ? 'Image must be smaller than 8MB.'
      : err.message || 'Upload failed.';
  res.status(400).json({ error: msg });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`nikhar server listening on :${port} (demo=${!process.env.YOUCAM_API_KEY})`);
});

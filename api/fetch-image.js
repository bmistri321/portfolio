// GET /api/fetch-image?url=…
// Fetches a remote image server-side (sidesteps browser CORS) and streams the
// bytes back, so the admin editor can run it through the normal
// compress → Supabase-storage upload pipeline.
// SSRF-guarded: http(s) only, no credentials in URL, no private / loopback /
// link-local IPs — checked on every resolved address AND on the final host
// after redirects.
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_BYTES = 4_000_000; // ~3.8 MB — stays under Vercel's function response limit
const TIMEOUT_MS = 15000;

function isBlockedIp(ip) {
  if (isIP(ip) === 4) {
    const p = ip.split('.').map(Number);
    if (p[0] === 0 || p[0] === 10 || p[0] === 127) return true; // current net, private, loopback
    if (p[0] === 169 && p[1] === 254) return true; // link-local (cloud metadata)
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true; // private
    if (p[0] === 192 && p[1] === 168) return true; // private
    if (p[0] >= 224) return true; // multicast / reserved
    return false;
  }
  const n = ip.toLowerCase();
  return (
    n === '::1' ||
    n === '::' ||
    n.startsWith('fe80:') || // link-local
    n.startsWith('fec0:') || // site-local (deprecated)
    n.startsWith('fc') ||
    n.startsWith('fd') // unique-local
  );
}

async function assertPublicHost(hostname) {
  const h = String(hostname || '').toLowerCase();
  if (!h || h === 'localhost' || h.endsWith('.localhost')) {
    const e = new Error('That host is not allowed.');
    e.status = 403;
    throw e;
  }
  let addrs;
  try {
    addrs = await lookup(h, { all: true });
  } catch {
    const e = new Error('Could not resolve that host.');
    e.status = 422;
    throw e;
  }
  if (!addrs.length || addrs.some((a) => isBlockedIp(a.address))) {
    const e = new Error('Private network addresses are not allowed.');
    e.status = 403;
    throw e;
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ ok: false, error: 'Method not allowed.' });
    }
    const raw = (req.query?.url || '').trim();
    if (!raw) {
      return res.status(400).json({ ok: false, error: 'Paste an image link first.' });
    }
    let u;
    try {
      u = new URL(raw);
    } catch {
      return res.status(400).json({ ok: false, error: 'That does not look like a valid link.' });
    }
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) {
      return res.status(400).json({ ok: false, error: 'Only public http(s) image links are allowed.' });
    }
    try {
      await assertPublicHost(u.hostname);
    } catch (e) {
      return res.status(e.status || 403).json({ ok: false, error: e.message });
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let r;
    try {
      r = await fetch(u.toString(), {
        signal: ctrl.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BishalMistriCMS/1.0)',
          Accept: 'image/*',
        },
      });
    } catch (e) {
      return res.status(502).json({
        ok: false,
        error: e?.name === 'AbortError' ? 'The image took too long to load.' : 'Could not reach that link.',
      });
    } finally {
      clearTimeout(timer);
    }

    // Re-check the final host after redirects (redirect-target SSRF guard).
    try {
      await assertPublicHost(new URL(r.url).hostname);
    } catch (e) {
      return res.status(e.status || 403).json({ ok: false, error: e.message });
    }

    if (!r.ok) {
      return res.status(502).json({ ok: false, error: `The link returned an error (${r.status}).` });
    }
    const ct = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!ct.startsWith('image/')) {
      return res.status(422).json({ ok: false, error: 'That link is not an image.' });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    if (!buf.length) {
      return res.status(422).json({ ok: false, error: 'The link returned an empty file.' });
    }
    if (buf.length > MAX_BYTES) {
      return res.status(413).json({
        ok: false,
        error: 'That image is over 4 MB — download it and upload it directly instead.',
      });
    }
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Something went wrong fetching the image.' });
  }
}

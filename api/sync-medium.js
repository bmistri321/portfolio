// GET /api/sync-medium — daily cron: re-sync published Writing pieces that
// are linked to Medium and have auto-sync on.
//
// Writes to Supabase, so it needs SUPABASE_URL (or VITE_SUPABASE_URL) and
// SUPABASE_SERVICE_ROLE_KEY in the Vercel project environment. Until those
// are set the endpoint reports "not configured" and does nothing — manual
// "Sync from Medium" in the editor keeps working regardless.
//
// Safety: a piece is only overwritten when Medium's content actually changed
// AND the piece was not edited locally after the last sync (otherwise the
// local edits win and the admin editor surfaces the pending Medium update).
import { fetchFeedXml, findFeedItem, extractFromItem } from './_medium.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sb(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Supabase ${method} ${path} failed (${res.status}): ${t.slice(0, 200)}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  // Optional shared-secret check for non-Vercel callers.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${secret}`) return res.status(401).json({ ok: false, error: 'Unauthorized.' });
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(200).json({
      ok: true,
      skipped: true,
      reason:
        'Medium auto-sync is not configured (SUPABASE_SERVICE_ROLE_KEY is missing from the Vercel environment). Manual "Sync from Medium" in the editor still works.',
    });
  }

  try {
    const rows = await sb('content?select=id,slug,title,excerpt,content,metadata,updated_at&status=eq.published');
    const candidates = (rows || []).filter(
      (r) => r.metadata?.medium?.sync !== false && r.metadata?.medium?.postId && r.metadata?.medium?.feedUrl
    );

    // Fetch each distinct feed once.
    const feedCache = new Map();
    const feedXml = async (feedUrl) => {
      if (!feedCache.has(feedUrl)) feedCache.set(feedUrl, fetchFeedXml(feedUrl).catch((e) => ({ __error: e })));
      return feedCache.get(feedUrl);
    };

    const updated = [];
    const skippedLocalEdits = [];
    const failed = [];

    for (const row of candidates) {
      const med = row.metadata.medium;
      try {
        const xml = await feedXml(med.feedUrl);
        if (xml?.__error) throw xml.__error;
        const found = findFeedItem(xml, med.postId);
        if (!found) continue; // article aged out of the feed; leave the piece alone
        const fresh = extractFromItem(found.itemXml, found.link, med.postId);
        if (fresh.contentHash === med.contentHash) continue; // unchanged

        const lastSync = med.lastSyncedAt ? new Date(med.lastSyncedAt).getTime() : 0;
        const locallyEdited = row.updated_at && new Date(row.updated_at).getTime() > lastSync + 5000;
        if (locallyEdited) {
          skippedLocalEdits.push(row.slug);
          continue;
        }

        const now = new Date().toISOString();
        await sb(`content?id=eq.${encodeURIComponent(row.id)}`, {
          method: 'PATCH',
          body: {
            content: fresh.html,
            excerpt: fresh.excerpt || row.excerpt,
            updated_at: now,
            metadata: {
              ...row.metadata,
              medium: {
                ...med,
                url: fresh.url || med.url,
                lastSyncedAt: now,
                contentHash: fresh.contentHash,
              },
            },
          },
        });
        updated.push(row.slug);
      } catch (e) {
        failed.push({ slug: row.slug, error: e?.message || 'unknown error' });
      }
    }

    return res.status(200).json({
      ok: true,
      checked: candidates.length,
      updated,
      skippedLocalEdits,
      failed,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'Sync failed.' });
  }
}

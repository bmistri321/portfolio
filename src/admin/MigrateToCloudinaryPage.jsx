import React, { useState } from 'react';
import { contentService } from '../lib/contentService';
import { uploadToCloudinary, optimizedCloudinaryUrl } from '../lib/cloudinary';

// One-time utility: migrate all Supabase-hosted images to Cloudinary CDN.
// Runs in the admin with the logged-in session. Visit /admin/migrate-cloudinary
// while logged in, click Start, keep the tab open.
const SUPABASE_HOST = 'supabase.co';
const SUPABASE_PUBLIC = 'https://vieqhbbzndgyqwspgkmy.supabase.co/storage/v1/object/public/portfolio-media/';

// Matches both raw Supabase URLs and /media/ proxy paths (which are
// Supabase-hosted behind the proxy).
function isSupabaseUrl(u) {
  return typeof u === 'string' && (u.includes(SUPABASE_HOST) || u.startsWith('/media/'));
}

// Cloudinary needs a full URL to fetch from — expand /media/ paths back.
function fetchableUrl(u) {
  if (u.startsWith('/media/')) return SUPABASE_PUBLIC + u.slice('/media/'.length);
  return u;
}

function extractSupabaseUrls(item) {
  const urls = new Set();
  const fields = ['cover_image', 'thumbnail', 'og_image'];
  for (const f of fields) {
    if (isSupabaseUrl(item[f])) urls.add(item[f]);
  }
  // Also check metadata JSON for image URLs
  try {
    const meta = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
    if (meta) {
      for (const v of Object.values(meta)) {
        if (isSupabaseUrl(v)) urls.add(v);
      }
    }
  } catch { /* ignore */ }
  // Find <img> tags in content HTML
  const html = item.content || '';
  const imgRe = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    if (isSupabaseUrl(m[1])) urls.add(m[1]);
  }
  return [...urls];
}

export default function MigrateToCloudinaryPage() {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const addLog = (msg) => setLog((prev) => [...prev.slice(-200), msg]);

  const start = async () => {
    setRunning(true);
    setDone(false);
    setLog([]);
    setProgress({ current: 0, total: 0 });
    const urlMap = new Map(); // old URL -> new Cloudinary URL

    try {
      const items = await contentService.getAll();
      addLog(`Found ${items.length} content items.`);

      // Collect all unique Supabase URLs across items
      const allUrls = new Set();
      const itemUrls = new Map();
      for (const item of items) {
        const urls = extractSupabaseUrls(item);
        if (urls.length > 0) {
          itemUrls.set(item.id, { item, urls });
          urls.forEach((u) => allUrls.add(u));
        }
      }
      addLog(`Found ${allUrls.size} unique Supabase-hosted images.`);
      setProgress({ current: 0, total: allUrls.size });

      // Upload each unique URL to Cloudinary (via URL — no download needed)
      let i = 0;
      for (const oldUrl of allUrls) {
        i++;
        setProgress({ current: i, total: allUrls.size });
        try {
          // Cloudinary can fetch directly from the URL
          const form = new FormData();
          form.append('file', fetchableUrl(oldUrl));
          form.append('upload_preset', 'portfolio_uploads');
          form.append('folder', 'portfolio');
          const res = await fetch('https://api.cloudinary.com/v1_1/ovj5ffsn/image/upload', {
            method: 'POST',
            body: form,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (!data.secure_url) throw new Error('No URL returned');
          const newUrl = optimizedCloudinaryUrl(data.secure_url);
          urlMap.set(oldUrl, newUrl);
          addLog(`✓ ${i}/${allUrls.size}: migrated`);
        } catch (err) {
          addLog(`✗ ${i}/${allUrls.size}: failed — ${err.message}`);
        }
      }

      // Ensure all Cloudinary URLs use f_auto,q_auto (strict mode is now off)
      for (const item of items) {
        let fixed = false;
        const updates = {};
        const addTransform = (u) =>
          typeof u === 'string' && u.includes('res.cloudinary.com') && !u.includes('/upload/f_auto,q_auto/')
            ? u.replace('/upload/', '/upload/f_auto,q_auto/')
            : u;
        for (const f of ['cover_image', 'thumbnail', 'og_image']) {
          const nu = addTransform(item[f]);
          if (nu !== item[f]) { updates[f] = nu; fixed = true; }
        }
        if (typeof item.content === 'string') {
          const nc = item.content.replace(
            /https:\/\/res\.cloudinary\.com\/[^"']+?\/upload\/(?!f_auto,q_auto\/)/g,
            (m) => m.replace('/upload/', '/upload/f_auto,q_auto/')
          );
          if (nc !== item.content) { updates.content = nc; fixed = true; }
        }
        if (fixed) {
          await contentService.update(item.id, updates);
          addLog(`Updated transforms: ${item.title || item.id}`);
        }
      }

      // Update each content item with the new URLs
      let updated = 0;
      for (const [id, { item, urls }] of itemUrls) {
        const updates = {};
        let changed = false;

        for (const f of ['cover_image', 'thumbnail', 'og_image']) {
          if (item[f] && urlMap.has(item[f])) {
            updates[f] = urlMap.get(item[f]);
            changed = true;
          }
        }

        // Replace URLs in content HTML
        if (item.content) {
          let newContent = item.content;
          for (const oldUrl of urls) {
            if (urlMap.has(oldUrl)) {
              newContent = newContent.split(oldUrl).join(urlMap.get(oldUrl));
            }
          }
          if (newContent !== item.content) {
            updates.content = newContent;
            changed = true;
          }
        }

        if (changed) {
          await contentService.update(id, updates);
          updated++;
          addLog(`Updated item: ${item.title || id}`);
        }
      }

      addLog(`Done! Migrated ${urlMap.size} images across ${updated} items.`);
      setDone(true);
    } catch (err) {
      addLog(`Fatal error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="admin-page-container" style={{ maxWidth: 720 }}>
      <h1>Migrate Images to Cloudinary</h1>
      <p style={{ color: 'var(--admin-text-2)', marginBottom: 20 }}>
        This one-time tool moves all Supabase-hosted images to Cloudinary's CDN
        for faster page loads. It updates covers, thumbnails, and article images
        automatically. Keep this tab open until it finishes.
      </p>
      {!running && !done && (
        <button className="admin-btn admin-btn-primary" onClick={start}>
          Start Migration
        </button>
      )}
      {(running || done) && progress.total > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, marginBottom: 6 }}>
            {progress.current} / {progress.total} images
          </div>
          <div style={{ height: 8, background: 'var(--admin-border)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.round((progress.current / progress.total) * 100)}%`,
                background: 'var(--admin-primary)',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      )}
      <div
        style={{
          background: '#1a1a1a',
          color: '#e0e0e0',
          borderRadius: 8,
          padding: 16,
          fontFamily: 'monospace',
          fontSize: 12,
          maxHeight: 400,
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
        }}
      >
        {log.length === 0 ? 'Press Start to begin…' : log.join('\n')}
      </div>
      {done && (
        <button className="admin-btn admin-btn-secondary" style={{ marginTop: 16 }} onClick={() => { setDone(false); setLog([]); }}>
          Run Again
        </button>
      )}
    </div>
  );
}

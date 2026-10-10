import React, { useState } from 'react';
import { getSupabaseConfig, getStoredSession } from '../lib/supabase';
import { compressImage } from '../lib/compressImage';

// One-time utility: compress all existing images in the portfolio-media bucket.
// Runs in the admin with the logged-in session (which has storage write access).
// Visit /admin/compress-media while logged in, click Start, keep the tab open.
const BUCKET = 'portfolio-media';
const MAX_IMG_DIM = 1600;

export default function CompressMediaPage() {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const [done, setDone] = useState(false);

  const addLog = (msg) => setLog((prev) => [...prev.slice(-200), msg]);

  const apiFetch = async (path, opts = {}) => {
    const config = getSupabaseConfig();
    const session = getStoredSession();
    const token = session?.access_token || config.anonKey;
    const res = await fetch(`${config.url}${path}`, {
      ...opts,
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
        ...(opts.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    return res;
  };

  const start = async () => {
    setRunning(true);
    setDone(false);
    setLog([]);
    try {
      // List all objects
      const listRes = await apiFetch(`/storage/v1/object/list/${BUCKET}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: '', limit: 1000, offset: 0 }),
      });
      const files = await listRes.json();
      addLog(`Found ${files.length} files.`);

      let compressed = 0;
      let skipped = 0;
      let savedBytes = 0;

      for (const f of files) {
        const name = f.name;
        const mime = (f.metadata && f.metadata.mimetype) || '';
        // Only JPEG/PNG/WebP — skip videos, SVGs, GIFs
        if (!/^image\/(jpeg|png|webp)$/.test(mime) && !/\.(jpe?g|png|webp)$/i.test(name)) {
          skipped++;
          continue;
        }
        try {
          // Download
          const dlRes = await apiFetch(`/storage/v1/object/${BUCKET}/${encodeURIComponent(name)}`);
          const blob = await dlRes.blob();
          const origSize = blob.size;
          const file = new File([blob], name, { type: blob.type || mime });
          // Compress
          const out = await compressImage(file);
          if (out.size >= origSize * 0.95) {
            addLog(`↷ ${name} — already optimal (${Math.round(origSize / 1024)}KB)`);
            skipped++;
            continue;
          }
          // Re-upload in place (PUT overwrites)
          await apiFetch(`/storage/v1/object/${BUCKET}/${encodeURIComponent(name)}`, {
            method: 'PUT',
            headers: { 'Content-Type': out.type },
            body: out,
          });
          compressed++;
          savedBytes += origSize - out.size;
          addLog(`✓ ${name}: ${Math.round(origSize / 1024)}KB → ${Math.round(out.size / 1024)}KB`);
        } catch (err) {
          addLog(`✗ ${name}: ${err.message}`);
        }
      }
      addLog(`Done. Compressed ${compressed}, skipped ${skipped}. Saved ~${Math.round(savedBytes / 1024)}KB total.`);
      setDone(true);
    } catch (err) {
      addLog(`Fatal: ${err.message}`);
    }
    setRunning(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '720px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>Compress existing media</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Downloads every JPEG/PNG/WebP in the <code>portfolio-media</code> bucket, compresses
        (max 1600px, quality 82), and re-uploads in place. URLs don't change.
        Videos, SVGs and GIFs are skipped. Keep this tab open until it finishes.
      </p>
      <button
        onClick={start}
        disabled={running}
        style={{
          padding: '10px 24px', fontSize: '14px', fontWeight: 600, color: '#fff',
          background: running ? '#9ca3af' : '#7c3aed', border: 'none', borderRadius: '8px',
          cursor: running ? 'default' : 'pointer',
        }}
      >
        {running ? 'Working…' : done ? 'Run again' : 'Start compression'}
      </button>
      <div style={{
        marginTop: '20px', background: '#111827', color: '#d1d5db', borderRadius: '8px',
        padding: '16px', fontFamily: 'monospace', fontSize: '12px', maxHeight: '420px',
        overflowY: 'auto', whiteSpace: 'pre-wrap',
      }}>
        {log.length === 0 ? 'Press Start to begin.' : log.join('\n')}
      </div>
    </div>
  );
}

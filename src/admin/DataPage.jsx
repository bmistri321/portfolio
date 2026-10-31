import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense, lazy } from 'react';
import {
  Globe as GlobeIcon,
  RefreshCw,
  Search,
  Users,
  Eye,
  MapPin,
  X,
} from 'lucide-react';
import { supabaseRequest } from '../lib/supabase';

// The globe (three.js) is lazy-loaded so it only downloads when this
// admin page opens — never on the public site, and not on other admin pages.
const Globe = lazy(() => import('react-globe.gl'));

const KOLKATA = { lat: 22.57, lng: 88.36 };
const RANGES = [
  { id: '24h', label: '24h', ms: 24 * 60 * 60 * 1000 },
  { id: '7d', label: '7 days', ms: 7 * 24 * 60 * 60 * 1000 },
  { id: '30d', label: '30 days', ms: 30 * 24 * 60 * 60 * 1000 },
  { id: 'all', label: 'All time', ms: null },
];

function countryName(code, fallback) {
  if (!code) return fallback || 'Unknown';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || fallback || code;
  } catch {
    return fallback || code;
  }
}

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function shortId(id) {
  return id ? String(id).slice(0, 8) : '—';
}

function isMissingTableError(err) {
  const msg = String(err && (err.message || '')).toLowerCase();
  const code = err && err.details ? String(err.details.code || '') : '';
  return (
    err?.status === 404 ||
    code === 'PGRST205' ||
    code === '42501' ||
    msg.includes('does not exist') ||
    msg.includes('permission denied') ||
    msg.includes('site_visits')
  );
}

export default function DataPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missingTable, setMissingTable] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [range, setRange] = useState('7d');
  const [country, setCountry] = useState('all');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('visitors');
  const [selected, setSelected] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const globeRef = useRef(null);
  const wrapRef = useRef(null);
  const [globeSize, setGlobeSize] = useState({ width: 760, height: 480 });

  const load = useCallback(async () => {
    setLoadFailed(false);
    try {
      const rangeDef = RANGES.find((r) => r.id === range);
      let query = '/rest/v1/site_visits?select=*&order=created_at.desc&limit=1000';
      if (rangeDef && rangeDef.ms) {
        query += `&created_at=gte.${encodeURIComponent(new Date(Date.now() - rangeDef.ms).toISOString())}`;
      }
      const data = await supabaseRequest(query);
      setRows(Array.isArray(data) ? data : []);
      setMissingTable(false);
    } catch (err) {
      if (isMissingTableError(err)) {
        setMissingTable(true);
      } else {
        setLoadFailed(true);
      }
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const update = () => {
      const w = el.clientWidth || 760;
      setGlobeSize({ width: w, height: Math.max(380, Math.min(520, Math.round(w * 0.62))) });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const countries = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      if (r.country_code) map.set(r.country_code, countryName(r.country_code, r.country));
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const rangedRows = useMemo(() => {
    if (country === 'all') return rows;
    return rows.filter((r) => r.country_code === country);
  }, [rows, country]);

  const stats = useMemo(() => {
    const visitors = new Set(rangedRows.map((r) => r.visitor_id));
    const countrySet = new Set(rangedRows.map((r) => r.country_code).filter(Boolean));
    const pageCounts = {};
    rangedRows.forEach((r) => {
      if (r.page_path) pageCounts[r.page_path] = (pageCounts[r.page_path] || 0) + 1;
    });
    const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0];
    return {
      pageviews: rangedRows.length,
      visitors: visitors.size,
      countries: countrySet.size,
      topPage: topPage ? `${topPage[0]} (${topPage[1]})` : '—',
    };
  }, [rangedRows]);

  const searchedRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rangedRows;
    return rangedRows.filter((r) =>
      String(r.city || '').toLowerCase().includes(q) ||
      String(r.page_path || '').toLowerCase().includes(q) ||
      String(r.visitor_id || '').toLowerCase().includes(q) ||
      String(r.country || '').toLowerCase().includes(q)
    );
  }, [rangedRows, search]);

  const visitors = useMemo(() => {
    const map = new Map();
    searchedRows.forEach((r) => {
      const id = r.visitor_id || 'unknown';
      const cur = map.get(id) || {
        visitor_id: id, rows: [], first_seen: r.created_at, last_seen: r.created_at,
      };
      cur.rows.push(r);
      if (r.created_at && (!cur.first_seen || r.created_at < cur.first_seen)) cur.first_seen = r.created_at;
      if (r.created_at && (!cur.last_seen || r.created_at > cur.last_seen)) cur.last_seen = r.created_at;
      map.set(id, cur);
    });
    return [...map.values()]
      .map((v) => {
        const latest = [...v.rows].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0] || {};
        return {
          ...v,
          city: latest.city, region: latest.region, country: latest.country,
          country_code: latest.country_code, latitude: latest.latitude, longitude: latest.longitude,
          device: latest.device, browser: latest.browser, os: latest.os,
          pages: [...new Set(v.rows.map((r) => r.page_path).filter(Boolean))],
          referrer: v.rows.map((r) => r.referrer).find(Boolean) || null,
          utms: [...new Set(v.rows.map((r) => [r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(' / ')).filter(Boolean))],
        };
      })
      .sort((a, b) => String(b.last_seen).localeCompare(String(a.last_seen)));
  }, [searchedRows]);

  const points = useMemo(() => {
    const map = new Map();
    rangedRows.forEach((r) => {
      if (r.latitude === null || r.latitude === undefined || r.longitude === null || r.longitude === undefined) return;
      const key = `${Number(r.latitude).toFixed(2)},${Number(r.longitude).toFixed(2)}`;
      const cur = map.get(key) || {
        lat: Number(r.latitude), lng: Number(r.longitude), city: r.city, region: r.region,
        country: r.country, country_code: r.country_code, count: 0, rows: [],
      };
      cur.count += 1;
      cur.rows.push(r);
      if (!cur.city && r.city) cur.city = r.city;
      map.set(key, cur);
    });
    return [...map.values()];
  }, [rangedRows]);

  const arcs = useMemo(() => points
    .filter((p) => Math.abs(p.lat - KOLKATA.lat) > 0.5 || Math.abs(p.lng - KOLKATA.lng) > 0.5)
    .map((p) => ({ startLat: p.lat, startLng: p.lng, endLat: KOLKATA.lat, endLng: KOLKATA.lng })),
  [points]);

  function stopRotate() {
    if (!autoRotate) return;
    setAutoRotate(false);
    try {
      const controls = globeRef.current && globeRef.current.controls();
      if (controls) controls.autoRotate = false;
    } catch {
      // Globe controls are optional.
    }
  }

  function focusLocation(loc) {
    if (!loc || loc.lat === null || loc.lat === undefined) return;
    stopRotate();
    try {
      if (globeRef.current) globeRef.current.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: 1.6 }, 1000);
    } catch {
      // Focusing is a nice-to-have; the detail card still shows.
    }
  }

  function selectFromRows(locRows, loc) {
    const sorted = [...locRows].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    const latest = sorted[0] || {};
    setSelected({
      city: loc.city || latest.city, region: loc.region || latest.region,
      country: loc.country || latest.country, country_code: loc.country_code || latest.country_code,
      lat: loc.lat !== undefined ? loc.lat : latest.latitude,
      lng: loc.lng !== undefined ? loc.lng : latest.longitude,
      device: latest.device, browser: latest.browser, os: latest.os,
      first_seen: sorted[sorted.length - 1]?.created_at,
      last_seen: sorted[0]?.created_at,
      pages: [...new Set(sorted.map((r) => r.page_path).filter(Boolean))],
      referrer: sorted.map((r) => r.referrer).find(Boolean) || null,
      utms: [...new Set(sorted.map((r) => [r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(' / ')).filter(Boolean))],
      totalViews: sorted.length,
    });
  }

  function selectPoint(point) {
    selectFromRows(point.rows, point);
    focusLocation(point);
  }

  function selectVisitor(visitor) {
    selectFromRows(visitor.rows, visitor);
    focusLocation(visitor);
  }

  function selectPageview(row) {
    const sameSpot = rangedRows.filter((r) =>
      r.latitude === row.latitude && r.longitude === row.longitude && row.latitude !== null && row.latitude !== undefined);
    selectFromRows(sameSpot.length ? sameSpot : [row], row);
    focusLocation(row);
  }

  function onGlobeReady() {
    if (!autoRotate) return;
    try {
      const controls = globeRef.current && globeRef.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
      }
    } catch {
      // Auto-rotate is optional.
    }
  }

  if (missingTable) {
    return (
      <div className="admin-page-container">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Visitor Data</h1>
            <p className="admin-page-subtitle">Where your visitors come from, on a globe.</p>
          </div>
        </div>
        <div className="admin-card" style={{ padding: '28px' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Tracking table not set up yet</p>
          <p style={{ color: 'var(--admin-text-secondary)', lineHeight: 1.6 }}>
            Run scripts/create_tracking_schema.sql in the Supabase SQL editor, then refresh this page.
            No visitor data is stored until that migration has run.
          </p>
          <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" style={{ marginTop: '16px' }} onClick={() => { setLoading(true); setMissingTable(false); load(); }}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Visitor Data</h1>
          <p className="admin-page-subtitle">
            Approximate, city-level locations only. No raw IP is stored.
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => { setLoading(true); load(); }}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-controls">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`admin-btn admin-btn-sm ${range === r.id ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                onClick={() => setRange(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="admin-filter-group">
            <select className="admin-select" value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Filter by country">
              <option value="all">All countries</option>
              {countries.map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            <div className="admin-search-input-wrap">
              <Search size={16} />
              <input
                className="admin-search-input"
                type="search"
                placeholder="Search city, page, or visitor…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-label">Pageviews</div>
          <div className="admin-metric-value">{loading ? '…' : stats.pageviews}</div>
        </div>
        <div className="admin-metric-card">
          <div className="admin-metric-label">Unique visitors</div>
          <div className="admin-metric-value">{loading ? '…' : stats.visitors}</div>
        </div>
        <div className="admin-metric-card">
          <div className="admin-metric-label">Countries</div>
          <div className="admin-metric-value">{loading ? '…' : stats.countries}</div>
        </div>
        <div className="admin-metric-card">
          <div className="admin-metric-label">Top page</div>
          <div className="admin-metric-value" style={{ fontSize: '16px', wordBreak: 'break-all' }}>{loading ? '…' : stats.topPage}</div>
        </div>
      </div>

      {loadFailed && (
        <div className="admin-card" style={{ padding: '16px 20px' }}>
          Could not load visitor data. Check the connection and try Refresh.
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GlobeIcon size={16} style={{ color: 'var(--admin-text-muted)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Visitor Globe</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
            Arcs point to Kolkata · click a point to focus it
          </span>
        </div>
        <div ref={wrapRef} style={{ background: '#0f172a', overflow: 'hidden' }}>
          <Suspense fallback={<div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading globe…</div>}>
            <Globe
              ref={globeRef}
              width={globeSize.width}
              height={globeSize.height}
              backgroundColor="rgba(0,0,0,0)"
              pointsData={points}
              pointLat="lat"
              pointLng="lng"
              pointColor={() => '#cb53a2'}
              pointRadius={(p) => 0.4 + Math.min(1.2, Math.sqrt(p.count) * 0.25)}
              pointAltitude={0.02}
              pointLabel={(p) => `${p.city || 'Unknown city'}, ${countryName(p.country_code, p.country)} — ${p.count} visit${p.count === 1 ? '' : 's'}`}
              onPointClick={selectPoint}
              arcsData={arcs}
              arcStartLat="startLat"
              arcStartLng="startLng"
              arcEndLat="endLat"
              arcEndLng="endLng"
              arcColor={() => '#cb53a2'}
              arcStroke={0.4}
              arcDashLength={0.4}
              arcDashGap={0.2}
              arcDashAnimateTime={4000}
              onGlobeClick={stopRotate}
              onGlobeReady={onGlobeReady}
            />
          </Suspense>
        </div>
        {points.length === 0 && !loading && (
          <p style={{ padding: '14px 20px', color: 'var(--admin-text-muted)' }}>
            No located visits in this period yet. Visits without a location still appear in the tables below.
          </p>
        )}
      </div>

      {selected && (
        <div className="admin-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: '#cb53a2' }} />
                <h2 style={{ fontSize: '16px', fontWeight: 600 }}>
                  {selected.city || 'Unknown city'}{selected.region ? `, ${selected.region}` : ''} — {countryName(selected.country_code, selected.country)}
                </h2>
              </div>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '13px', marginTop: '4px' }}>
                Approximate location only — city level, not an exact address.
              </p>
            </div>
            <button type="button" className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => setSelected(null)} aria-label="Close details">
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px', fontSize: '13.5px' }}>
            <div><strong>Device:</strong> {selected.device || '—'} · {selected.browser || '—'} · {selected.os || '—'}</div>
            <div><strong>First seen:</strong> {fmtDate(selected.first_seen)}</div>
            <div><strong>Last seen:</strong> {fmtDate(selected.last_seen)}</div>
            <div><strong>Views:</strong> {selected.totalViews || '—'}</div>
            <div><strong>Referrer:</strong> {selected.referrer || '—'}</div>
            <div><strong>UTMs:</strong> {selected.utms && selected.utms.length ? selected.utms.join(', ') : '—'}</div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '13.5px' }}>
            <strong>Pages:</strong> {selected.pages && selected.pages.length ? selected.pages.join(', ') : '—'}
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className={`admin-btn admin-btn-sm ${tab === 'visitors' ? 'admin-btn-primary' : 'admin-btn-ghost'}`} onClick={() => setTab('visitors')}>
              <Users size={14} />
              <span>Visitors</span>
            </button>
            <button type="button" className={`admin-btn admin-btn-sm ${tab === 'pageviews' ? 'admin-btn-primary' : 'admin-btn-ghost'}`} onClick={() => setTab('pageviews')}>
              <Eye size={14} />
              <span>Pageviews</span>
            </button>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>Click a row to focus it on the globe</span>
        </div>
        {loading && rows.length === 0 ? (
          <p style={{ padding: '20px', color: 'var(--admin-text-muted)' }}>Loading visitor data…</p>
        ) : tab === 'visitors' ? (
          <table className="admin-table">
            <thead>
              <tr><th>Visitor</th><th>Approximate location</th><th>Device</th><th>Browser</th><th>Pages</th><th>Views</th><th>Last seen</th></tr>
            </thead>
            <tbody>
              {visitors.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>No visitors match these filters.</td></tr>
              )}
              {visitors.map((v) => (
                <tr key={v.visitor_id} onClick={() => selectVisitor(v)} style={{ cursor: 'pointer' }}>
                  <td>{shortId(v.visitor_id)}</td>
                  <td>{v.city || 'Unknown'}{v.country_code ? `, ${countryName(v.country_code, v.country)}` : ''}</td>
                  <td>{v.device || '—'}</td>
                  <td>{v.browser || '—'}</td>
                  <td>{v.pages.length}</td>
                  <td>{v.rows.length}</td>
                  <td>{fmtDate(v.last_seen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Time</th><th>Visitor</th><th>Location</th><th>Page</th><th>Device</th><th>Duration</th><th>Scroll</th></tr>
            </thead>
            <tbody>
              {searchedRows.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>No pageviews match these filters.</td></tr>
              )}
              {searchedRows.map((r) => (
                <tr key={r.id} onClick={() => selectPageview(r)} style={{ cursor: 'pointer' }}>
                  <td>{fmtDate(r.created_at)}</td>
                  <td>{shortId(r.visitor_id)}</td>
                  <td>{r.city || 'Unknown'}{r.country_code ? `, ${countryName(r.country_code, r.country)}` : ''}</td>
                  <td style={{ wordBreak: 'break-all' }}>{r.page_path}</td>
                  <td>{r.device || '—'}</td>
                  <td>{r.duration_seconds !== null && r.duration_seconds !== undefined ? `${r.duration_seconds}s` : '—'}</td>
                  <td>{r.max_scroll !== null && r.max_scroll !== undefined ? `${r.max_scroll}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', padding: '4px 2px 20px' }}>
        Auto-refreshes every 60 seconds. Locations are approximate, city-level only, and no raw IP is stored.
      </p>
    </div>
  );
}

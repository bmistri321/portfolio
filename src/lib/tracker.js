import { useEffect } from 'react';

// Visitor tracker for the PUBLIC site only. Mounted once from App.jsx.
// A pageview row is created when a page is entered, and the exit beacon
// (duration + max scroll) tries to patch that same row server-side; with
// an anon-only Supabase key the patch cannot run, so the pageview row
// itself is still stored and only the duration stays empty. That is a
// deliberate trade-off of the anon-INSERT-only RLS on site_visits.
// It must never throw: every send is wrapped so tracking can never break
// the public site.

const VISITOR_KEY = 'bm_visitor_id';
const SESSION_KEY = 'bm_session_id';
const ENDPOINT = '/api/track';

function safeId(storage, key) {
  try {
    let id = storage.getItem(key);
    if (!id) {
      id =
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
      storage.setItem(key, id);
    }
    return id;
  } catch {
    return 'unknown';
  }
}

function parseUA(ua) {
  const u = ua || '';
  let browser = 'Other';
  if (/Edg\//.test(u)) browser = 'Edge';
  else if (/OPR\//.test(u)) browser = 'Opera';
  else if (/Chrome\//.test(u)) browser = 'Chrome';
  else if (/Firefox\//.test(u)) browser = 'Firefox';
  else if (/Safari\//.test(u) && /Version\//.test(u)) browser = 'Safari';
  let os = 'Other';
  if (/Windows/.test(u)) os = 'Windows';
  else if (/Mac OS X/.test(u)) os = 'macOS';
  else if (/Android/.test(u)) os = 'Android';
  else if (/iPhone|iPad/.test(u)) os = 'iOS';
  else if (/Linux/.test(u)) os = 'Linux';
  const device = /Mobi|Android|iPhone|iPad/.test(u) ? 'mobile' : 'desktop';
  return { browser, os, device };
}

export function shouldTrack() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1') return false;
  if (host.startsWith('admin.') || host.includes('admin.bishalmistri.com')) return false;
  if (host.startsWith('books.')) return false;
  if (path.startsWith('/admin') || path === '/data') return false;
  return true;
}

function send(payload) {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking must fail silently.
  }
}

let mounted = false;

export function mountVisitorTracking() {
  if (mounted || !shouldTrack()) return () => {};
  mounted = true;

  let visitorId = 'unknown';
  let sessionId = 'unknown';
  try {
    visitorId = safeId(window.localStorage, VISITOR_KEY);
    sessionId = safeId(window.sessionStorage, SESSION_KEY);
  } catch {
    // Fall through with 'unknown' ids.
  }
  const { browser, os, device } = parseUA(typeof navigator !== 'undefined' ? navigator.userAgent : '');

  let current = null;

  function basePayload(path) {
    const params = new URLSearchParams(window.location.search);
    return {
      visitor_id: visitorId,
      session_id: sessionId,
      page_path: path,
      referrer: document.referrer || null,
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      language: typeof navigator !== 'undefined' ? navigator.language || null : null,
      timezone: (() => {
        try { return Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch { return null; }
      })(),
      screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : null,
      device,
      browser,
      os,
    };
  }

  function startView(path) {
    const previous = current;
    current = { path, startedAt: Date.now(), maxScroll: 0 };
    if (previous) {
      send({
        ...basePayload(previous.path),
        duration_seconds: Math.max(0, Math.round((Date.now() - previous.startedAt) / 1000)),
        max_scroll: previous.maxScroll,
        is_exit: true,
      });
    }
    send(basePayload(path));
  }

  function onScroll() {
    if (!current) return;
    try {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100) : 100;
      current.maxScroll = Math.max(current.maxScroll, Math.min(100, Math.max(0, pct)));
    } catch {
      // Ignore scroll measurement errors.
    }
  }

  function onPageHide() {
    if (!current) return;
    const view = current;
    current = null;
    send({
      ...basePayload(view.path),
      duration_seconds: Math.max(0, Math.round((Date.now() - view.startedAt) / 1000)),
      max_scroll: view.maxScroll,
      is_exit: true,
    });
  }

  function onRoute() {
    const path = window.location.pathname;
    if (!current || current.path !== path) startView(path);
  }

  const origPush = window.history.pushState;
  const origReplace = window.history.replaceState;
  window.history.pushState = function (...args) {
    origPush.apply(this, args);
    onRoute();
  };
  window.history.replaceState = function (...args) {
    origReplace.apply(this, args);
    onRoute();
  };

  window.addEventListener('popstate', onRoute);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pagehide', onPageHide);
  startView(window.location.pathname);

  return () => {
    window.removeEventListener('popstate', onRoute);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('pagehide', onPageHide);
    window.history.pushState = origPush;
    window.history.replaceState = origReplace;
    mounted = false;
  };
}

// Convenience hook for App.jsx.
export function useVisitorTracking(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    return mountVisitorTracking();
  }, [enabled]);
}

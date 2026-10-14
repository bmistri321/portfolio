// GET /api/og?path=/casestudy/friender
// Returns minimal crawler-friendly HTML with correct Open Graph tags for a
// given site path. Used by the Vercel rewrite that routes social crawlers
// (which don't run JavaScript) here instead of the SPA shell.
//
// Query: ?path=/casestudy/<slug>  (or ?slug=<slug> for case studies)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const SITE = 'https://www.bishalmistri.com';
const DEFAULT_TITLE = 'Bishal Mistri — Product Designer';
const DEFAULT_DESC =
  'Bishal Mistri is a Product Designer contributing to a better future by solving one problem at a time.';
const DEFAULT_IMAGE = ''; // No fallback — never show a stale photo.

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchContentBySlug(slug) {
  if (!SUPABASE_URL || !SUPABASE_ANON || !slug) return null;
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/content?slug=eq.${encodeURIComponent(slug)}` +
      `&select=title,excerpt,seo_title,seo_description,cover_image,thumbnail,status` +
      `&status=eq.published&limit=1`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows && rows[0] ? rows[0] : null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const rawPath = String(req.query?.path || '').trim();
  const slugParam = String(req.query?.slug || '').trim();

  // Determine slug from /casestudy/<slug> or /writing/<slug>
  let slug = slugParam;
  let kind = 'page';
  const m = rawPath.match(/^\/(casestudy|writing)\/([^/?#]+)/i);
  if (m) {
    kind = m[1].toLowerCase();
    slug = m[2];
  }

  let title = DEFAULT_TITLE;
  let desc = DEFAULT_DESC;
  let image = DEFAULT_IMAGE;
  let pageUrl = SITE + (rawPath.startsWith('/') ? rawPath : '/');

  if (slug) {
    const item = await fetchContentBySlug(slug);
    if (item) {
      title = item.seo_title || (item.title ? `${item.title} — Bishal Mistri` : title);
      desc = item.seo_description || item.excerpt || desc;
      image = item.cover_image || item.thumbnail || '';
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${esc(pageUrl)}" />
<meta property="og:site_name" content="Bishal Mistri" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
${image ? `<meta property="og:image" content="${esc(image)}" />` : ''}
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
${image ? `<meta name="twitter:image" content="${esc(image)}" />` : ''}
</head>
<body><p>${esc(title)}</p></body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  return res.status(200).send(html);
}

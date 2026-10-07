// ---------------------------------------------------------------------------
// _medium.js — shared Medium article extraction helpers.
//
// NOTE: the leading underscore keeps Vercel from deploying this file as its
// own serverless function; it is imported by api/fetch-medium.js and
// api/sync-medium.js only.
//
// Strategy: Medium's own JSON endpoints are Cloudflare-challenged for
// server-side fetchers, but the official per-author RSS feeds are openly
// served and contain the FULL article HTML (content:encoded) for each of
// the author's recent posts. We locate the article by its 12-hex-char post
// id inside the feed, then clean the HTML for the portfolio renderer.
// ---------------------------------------------------------------------------

import { createHash } from 'node:crypto';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function fail(message) {
  const e = new Error(message);
  e.isMediumError = true;
  throw e;
}

// -- URL parsing ------------------------------------------------------------

export function parseMediumUrl(raw) {
  let u;
  try {
    u = new URL(String(raw || '').trim());
  } catch {
    fail('That does not look like a link. Paste the full Medium article URL.');
  }
  if (!/^https?:$/.test(u.protocol)) fail('That does not look like a link. Paste the full Medium article URL.');

  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const path = u.pathname.replace(/\/+$/, '');
  const onMedium = host === 'medium.com' || host.endsWith('.medium.com');

  // The post id is a 12-char hex suffix: .../slug-<id> or /p/<id>.
  let postId = null;
  const pm = path.match(/^\/p\/([a-f0-9]{12})(?:[/?#]|$)/i);
  if (pm) postId = pm[1].toLowerCase();
  if (!postId) {
    const seg = path.split('/').filter(Boolean).pop() || '';
    const tail = seg.split('-').pop();
    if (/^[a-f0-9]{12}$/i.test(tail)) postId = tail.toLowerCase();
  }
  if (!postId) {
    fail(
      'Could not find an article id in that link. Open the article on Medium and copy the full URL from the address bar.'
    );
  }

  // Candidate RSS feeds that may list this article (tried in order).
  const feeds = [];
  if (host === 'medium.com') {
    const first = path.split('/').filter(Boolean)[0];
    if (first && first !== 'p') {
      if (first.startsWith('@')) feeds.push(`https://medium.com/feed/${first}`);
      else {
        feeds.push(`https://medium.com/feed/@${first}`);
        feeds.push(`https://${first}.medium.com/feed`);
      }
    }
  } else if (host.endsWith('.medium.com')) {
    feeds.push(`https://${host}/feed`);
  } else {
    // Custom-domain publication (e.g. blog.example.com). If it is not a
    // Medium publication the feed fetch below simply fails and we report it.
    feeds.push(`https://${host}/feed`);
  }

  return { postId, feeds, onMedium };
}

// -- Feed fetching ----------------------------------------------------------

export async function fetchFeedXml(feedUrl) {
  let res;
  try {
    res = await fetch(feedUrl, {
      headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml' },
      signal: AbortSignal.timeout(25000),
    });
  } catch (e) {
    fail(`Could not reach the author's feed (${feedUrl}). ${e.name === 'TimeoutError' ? 'The request timed out.' : 'Check the link and try again.'}`);
  }
  if (!res.ok) fail(`The author's feed did not respond (${res.status}). Check the link and try again.`);
  const text = await res.text();
  if (!/<(rss|feed)[\s>]/i.test(text)) fail('That address did not return a Medium feed.');
  return text;
}

export function findFeedItem(xml, postId) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  const pid = String(postId).toLowerCase();
  for (const it of items) {
    const lm = it.match(/<link>([^<]*)<\/link>/);
    const link = (lm && lm[1] || '').trim();
    if (link && link.toLowerCase().includes(pid)) return { itemXml: it, link: link.split('?')[0] };
  }
  return null;
}

// -- Field extraction --------------------------------------------------------

function tagText(itemXml, tag) {
  const m = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  if (!m) return '';
  return m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function stripTags(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Clean Medium's RSS HTML for the portfolio article renderer, whose
// sanitizer allows: p br strong em u s a ul ol li blockquote h2 h3
// img figure figcaption video source hr div.
export function cleanMediumHtml(html) {
  let h = String(html || '');

  // 1. Tracking pixel.
  h = h.replace(/<img[^>]+src="[^"]*medium\.com\/_\/stat[^"]*"[^>]*>/gi, '');

  // 2. "…was originally published in <pub> on Medium, where people are
  //    continuing the conversation…" footer after the final <hr>.
  h = h.replace(/<hr\s*\/?>\s*<p>\s*<a[^>]*>[^<]*<\/a>\s+was originally published in[\s\S]*?<\/p>\s*$/i, '');
  h = h.trim();

  // 3. Headings: Medium's large section title -> our h2 (drives the article
  //    sidebar nav); Medium's small heading -> our h3.
  h = h.replace(/<h3(\s[^>]*)?>/gi, '<h2$1>').replace(/<\/h3>/gi, '</h2>');
  h = h.replace(/<h4(\s[^>]*)?>/gi, '<h3$1>').replace(/<\/h4>/gi, '</h3>');

  // 4. Code blocks: the renderer has no pre/code styling, so keep them as
  //    readable line-broken paragraphs instead of one collapsed line.
  h = h.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_m, code) => {
    const text = stripTags(code).replace(/\s*\n\s*/g, '\n').trim();
    if (!text) return '';
    const withBreaks = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    return `<p>${withBreaks}</p>`;
  });

  // 5. External links open in a new tab.
  h = h.replace(/<a(\s[^>]*)?>/gi, (m, attrs) => {
    if (/target=/i.test(attrs || '')) return m;
    return `<a target="_blank" rel="noopener noreferrer"${attrs || ''}>`;
  });

  // 6. Tidy: drop empty paragraphs left behind.
  h = h.replace(/<p>\s*<\/p>/gi, '');

  // Excerpt: first substantial paragraph (skips bylines like "By Jane Doe"
  // and other stub paragraphs).
  const paras = [...h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripTags(m[1]))
    .filter((t) => t && !/^by\s/i.test(t));
  const excerpt = (paras.find((t) => t.length >= 80) || paras[0] || '').slice(0, 160);

  const imgM = h.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
  const coverImage = imgM ? imgM[1] : null;

  return { html: h, excerpt, coverImage };
}

export function extractFromItem(itemXml, link, postId) {
  const title = stripTags(tagText(itemXml, 'title'));
  const rawHtml = tagText(itemXml, 'content:encoded') || tagText(itemXml, 'description');
  const cleaned = cleanMediumHtml(rawHtml);
  const pubDate = tagText(itemXml, 'pubDate');
  let publishedAt = null;
  if (pubDate) {
    const d = new Date(pubDate);
    if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString();
  }
  return {
    postId: String(postId).toLowerCase(),
    url: link,
    title,
    author: stripTags(tagText(itemXml, 'dc:creator')),
    publishedAt,
    html: cleaned.html,
    excerpt: cleaned.excerpt,
    coverImage: cleaned.coverImage,
    contentHash: createHash('sha256').update(cleaned.html).digest('hex'),
  };
}

// -- High-level import -------------------------------------------------------

export async function importFromMedium(rawUrl) {
  const { postId, feeds, onMedium } = parseMediumUrl(rawUrl);

  if (!feeds.length) {
    fail(
      'That is a short /p/ link, which does not say who wrote it. Open the article on Medium and copy the full URL from the address bar (it includes the author name).'
    );
  }
  if (!onMedium) {
    // Still try — it may be a publication's custom domain.
  }

  let lastError = null;
  for (const feedUrl of feeds) {
    try {
      const xml = await fetchFeedXml(feedUrl);
      const found = findFeedItem(xml, postId);
      if (found) return { ...extractFromItem(found.itemXml, found.link, postId), feedUrl };
      lastError = new Error(
        'Found the author\u2019s feed, but this article is not among their latest posts. ' +
          'Medium only lists recent articles in the feed — if it is an older piece, open it on Medium, copy the text, and paste it into the editor.'
      );
      lastError.isMediumError = true;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error('Could not fetch the article. Check the link and try again.');
}

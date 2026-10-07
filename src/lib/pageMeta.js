// Central helper for per-page SEO meta tags.
// This site is a client-side SPA, so the document head is updated on every
// route change instead of being baked per page at build time.

export const DEFAULT_DESCRIPTION =
  'Bishal Mistri is a Product Designer contributing to a better future by solving one problem at a time.';

function setMetaContent(attr, key, content) {
  if (!content) return;
  const el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (el) el.setAttribute('content', content);
}

export function applyPageMeta({ title, description } = {}) {
  const desc = description || DEFAULT_DESCRIPTION;
  if (title) {
    document.title = title;
    setMetaContent('property', 'og:title', title);
  }
  setMetaContent('name', 'description', desc);
  setMetaContent('property', 'og:description', desc);
  setMetaContent('property', 'og:url', window.location.href);
}

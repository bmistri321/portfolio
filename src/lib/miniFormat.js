// ---------------------------------------------------------------------------
// miniFormat.js — legacy section-body format <-> HTML conversion.
//
// Legacy mini-format (used before the Blogger-style WYSIWYG editor):
//   **bold**            -> <strong>
//   "> " block          -> <blockquote>  (rendered as the callout box)
//   "• "/"- " lines     -> <ul><li>
//   blank-line groups   -> <p>
// ---------------------------------------------------------------------------

export function isHtml(str) {
  return /<\/?[a-z][^>]*>/i.test(String(str || ''));
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

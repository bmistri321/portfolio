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

function inlineToHtml(text) {
  return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export function miniFormatToHtml(body) {
  const blocks = String(body || '')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      // Callout: "> ..." block
      if (block.startsWith('> ')) {
        const inner = lines
          .map((l) => inlineToHtml(l.replace(/^> /, '')))
          .join('<br/>');
        return `<blockquote>${inner}</blockquote>`;
      }

      // Bullet list: every line starts with "• " or "- "
      if (lines.length > 0 && lines.every((l) => l.startsWith('• ') || l.startsWith('- '))) {
        const items = lines
          .map((l) => `<li>${inlineToHtml(l.replace(/^[•-] /, ''))}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }

      // Plain paragraph (may contain single newlines -> <br/>)
      return `<p>${inlineToHtml(block).replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
}

// Anything the WYSIWYG editor can display: HTML passes through,
// legacy mini-format is converted on the fly.
export function ensureHtml(body) {
  const s = String(body || '').trim();
  if (!s) return '';
  return isHtml(s) ? s : miniFormatToHtml(s);
}

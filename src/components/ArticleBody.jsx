import { useEffect, useRef } from 'react';

// Renders sanitized article HTML with skeleton shimmer placeholders behind
// images until they finish loading, so readers see that an image is coming.
export default function ArticleBody({ html }) {
  const ref = useRef(null);

  // Activate pasted embeds (e.g. StatCounter charts): the editor stores
  // the code base64-encoded in data-embed-html and only shows a
  // placeholder. Here it is decoded and injected for real — scripts are
  // re-created element by element, because scripts added via innerHTML
  // never execute.
  const activateEmbeds = (root) => {
    root.querySelectorAll('.ql-embed-html').forEach((node) => {
      if (node.dataset.embedActive) return;
      let code = '';
      try {
        code = decodeURIComponent(escape(atob(node.getAttribute('data-embed-html') || '')));
      } catch {
        code = node.getAttribute('data-embed-html') || '';
      }
      if (!code) return;
      node.dataset.embedActive = 'true';
      node.textContent = '';
      const tpl = document.createElement('template');
      tpl.innerHTML = code.trim();
      const inject = (srcParent, destParent) => {
        Array.from(srcParent.childNodes).forEach((child) => {
          if (child.nodeName === 'SCRIPT') {
            const s = document.createElement('script');
            Array.from(child.attributes || []).forEach((a) => s.setAttribute(a.name, a.value));
            s.textContent = child.textContent;
            destParent.appendChild(s);
          } else if (child.nodeType === 1) {
            const el = child.cloneNode(false);
            destParent.appendChild(el);
            inject(child, el);
          } else {
            destParent.appendChild(child.cloneNode(true));
          }
        });
      };
      inject(tpl.content, node);
    });
  };

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    activateEmbeds(root);
    const imgs = root.querySelectorAll('img');
    const cleanups = [];
    imgs.forEach((img) => {
      if (img.closest('.img-skeleton-wrap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'img-skeleton-wrap';
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
      const done = () => wrap.classList.add('is-loaded');
      if (img.complete && img.naturalWidth > 0) {
        done();
      } else {
        img.addEventListener('load', done, { once: true });
        // Don't leave the shimmer spinning forever on a broken image.
        img.addEventListener('error', done, { once: true });
        cleanups.push(() => {
          img.removeEventListener('load', done);
          img.removeEventListener('error', done);
        });
      }
    });
    return () => cleanups.forEach((fn) => fn());
  }, [html]);

  return <div ref={ref} className="cs-html-body" dangerouslySetInnerHTML={{ __html: html }} />;
}

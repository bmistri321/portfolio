import { useEffect, useRef } from 'react';

// Renders sanitized article HTML with skeleton shimmer placeholders behind
// images until they finish loading, so readers see that an image is coming.
export default function ArticleBody({ html }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
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

import { useEffect } from 'react';
import { applyPageMeta } from '../lib/pageMeta';

// Resume viewer: the PDF is shown inside this page (rather than served as
// a raw file) so the browser tab carries the site's own favicon and title
// — a raw PDF response has no favicon, and Chrome invents a letter icon
// ("bi") for it instead. The PDF itself is unchanged: it loads through the
// existing /media/ proxy, which serves it inline.
export default function ResumePage() {
  useEffect(() => {
    applyPageMeta({
      title: 'Resume — Bishal Mistri',
      description: 'Resume of Bishal Mistri — product designer.',
    });
  }, []);

  return (
    <iframe
      src="/media/Resume/Bishal_Mistri_Resume.pdf"
      title="Resume — Bishal Mistri"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        border: 'none',
        background: '#fff',
      }}
    />
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { chromeHTML, wirePlayer } from '../components/videoPlayer';

/**
 * The designed video player chrome for the article editor, rendered as an
 * overlay (never inside the editable document, so it can't pollute saved
 * HTML). It tracks the hovered video's position and unmounts with it.
 */
export default function EditorVideoChrome({ video, wrapRef, onLeave }) {
  const uiRef = useRef(null);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const ui = uiRef.current;
    if (!video || !ui || !wrapRef.current) return;

    // Hide the native controls visually; the `controls` attribute stays put
    // because it IS the "show play bar" setting (and what gets saved).
    video.classList.add('vp-native-hidden');
    ui.innerHTML = chromeHTML();
    const cleanupWire = wirePlayer(video, ui, { fullscreenTarget: video });

    const place = () => {
      if (!wrapRef.current) return;
      const wrapRect = wrapRef.current.getBoundingClientRect();
      const r = video.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      setRect({
        top: r.top - wrapRect.top,
        left: r.left - wrapRect.left,
        width: r.width,
        height: r.height,
      });
    };
    place();
    const onScroll = () => place();
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      cleanupWire();
      video.classList.remove('vp-native-hidden');
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [video, wrapRef]);

  if (!rect) return null;
  return (
    <div
      ref={uiRef}
      className="vp vp-overlay"
      contentEditable={false}
      onMouseDown={(e) => e.preventDefault()}
      onMouseLeave={(e) => {
        if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.admin-media-hoverbar')) return;
        if (onLeave) onLeave();
      }}
      style={{
        position: 'absolute',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        margin: 0,
        zIndex: 30,
        borderRadius: 10,
      }}
    />
  );
}

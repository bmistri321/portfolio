import React, { useState, useEffect } from 'react';

// Alt text + caption fields shown below a hovered image/GIF in the editor.
// Edits write straight onto the <img> node (alt / data-caption attributes)
// and push through the normal change pipeline so autosave picks them up.
// Rendered as an overlay OUTSIDE the Quill document — never saved into content.
export default function ImageMetaFields({ node, top, left, onCommit, onLeave }) {
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');

  useEffect(() => {
    setAlt(node.getAttribute('alt') || '');
    setCaption(node.getAttribute('data-caption') || '');
  }, [node]);

  const commitAlt = (v) => {
    setAlt(v);
    const t = v.trim();
    if (t) node.setAttribute('alt', t);
    else node.removeAttribute('alt');
    onCommit();
  };

  const commitCaption = (v) => {
    setCaption(v);
    const t = v.trim();
    if (t) node.setAttribute('data-caption', t);
    else node.removeAttribute('data-caption');
    onCommit();
  };

  return (
    <div
      className="admin-media-fields"
      style={{ position: 'absolute', top, left, zIndex: 40 }}
      onMouseLeave={onLeave}
    >
      <label className="admin-media-field">
        <span>Alt text</span>
        <input
          type="text"
          value={alt}
          placeholder="Describe the image — screen readers & SEO"
          onChange={(e) => commitAlt(e.target.value)}
        />
      </label>
      <label className="admin-media-field">
        <span>Caption</span>
        <input
          type="text"
          value={caption}
          placeholder="Shown below the image on the live site"
          onChange={(e) => commitCaption(e.target.value)}
        />
      </label>
    </div>
  );
}

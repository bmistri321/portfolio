import React, { useEffect, useState } from 'react';

export default function CustomCursor({ isHovering, isClicked }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className={`pm-custom-cursor ${isHovering ? 'active' : ''} ${isClicked ? 'clicked' : ''}`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`
      }}
    >
      <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" x2="16.65" y1="21" y2="16.65" />
        <line x1="11" x2="11" y1="8" y2="14" />
        <line x1="8" x2="14" y1="11" y2="11" />
      </svg>
    </div>
  );
}

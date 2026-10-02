import React, { useEffect } from 'react';

export default function Lightbox({ images, currentIndex, isOpen, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onPrev();
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNext();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, images.length, onClose, onPrev, onNext]);

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0];

  return (
    <div className={`pm-lightbox ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="pm-lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <button aria-label="Close" className="pm-lightbox-close" onClick={onClose}>
          <svg strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <button 
          aria-label="Previous" 
          className="pm-lightbox-prev" 
          onClick={onPrev}
          style={{
            opacity: currentIndex > 0 ? 0.85 : 0.25,
            pointerEvents: currentIndex > 0 ? 'auto' : 'none'
          }}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button 
          aria-label="Next" 
          className="pm-lightbox-next" 
          onClick={onNext}
          style={{
            opacity: currentIndex < images.length - 1 ? 0.85 : 0.25,
            pointerEvents: currentIndex < images.length - 1 ? 'auto' : 'none'
          }}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <img src={currentImg.src} alt={currentImg.alt || 'Enlarged design view'} />
      </div>
    </div>
  );
}

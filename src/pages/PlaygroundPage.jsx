import React, { useState } from 'react';
import SharedFooter from '../components/SharedFooter';
import CustomCursor from '../components/CustomCursor';
import Lightbox from '../components/Lightbox';

export default function PlaygroundPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const pins = [
    {
      title: 'SmartRide App UI',
      src: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjAP8mX1jfgXvE6o7mqYBz8c9FWKggXmdE4UdlCY9skynwmIeGW5mNOnOs1tQGmHle2Doza_G17ViHmk5ZjxDYb6nkBoCuRguwJ-WPPOBDUYnPOCdTph7dYpDx9eKJNdX3JajEt_dmBmC1VDkSLl1uIAAd7fDQk2OvRXpC4Jd1QaPTCFyXxFaX0zmB-opU/s3708/image_3.webp',
      alt: 'SmartRide App UI Concept'
    },
    {
      title: 'Furniture Website Landing Page',
      src: 'https://mir-s3-cdn-cf.behance.net/project_modules/2800_webp/18cf8a123261753.60eb096b589cc.png',
      alt: 'Furniture Website Landing Page UI'
    },
    {
      title: 'Bike Car Rental Website',
      src: 'https://mir-s3-cdn-cf.behance.net/project_modules/fs_webp/85aac1167517925.642ab47012054.png',
      alt: 'Bike Car Rental Website UI Concept'
    }
  ];

  const handleOpenLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="pm-animate-in">
      <CustomCursor isHovering={isHovering} isClicked={isClicked} />

      <div className="pm-page" id="pm-play">
        <div className="pm-inner">
          <div className="pm-row pm-row--sticky">
            <div className="pm-label">Playground</div>
            <div className="pm-content">
              
              <div className="pm-pin-grid">
                {pins.map((pin, idx) => (
                  <div 
                    key={idx}
                    className="pm-pin-item pm-pg-image pm-img-loaded"
                    onClick={() => handleOpenLightbox(idx)}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => { setIsHovering(false); setIsClicked(false); }}
                    onMouseDown={() => setIsClicked(true)}
                    onMouseUp={() => setIsClicked(false)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${pin.title}`}
                  >
                    <img 
                      alt={pin.alt} 
                      src={pin.src} 
                      decoding="async" 
                      loading="lazy" 
                    />
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

      <Lightbox 
        images={pins}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
        onNext={() => setCurrentIndex((prev) => Math.min(pins.length - 1, prev + 1))}
      />

      <SharedFooter />
    </div>
  );
}

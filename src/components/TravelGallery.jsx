import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';

export default function TravelGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const photos = [
    {
      id: 'kyoto',
      title: 'Kyoto Bamboo Forest',
      location: 'Kyoto, Japan',
      year: '2025',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=80',
      caption: 'Morning light piercing through the Arashiyama bamboo grove.'
    },
    {
      id: 'ladakh',
      title: 'High Altitude Pass',
      location: 'Ladakh, Himalayas',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
      caption: 'Pangong Tso reflection under crystal alpine skies.'
    },
    {
      id: 'tokyo',
      title: 'Shibuya at Midnight',
      location: 'Tokyo, Japan',
      year: '2025',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1400&q=80',
      caption: 'Neon corridors and geometric architectural silhouettes in Shinjuku.'
    },
    {
      id: 'sikkim',
      title: 'Monastery Valley',
      location: 'Gangtok, Sikkim',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
      caption: 'Mist rolling over ancient Himalayan monasteries.'
    },
    {
      id: 'singapore',
      title: 'Marina Bay Skyline',
      location: 'Singapore',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=80',
      caption: 'Futuristic urban foliage and evening light reflections.'
    },
    {
      id: 'goa',
      title: 'Arabian Sea Coastline',
      location: 'Goa, India',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1400&q=80',
      caption: 'Sunset hues along the quiet southern coastline.'
    }
  ];

  return (
    <div>
      <div className="travel-stream">
        {photos.map((item) => (
          <div
            key={item.id}
            className="travel-card"
            onClick={() => setSelectedPhoto(item)}
            style={{ cursor: 'pointer' }}
          >
            <div className="travel-img-container">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="travel-meta">
              <div>
                <div className="travel-location" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="var(--accent-brand)" />
                  <span>{item.location}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {item.caption}
                </div>
              </div>
              <span className="travel-year">{item.year}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <img
            src={selectedPhoto.image}
            alt={selectedPhoto.title}
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              borderRadius: '12px',
              objectFit: 'contain',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div
            style={{
              marginTop: '16px',
              textAlign: 'center',
              color: '#ffffff'
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedPhoto.location}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>
              {selectedPhoto.caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

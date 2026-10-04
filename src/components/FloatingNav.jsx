import React from 'react';

export default function FloatingNav({ currentPath, onNavigate }) {
  const getIdx = (path) => {
    if (path.includes('casestudy')) return 1;
    if (path.includes('playground')) return 2;
    if (path.includes('about')) return 3;
    if (path.includes('book')) return -1;
    return 0;
  };

  const currentIdx = getIdx(currentPath);
  const pillOffset = currentIdx * 56;

  const navItems = [
    {
      path: '/',
      index: 0,
      label: 'Home',
      icon: (
        <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
      )
    },
    {
      path: '/casestudy',
      index: 1,
      label: 'Case Study',
      icon: (
        <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
          <rect height="18" rx="1" width="7" x="3" y="3" />
          <rect height="7" rx="1" width="7" x="14" y="3" />
          <rect height="7" rx="1" width="7" x="14" y="14" />
        </svg>
      )
    },
    {
      path: '/playground',
      index: 2,
      label: 'Playground',
      icon: (
        <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      )
    },
    {
      path: '/about',
      index: 3,
      label: 'About',
      icon: (
        <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    }
  ];

  const handleNavClick = (path) => {
    if (typeof window !== 'undefined' && window.location.hostname.toLowerCase().startsWith('books.')) {
      window.location.href = `https://portfolio.bishalmistri.com${path === '/' ? '' : path}`;
      return;
    }
    onNavigate(path);
  };

  return (
    <nav className="pm-nav" aria-label="Floating Navigation">
      <div className="pm-nav-track">
        <div 
          className="pm-nav-pill" 
          id="pm-pill"
          style={{
            opacity: currentIdx === -1 ? 0 : 1,
            transform: `translateX(${pillOffset}px)`
          }}
        />

        {navItems.map((item) => (
          <div
            key={item.index}
            className={`pm-nav-item ${currentIdx === item.index ? 'active' : ''}`}
            onClick={() => handleNavClick(item.path)}
            role="button"
            tabIndex={0}
            aria-label={item.label}
          >
            <span className="pm-tooltip">{item.label}</span>
            {item.icon}
          </div>
        ))}
      </div>
    </nav>
  );
}

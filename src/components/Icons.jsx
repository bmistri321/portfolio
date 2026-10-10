import React from 'react';

export function Linkedin({ size = 20, color = 'currentColor', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Behance({ size = 20, color = 'currentColor', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 5v14" />
      <path d="M3 5h5a3.5 3.5 0 0 1 0 7H3" />
      <path d="M3 12h6a3.5 3.5 0 0 1 0 7H3" />
      <path d="M14.5 7.5h6" />
      <path d="M14.7 15A3 3 0 0 0 20.3 15" />
      <path d="M14.2 15h6.6" />
    </svg>
  );
}

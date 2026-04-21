'use client';

import type { CSSProperties } from 'react';

interface AeroTrackLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function AeroTrackLogo({ size = 24, className = '', showText = false }: AeroTrackLogoProps) {
  if (showText) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <AeroTrackIcon size={size} />
        <span style={{ fontWeight: 700, fontSize: `${size * 0.58}px` }}>
          Aero Track
        </span>
      </div>
    );
  }
  return <AeroTrackIcon size={size} className={className} />;
}

export function AeroTrackIcon({
  size = 24,
  className = '',
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Location pin base */}
      <path
        d="M12 2C8.69 2 6 4.69 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.31-2.69-6-6-6z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M12 2C8.69 2 6 4.69 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.31-2.69-6-6-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Airplane inside pin */}
      <path
        d="M9.5 6.5L12 8.5L14.5 6.5M12 8.5V10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 8.5H14L12.5 10H11.5L10 8.5Z"
        fill="currentColor"
        opacity="0.6"
      />

      {/* Movement/tracking lines */}
      <path
        d="M3 14C3 14 5 13 7 13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="2 2"
        opacity="0.4"
      />
      <path
        d="M17 13C19 13 21 14 21 14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="2 2"
        opacity="0.4"
      />
    </svg>
  );
}

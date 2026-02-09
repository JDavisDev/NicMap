import React from 'react';

const Logo: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Map pin shape */}
    <path
      d="M32 4C20.954 4 12 12.954 12 24c0 14 20 36 20 36s20-22 20-36c0-11.046-8.954-20-20-20z"
      fill="white"
      fillOpacity="0.95"
    />
    {/* Inner circle */}
    <circle
      cx="32"
      cy="24"
      r="12"
      fill="#BE5C32"
    />
    {/* Percentage/deal symbol */}
    <circle
      cx="28"
      cy="20"
      r="3"
      fill="white"
    />
    <circle
      cx="36"
      cy="28"
      r="3"
      fill="white"
    />
    <rect
      x="26"
      y="23"
      width="12"
      height="2.5"
      rx="1.25"
      transform="rotate(-45 26 23)"
      fill="white"
    />
  </svg>
);

export default Logo;

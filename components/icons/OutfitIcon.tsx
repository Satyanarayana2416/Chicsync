import React from 'react';

export const OutfitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2l-3 5h6l-3-5z" />
    <path d="M9 7v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7" />
    <path d="M9 14v7h6v-7" />
  </svg>
);

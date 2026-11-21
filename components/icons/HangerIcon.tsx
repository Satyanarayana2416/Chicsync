import React from 'react';

export const HangerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12.5 3A2.5 2.5 0 0 0 10 5.5V7h4v-.5A2.5 2.5 0 0 0 11.5 4c-.4 0-.8.1-1.1.4" />
    <path d="M10 7H3.5a2 2 0 0 0-2 2.2l1.4 8.4A2 2 0 0 0 4.8 19h14.4a2 2 0 0 0 1.9-1.4l1.4-8.4A2 2 0 0 0 20.5 9H14" />
  </svg>
);
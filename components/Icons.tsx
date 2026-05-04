import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const ArtisanIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2C10.8954 2 10 2.89543 10 4V7H14V4C14 2.89543 13.1046 2 12 2Z" fill="currentColor" opacity="0.3" />
    <path d="M7 10C5.89543 10 5 10.8954 5 12V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V12C19 10.8954 18.1046 10 17 10H7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 10V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const SustainableIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 12C12 12 16 11 17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15C12 15 8 14 7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TrustIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 17C12 17 12.1 17 12 17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
  </svg>
);

export const CommunityIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M4 12C4 12 7 9 12 9C17 9 20 12 20 12C20 12 17 15 12 15C7 15 4 12 4 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 3V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 18V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 12H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CraftIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 22V19M12 5V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 12H2M22 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.0711 19.0711L16.9497 16.9497M7.05025 7.05025L4.92893 4.92893" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.0711 4.92893L16.9497 7.05025M7.05025 16.9497L4.92893 19.0711" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

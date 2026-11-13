import React from 'react';

interface BrandEmblemProps {
  className?: string;
}

export const BrandEmblem: React.FC<BrandEmblemProps> = ({ className = 'w-14 h-14' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="شعار منصة الأستاذ أحمد نورالدين للدراسات الاجتماعية"
    >
      <rect width="120" height="120" rx="28" fill="#0F4C4A" />
      <rect x="6" y="6" width="108" height="108" rx="22" stroke="#2DD4BF" strokeOpacity="0.35" strokeWidth="1.5" />

      {/* Globe Grid */}
      <circle cx="60" cy="60" r="36" stroke="#99F6E4" strokeWidth="2.2" />
      <ellipse cx="60" cy="60" rx="18" ry="36" stroke="#5EEAD4" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="24" y1="60" x2="96" y2="60" stroke="#5EEAD4" strokeWidth="1.5" />
      <path d="M31 41C48 47 72 47 89 41" stroke="#5EEAD4" strokeOpacity="0.7" strokeWidth="1.3" />
      <path d="M31 79C48 73 72 73 89 79" stroke="#5EEAD4" strokeOpacity="0.7" strokeWidth="1.3" />

      {/* Compass Needle */}
      <polygon points="60,20 66,54 60,60 54,54" fill="#F59E0B" />
      <polygon points="60,100 66,66 60,60 54,66" fill="#CCFBF1" />
      <circle cx="60" cy="60" r="5" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
    </svg>
  );
};

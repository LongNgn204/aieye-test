import React from 'react';

export const AstigmatismWheel: React.FC = () => {
  const lines = 12;
  const radius = 100;
  const center = 120;

  return (
    <svg width="240" height="240" viewBox="0 0 240 240">
      <circle cx={center} cy={center} r={radius + 5} fill="white" />
      {Array.from({ length: lines }).map((_, i) => {
        const angle = (i * 180) / lines;
        const x1 = center - radius * Math.cos((angle * Math.PI) / 180);
        const y1 = center - radius * Math.sin((angle * Math.PI) / 180);
        const x2 = center + radius * Math.cos((angle * Math.PI) / 180);
        const y2 = center + radius * Math.sin((angle * Math.PI) / 180);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="black"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={center} cy={center} r="10" fill="white" stroke="black" strokeWidth="2" />
    </svg>
  );
};
import React from 'react';

interface AmslerGridProps {
  size?: number;
  onCellClick?: (x: number, y: number) => void;
  distortedCells?: { x: number; y: number }[];
  isInteractive: boolean;
}

export const AmslerGrid: React.FC<AmslerGridProps> = ({
  size = 300,
  onCellClick,
  distortedCells = [],
  isInteractive,
}) => {
  const divisions = 20;
  const step = size / divisions;

  const handleClick = (e: React.MouseEvent<SVGRectElement>) => {
    if (!onCellClick || !isInteractive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / step);
    const y = Math.floor((e.clientY - rect.top) / step);
    onCellClick(x, y);
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="white" />
        {/* Grid lines */}
        {Array.from({ length: divisions + 1 }).map((_, i) => (
          <g key={i}>
            <line x1={i * step} y1={0} x2={i * step} y2={size} stroke="black" strokeWidth="1" />
            <line x1={0} y1={i * step} x2={size} y2={i * step} stroke="black" strokeWidth="1" />
          </g>
        ))}
        {/* Distorted cells overlay */}
        {distortedCells.map(({ x, y }, i) => (
          <rect
            key={i}
            x={x * step}
            y={y * step}
            width={step}
            height={step}
            fill="rgba(255, 0, 0, 0.4)"
          />
        ))}
        {/* Fixation point */}
        <circle cx={size / 2} cy={size / 2} r="5" fill="black" />
        {/* Interaction layer */}
        <rect
            width={size}
            height={size}
            fill="transparent"
            onClick={handleClick}
            className={isInteractive ? "cursor-pointer" : ""}
        />
      </svg>
    </div>
  );
};
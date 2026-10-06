import React from 'react';

interface StatBadgeProps {
  label: string;
  subLabel: string;
  current: number;
  max: number;
  type: 'hunger' | 'sanity' | 'health';
  icon: string;
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  label,
  subLabel,
  current,
  max,
  type,
  icon,
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const isCritical = percentage < 25;

  const colorStyles = {
    hunger: {
      text: 'text-[#e58e37]',
      border: 'border-[#8c4f1c]',
      ring: '#d97724',
      bg: 'rgba(217, 119, 36, 0.15)',
    },
    sanity: {
      text: 'text-[#cc66aa]',
      border: 'border-[#73335e]',
      ring: '#b84e94',
      bg: 'rgba(184, 78, 148, 0.15)',
    },
    health: {
      text: 'text-[#e54537]',
      border: 'border-[#85251c]',
      ring: '#c72e21',
      bg: 'rgba(199, 46, 33, 0.15)',
    },
  }[type];

  // SVG Circular progress radius
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`relative flex flex-col items-center group transition-transform ${
        isCritical ? 'animate-pulse scale-105' : ''
      }`}
      title={`${label} (${subLabel}): ${Math.round(current)} / ${max}`}
    >
      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#1b120c] border-[3px] border-[#533b2a] shadow-[inset_0_0_12px_#000,0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center p-1">
        {/* SVG Circular Ring Meter */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 70 70">
          <circle
            cx="35"
            cy="35"
            r={radius}
            fill="none"
            stroke="#261a12"
            strokeWidth="5"
          />
          <circle
            cx="35"
            cy="35"
            r={radius}
            fill="none"
            stroke={colorStyles.ring}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Content inside badge */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span className="text-sm md:text-base leading-none select-none">{icon}</span>
          <span
            className={`font-cinzel text-xs md:text-sm font-bold tracking-tight ${colorStyles.text}`}
          >
            {Math.round(current)}
          </span>
        </div>
      </div>

      {/* Label under badge */}
      <div className="mt-1 px-1.5 py-0.5 rounded bg-[#1f150e]/90 border border-[#4d3625] text-center shadow">
        <span className="text-[10px] md:text-[11px] font-semibold tracking-wider text-[#d5c3b1] block leading-none">
          {label}
        </span>
      </div>
    </div>
  );
};

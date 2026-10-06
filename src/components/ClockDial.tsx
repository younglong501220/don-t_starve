import React from 'react';
import { DayPhase, WeatherType } from '../types/game';

interface ClockDialProps {
  dayCount: number;
  timeOfDay: number; // 0 to 1
  phase: DayPhase;
  weather?: WeatherType;
}

export const ClockDial: React.FC<ClockDialProps> = ({
  dayCount,
  timeOfDay,
  phase,
  weather = 'clear',
}) => {
  // Clock rotation: 0 to 360 degrees
  const angleDegrees = timeOfDay * 360;

  // Phase display label & color
  const phaseInfo = {
    day: { label: '白天', sub: 'DAY', color: '#f3c25b' },
    dusk: { label: '黃昏', sub: 'DUSK', color: '#df613c' },
    night: { label: '夜晚', sub: 'NIGHT', color: '#5672a9' },
  }[phase];

  const weatherInfo = {
    clear: { icon: '☀️', label: '晴朗', note: '良好天氣', color: '#fde047' },
    rain: { icon: '🌧️', label: '暴雨', note: '移速-25%·加劇流失理智', color: '#93c5fd' },
    fog: { icon: '🌫️', label: '濃霧', note: '移速-15%·迷失心慌', color: '#cbd5e1' },
  }[weather];

  return (
    <div className="relative flex flex-col items-center select-none">
      <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-[#1e150f] border-4 border-[#684c37] shadow-[0_6px_20px_rgba(0,0,0,0.85)]">
        {/* Outer decorative bezel ring with rivets */}
        <div className="absolute inset-0 rounded-full border border-[#916d4c] pointer-events-none" />

        {/* Dial Clock Face with colored segments */}
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-inner bg-[#140e0a]">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Day segment: 0% to 60% (0 to 216 deg) */}
            <path
              d="M 50 50 L 50 0 A 50 50 0 1 1 20.6 89.7 Z"
              fill="#b98a3b"
              opacity="0.9"
            />
            {/* Dusk segment: 60% to 78% (216 to 280.8 deg) */}
            <path
              d="M 50 50 L 20.6 89.7 A 50 50 0 0 1 0.9 40.2 Z"
              fill="#a64222"
              opacity="0.95"
            />
            {/* Night segment: 78% to 100% (280.8 to 360 deg) */}
            <path
              d="M 50 50 L 0.9 40.2 A 50 50 0 0 1 50 0 Z"
              fill="#111522"
              opacity="0.98"
            />

            {/* Center ring */}
            <circle cx="50" cy="50" r="48" fill="none" stroke="#3d2a1b" strokeWidth="2" />
          </svg>

          {/* Clock Hand Pointer */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-100 ease-linear"
            style={{ transform: `rotate(${angleDegrees}deg)` }}
          >
            <div className="w-[3px] h-12 bg-[#ffe8ba] shadow-[0_0_5px_rgba(255,232,186,0.8)] -translate-y-5 rounded-full" />
          </div>

          {/* Clock Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#3c2a1a] border-2 border-[#caa059] flex items-center justify-center shadow-md">
            <div className="w-2 h-2 rounded-full bg-[#150d08]" />
          </div>
        </div>
      </div>

      {/* Day & Phase Label Plate */}
      <div className="mt-1.5 px-3 py-0.5 bg-[#231811]/95 border-2 border-[#5a4231] rounded-md shadow-lg flex flex-col items-center">
        <span className="font-cinzel text-xs md:text-sm font-bold tracking-wider text-[#eedaa2]">
          天數 {dayCount}
        </span>
        <span
          className="text-[11px] font-bold tracking-wide transition-colors"
          style={{ color: phaseInfo.color }}
        >
          {phaseInfo.label} ({phaseInfo.sub})
        </span>
      </div>

      {/* Dynamic Weather Status Badge */}
      <div
        className="mt-1 px-2.5 py-0.5 rounded-full bg-[#1a110a]/90 border border-[#533927] flex items-center gap-1.5 shadow"
        title={`天候：${weatherInfo.label} (${weatherInfo.note})`}
      >
        <span className="text-xs leading-none">{weatherInfo.icon}</span>
        <span
          className="text-[10px] font-bold tracking-wider"
          style={{ color: weatherInfo.color }}
        >
          {weatherInfo.label}
        </span>
      </div>
    </div>
  );
};

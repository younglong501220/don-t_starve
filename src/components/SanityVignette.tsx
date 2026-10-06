import React from 'react';

interface SanityVignetteProps {
  sanityRatio: number; // 0 to 1 (1 = max sanity, 0 = insane)
  isCharlieAttacking: boolean;
  isInDarkness: boolean;
}

export const SanityVignette: React.FC<SanityVignetteProps> = ({
  sanityRatio,
  isCharlieAttacking,
  isInDarkness,
}) => {
  // 1 is full sanity, 0 is fully insane
  const insanity = Math.max(0, 1 - sanityRatio);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Insanity Distortion Vignette */}
      {insanity > 0.2 && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            boxShadow: `inset 0 0 ${insanity * 180}px rgba(80, 0, 50, ${insanity * 0.75})`,
            filter: insanity > 0.6 ? `contrast(${1 + insanity * 0.4}) hue-rotate(${insanity * 25}deg)` : 'none',
          }}
        />
      )}

      {/* Creepy Shadow Tendrils border if very insane */}
      {insanity > 0.65 && (
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/60 animate-pulse" />
      )}

      {/* Darkness Tension warning (whispers in the dark) */}
      {isInDarkness && (
        <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-center font-cinzel text-red-400/80 text-sm md:text-base animate-pulse tracking-widest px-4 py-2 bg-black/60 rounded-md border border-red-950">
            黑暗在蠢動... (快點燃火把或營火！)
          </div>
        </div>
      )}

      {/* Charlie Slashing Attack overlay */}
      {isCharlieAttacking && (
        <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center animate-claw">
          {/* Scratch Mark SVGs */}
          <svg className="w-80 h-80 md:w-96 md:h-96 text-red-600 drop-shadow-[0_0_20px_#ff0000]" viewBox="0 0 100 100">
            <path
              d="M 15 20 Q 40 45 65 85"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 30 15 Q 55 50 80 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 45 10 Q 70 45 95 75"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

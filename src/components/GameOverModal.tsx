import React from 'react';

interface GameOverModalProps {
  dayCount: number;
  deathReason: string;
  itemsCrafted: number;
  resourcesGathered: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  dayCount,
  deathReason,
  itemsCrafted,
  resourcesGathered,
  onRestart,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-md bg-[#18110b] border-4 border-[#6b472e] rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.95)] text-center text-[#ebdcc8]">
        {/* Decorative corner skulls / rivets */}
        <div className="text-4xl mb-2">☠️</div>

        <h2 className="font-cinzel text-2xl md:text-3xl font-black text-[#d32f2f] tracking-widest drop-shadow">
          你已喪命
        </h2>

        <p className="font-parchment text-base md:text-lg text-[#b8a28c] mt-2 italic">
          「永夜在呼喚... 世界將你的殘骸掩埋在荒野之中。」
        </p>

        {/* Cause of death */}
        <div className="mt-4 p-3 bg-[#24170f] border border-[#482d1c] rounded-lg">
          <span className="text-xs text-[#9d8874] block uppercase tracking-wider font-semibold">
            死因
          </span>
          <span className="font-cinzel text-base md:text-lg font-bold text-[#f7a072]">
            {deathReason}
          </span>
        </div>

        {/* Survival Statistics */}
        <div className="grid grid-cols-3 gap-2 my-5 text-center">
          <div className="p-2.5 bg-[#20150e] border border-[#3e2718] rounded-md">
            <span className="text-[11px] text-[#9d8874] block">生存天數</span>
            <span className="font-cinzel text-xl font-bold text-[#eedaa2]">
              {dayCount} 天
            </span>
          </div>

          <div className="p-2.5 bg-[#20150e] border border-[#3e2718] rounded-md">
            <span className="text-[11px] text-[#9d8874] block">製造科技</span>
            <span className="font-cinzel text-xl font-bold text-[#80cbc4]">
              {itemsCrafted} 件
            </span>
          </div>

          <div className="p-2.5 bg-[#20150e] border border-[#3e2718] rounded-md">
            <span className="text-[11px] text-[#9d8874] block">採集資源</span>
            <span className="font-cinzel text-xl font-bold text-[#aed581]">
              {resourcesGathered} 次
            </span>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full py-3 px-6 bg-[#8a4f21] hover:bg-[#a6622d] text-[#fff8ea] border-2 border-[#d5a85b] rounded-lg font-cinzel text-base font-bold tracking-wider transition-all shadow-lg active:scale-98 cursor-pointer"
        >
          再度甦醒 (重新挑戰)
        </button>
      </div>
    </div>
  );
};

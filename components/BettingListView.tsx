import React from "react";
import { BET_AMOUNTS, MINI_BET_AMOUNTS } from "../services/constants";

interface BettingListViewProps {
  mode: "classic" | "mini";
  onModeChange: (mode: "classic" | "mini") => void;
  onSelectBet: (amount: number) => void;
}

const BettingListView: React.FC<BettingListViewProps> = ({
  mode,
  onModeChange,
  onSelectBet,
}) => {
  const currentAmounts = mode === "mini" ? MINI_BET_AMOUNTS : BET_AMOUNTS;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-hb-gold mb-1.5 italic tracking-tight uppercase">
            {mode === "mini" ? "Mini Bingo" : "Classic Bingo"}
          </h2>
          <p className="text-[11px] text-hb-muted font-bold uppercase tracking-widest">
            {mode === "mini"
              ? "Fast Games, Low Risk"
              : "Standard Rooms, Big Wins"}
          </p>
        </div>

        <button
          onClick={() => onModeChange(mode === "classic" ? "mini" : "classic")}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm border-2 ${mode === "mini" ? "bg-hb-surface text-hb-gold border-hb-gold/50" : "bg-black text-hb-gold border-hb-gold/30"}`}
        >
          {mode === "classic" ? "Switch to Mini" : "Switch to Classic"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {currentAmounts.map((amt) => (
          <button
            key={amt}
            onClick={() => onSelectBet(amt)}
            className="group flex items-center justify-between bg-black border border-hb-border p-5 rounded-[2.5rem] shadow-sm hover:shadow-lg hover:border-hb-gold/30 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black transition-all group-hover:scale-110 ${mode === "mini" ? "bg-hb-gold/10 text-hb-gold" : "bg-hb-gold/20 text-hb-gold border border-hb-gold/30"}`}
              >
                {amt >= 1000 ? amt / 1000 + "K" : amt}
              </div>
              <div className="text-left">
                <div className="font-black text-white text-[16px] tracking-tight">
                  {amt.toLocaleString()} ETB
                </div>
                <div className="text-[10px] text-hb-muted font-bold uppercase tracking-[0.2em] mt-0.5">
                  {amt < 20 ? "Speed" : amt < 100 ? "Standard" : "Elite"}
                </div>
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:bg-hb-gold group-hover:text-hb-blueblack transition-all ${mode === "mini" ? "bg-hb-surface text-hb-gold" : "bg-hb-gold text-hb-blueblack"}`}
            >
              <i className="fas fa-play ml-0.5 text-[10px]"></i>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 bg-black/40 p-6 rounded-[2.5rem] border border-hb-border text-center">
        <h4 className="text-hb-gold font-black text-[12px] mb-2 uppercase tracking-widest italic">
          {mode === "classic" ? "Mini Mode" : "Classic Mode"}
        </h4>
        <p className="text-[11px] text-hb-muted font-bold leading-relaxed uppercase opacity-60">
          {mode === "classic"
            ? "3x3 Grids • Instant Resolution"
            : "5x5 Grids • High Entropy Deck"}
        </p>
      </div>
    </div>
  );
};

export default BettingListView;

import React, { useState, useMemo } from "react";
import { generateCard, generateMiniCard } from "../services/constants";
import { APP_CONFIG } from "../config";

interface AllCardsViewProps {
  onQuickPlay: (cardId: number, mode: "classic" | "mini") => void;
}

const AllCardsView: React.FC<AllCardsViewProps> = ({ onQuickPlay }) => {
  const [mode, setMode] = useState<"classic" | "mini">("classic");
  const cardIds = Array.from(
    { length: APP_CONFIG.GAME.TOTAL_CARDS_AVAILABLE },
    (_, i) => i + 1,
  );

  const allCards = useMemo(() => {
    return cardIds.map((id) => ({
      id,
      grid: mode === "mini" ? generateMiniCard(id) : generateCard(id),
    }));
  }, [mode]);

  return (
    <div className="min-h-full bg-hb-bg pb-20">
      {/* Minimized Header */}
      <div className="sticky top-0 z-20 bg-hb-bg/90 backdrop-blur-md border-b border-hb-border px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="shrink-0">
            <h2 className="text-[12px] font-black text-white uppercase tracking-tight">
              Gallery
            </h2>
          </div>
          <div className="flex bg-[#1A1A1A] p-0.5 rounded-lg shrink-0 border border-hb-border">
            <button
              onClick={() => setMode("classic")}
              className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${mode === "classic" ? "bg-hb-gold text-hb-blueblack shadow-md" : "text-hb-muted"}`}
            >
              Classic
            </button>
            <button
              onClick={() => setMode("mini")}
              className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${mode === "mini" ? "bg-hb-gold text-hb-blueblack shadow-md" : "text-hb-muted"}`}
            >
              Mini
            </button>
          </div>
          <div className="relative flex-1 max-w-[120px]">
            <i className="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-hb-muted/40 text-[9px]"></i>
            <input
              type="number"
              placeholder="Jump to..."
              className="w-full h-8 pl-7 pr-2 bg-[#1A1A1A] border border-hb-border rounded-lg text-[10px] font-bold text-white outline-none focus:border-hb-gold/50"
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const el = document.getElementById(`card-anchor-${val}`);
                  if (el)
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="p-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {allCards.map((card) => (
          <div
            key={card.id}
            id={`card-anchor-${card.id}`}
            className="bg-black rounded-2xl border border-hb-border shadow-lg p-3 hover:border-hb-gold/30 transition-all active:scale-[0.98] flex flex-col group"
            onClick={() => onQuickPlay(card.id, mode)}
          >
            <div className="flex justify-between items-center mb-2 px-0.5">
              <span className="text-hb-gold font-black text-[10px] tracking-widest uppercase">
                #{card.id}
              </span>
              <i className="fas fa-play text-hb-gold opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"></i>
            </div>

            <div
              className={`grid ${mode === "mini" ? "grid-cols-3" : "grid-cols-5"} gap-1 bg-[#0A0A0A] p-2 rounded-xl border border-hb-border/50`}
            >
              {card.grid.flat().map((num, i) => (
                <div
                  key={i}
                  className={`aspect-square text-[9px] font-black flex items-center justify-center rounded-md border border-hb-border/20
                    ${num === 0 ? "bg-hb-emerald/20 text-hb-emerald border-hb-emerald/20" : "bg-[#151515] text-white"}`}
                >
                  {num === 0 ? "★" : num}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-4 opacity-10">
        <p className="text-[7px] font-black uppercase tracking-[0.3em]">
          Full Deck Displayed
        </p>
      </div>
    </div>
  );
};

export default AllCardsView;

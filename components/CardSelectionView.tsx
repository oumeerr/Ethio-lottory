import React, { useState } from "react";
import { User } from "../types";
import { generateCard, generateMiniCard } from "../services/constants";
import { APP_CONFIG } from "../config";
import { supabase } from "../services/supabaseClient";

interface CardSelectionViewProps {
  betAmount: number;
  mode: "classic" | "mini";
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  onSelectCard: (ids: number[]) => void;
}

const CardSelectionView: React.FC<CardSelectionViewProps> = ({
  betAmount,
  mode,
  user,
  setUser,
  onSelectCard,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [globalStakes, setGlobalStakes] = useState<Record<number, string>>({});
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [isDeducting, setIsDeducting] = useState(false);
  const cards = Array.from(
    { length: APP_CONFIG.GAME.TOTAL_CARDS_AVAILABLE },
    (_, i) => i + 1,
  );

  React.useEffect(() => {
    // Fetch current stakes
    const fetchStakes = async () => {
      const { data } = await supabase.from("current_stakes").select("*");
      if (data) {
        const stakes: Record<number, string> = {};
        data.forEach((s) => (stakes[s.card_id] = s.user_id.toString()));
        setGlobalStakes(stakes);
      }
    };
    fetchStakes();

    const channel = supabase
      .channel("public:current_stakes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "current_stakes" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setGlobalStakes((prev) => ({
              ...prev,
              [payload.new.card_id]: payload.new.user_id.toString(),
            }));
          } else if (payload.eventType === "DELETE") {
            setGlobalStakes((prev) => {
              const next = { ...prev };
              delete next[payload.old.card_id];
              return next;
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stakeCard = async (id: number) => {
    if (selectedIds.has(id)) return;
    if (globalStakes[id]) {
      alert("This card is already staked by someone else!");
      return;
    }

    if (selectedIds.size >= APP_CONFIG.GAME.MAX_CARDS_PER_SESSION) {
      alert(
        `Limit Reached! Maximum ${APP_CONFIG.GAME.MAX_CARDS_PER_SESSION} cards allowed.`,
      );
      return;
    }

    const availableMain = user.balance || 0;
    const availableBonus = user.bonus_balance || 0;

    if (availableMain < betAmount && availableBonus < betAmount) {
      alert("Please deposit.\nChoose fast deposit\nTelebirr or CBE birr.");
      return;
    }

    setIsDeducting(true);
    let newMain = availableMain;
    let newBonus = availableBonus;

    if (availableBonus >= betAmount) {
      newBonus -= betAmount;
    } else {
      newMain -= betAmount;
    }

    try {
      // Use Backend API to bypass RLS
      const res = await fetch("/api/stake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: id,
          userId: user.id,
          newMain,
          newBonus,
          gamesPlayed: (user.games_played || 0) + 1,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Stake failed");
      }

      // Optimistic Update
      const newSet = new Set(selectedIds);
      newSet.add(id);
      setSelectedIds(newSet);
      setUser((prev: User) => ({
        ...prev,
        balance: newMain,
        bonus_balance: newBonus,
        games_played: (user.games_played || 0) + 1,
      }));
    } catch (e) {
      console.error("Failed to stake", e);
      alert("Failed to confirm stake. Check connection.");
    } finally {
      setIsDeducting(false);
      setPreviewId(null);
    }
  };

  const getGrid = (id: number) => {
    return mode === "mini" ? generateMiniCard(id) : generateCard(id);
  };

  const totalStake = selectedIds.size * betAmount;

  return (
    <div className="p-4 pb-28">
      {/* Minimized Hero Section */}
      <div className="bg-black border border-hb-border p-5 rounded-[20px] text-white mb-4 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-[16px] font-bold italic tracking-tight mb-2 uppercase">
            {mode === "mini" ? "Mini Game" : "Classic Game"}
          </h2>

          <div className="flex gap-2 items-center">
            <div className="bg-white/5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border border-white/5">
              Stake: {betAmount} ETB
            </div>
            <div
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border border-white/10 ${selectedIds.size === APP_CONFIG.GAME.MAX_CARDS_PER_SESSION ? "bg-red-500 text-white" : "bg-hb-gold text-hb-blueblack"}`}
            >
              {selectedIds.size} / {APP_CONFIG.GAME.MAX_CARDS_PER_SESSION}{" "}
              Staked
            </div>
          </div>
        </div>
        <i className="fas fa-th absolute -right-4 -top-4 text-white/5 text-6xl"></i>
      </div>

      {/* Compact Winning Tip */}
      {selectedIds.size < 2 && (
        <div className="bg-hb-gold/5 border border-hb-gold/20 p-2.5 rounded-xl flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-top-1">
          <div className="w-6 h-6 rounded-full bg-hb-gold text-hb-blueblack flex items-center justify-center font-black text-[10px] shadow-sm">
            !
          </div>
          <p className="text-[10px] font-bold text-hb-gold/70 uppercase tracking-tight">
            Pro Tip: Stake 2-3 cards for higher odds
          </p>
        </div>
      )}

      {/* Minimized Number Grid (8 columns) */}
      <div className="grid grid-cols-8 gap-1.5 bg-[#050505] p-3 rounded-[20px] border border-hb-border shadow-inner justify-items-center">
        {cards.map((id) => (
          <div key={id} className="relative group">
            <button
              onClick={() => {
                if (!globalStakes[id]) {
                  setPreviewId(id);
                }
              }}
              className={`w-[38px] h-[38px] rounded-lg flex items-center justify-center font-black text-[14px] tracking-tighter active:scale-95 transition-all border
                ${
                  selectedIds.has(id)
                    ? "bg-hb-gold text-hb-blueblack border-hb-gold shadow-lg scale-105 z-10"
                    : globalStakes[id]
                      ? "bg-red-500/20 text-red-500 border-red-500/30 cursor-not-allowed opacity-50"
                      : "bg-black text-white border-hb-border hover:border-hb-gold/20"
                }`}
            >
              {id}
            </button>
          </div>
        ))}
      </div>

      {/* Compact Preview Modal */}
      {previewId && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-6"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="bg-black border border-hb-border rounded-[24px] w-full max-w-[280px] overflow-hidden shadow-2xl animate-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1A1A1A] border-b border-hb-border p-4 text-center text-white font-black text-[14px] uppercase flex justify-between items-center px-5">
              <span className="italic">Check #{previewId}</span>
              <button
                onClick={() => setPreviewId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 active:scale-90 transition-transform"
              >
                <i className="fas fa-times text-[12px]"></i>
              </button>
            </div>
            <div className="p-5">
              <div
                className={`grid ${mode === "mini" ? "grid-cols-3" : "grid-cols-5"} gap-1.5 mb-5 bg-[#0A0A0A] p-4 rounded-2xl border border-hb-border`}
              >
                {getGrid(previewId)
                  .flat()
                  .map((num, i) => (
                    <div
                      key={i}
                      className={`aspect-square mini-card-cell border border-hb-border/30 rounded-lg text-[12px] font-black
                        ${num === 0 ? "bg-hb-emerald/20 text-hb-emerald border-hb-emerald/30 shadow-[inset_0_0_10px_rgba(5,150,105,0.2)]" : "bg-[#151515] text-white"}`}
                    >
                      {num === 0 ? "★" : num}
                    </div>
                  ))}
              </div>

              <div className="flex flex-col gap-3">
                {!selectedIds.has(previewId) ? (
                  <>
                    <button
                      onClick={() => stakeCard(previewId)}
                      disabled={isDeducting}
                      className="w-full h-14 bg-hb-gold text-hb-blueblack rounded-2xl font-black uppercase text-[13px] shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {isDeducting ? (
                        <div className="w-5 h-5 border-2 border-hb-blueblack/20 border-t-hb-blueblack rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <i className="fas fa-coins text-[10px]"></i>
                          Stake {betAmount} ETB
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setPreviewId(null)}
                      className="w-full h-12 bg-white/5 text-hb-muted rounded-xl font-bold uppercase text-[11px] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-full h-14 bg-hb-emerald/10 text-hb-emerald border border-hb-emerald/20 rounded-2xl font-black uppercase text-[12px] flex items-center justify-center gap-2 mb-1">
                      <i className="fas fa-check-circle"></i>
                      Already Staked
                    </div>

                    <button
                      onClick={() => setPreviewId(null)}
                      className="w-full h-12 bg-white/5 text-hb-muted rounded-xl font-bold uppercase text-[11px] hover:text-white transition-colors"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[320px] px-4 animate-in slide-in-from-bottom-4">
          <button
            onClick={() => onSelectCard(Array.from(selectedIds))}
            className="w-full h-14 bg-hb-blueblack text-white px-5 rounded-2xl shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all border border-white/10"
          >
            <div className="text-left">
              <div className="text-[14px] font-black text-hb-gold leading-none">
                {totalStake.toLocaleString()}{" "}
                <span className="text-[10px]">ETB</span>
              </div>
              <div className="text-[8px] font-black uppercase opacity-60 tracking-widest mt-0.5">
                Total Stake
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase">
                Join Game
              </span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default CardSelectionView;

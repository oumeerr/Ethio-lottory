import React, { useEffect, useState } from "react";
import { generateCard, generateMiniCard } from "../services/constants";
import { User } from "../types";

interface HistoryViewProps {
  user: User;
}

interface GameHistory {
  id: string;
  winner_id: number;
  prize_amount: number;
  card_id: number;
  mode: "classic" | "mini";
  called_numbers: number[];
  win_numbers: number[];
  player_count: number;
  created_at: string;
}

interface HistoryItem {
  id: string;
  date: string;
  players: number;
  stake: string | number;
  win: number;
  status: "won" | "lost";
  cardId: number;
  mode: "classic" | "mini";
  calledNumbers: number[];
  winNumbers: number[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ user }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/history/${user.telegram_id}`)
      .then(res => res.json())
      .then(data => {
        // Map games to the display format
        const formattedHistory = (data.games || []).map((g: GameHistory) => ({
          id: `#HB-${g.id.substring(0, 4).toUpperCase()}`,
          date: new Date(g.created_at).toLocaleString(),
          players: g.player_count,
          stake: "N/A", // We don't store stake in game_history yet, could add
          win: g.prize_amount,
          status: "won" as const,
          cardId: g.card_id,
          mode: g.mode,
          calledNumbers: g.called_numbers || [],
          winNumbers: g.win_numbers || [],
        }));
        setHistory(formattedHistory);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user.telegram_id]);

  if (loading) {
    return <div className="p-10 text-center opacity-50 uppercase font-black text-[11px] animate-pulse">Synchronizing Logs...</div>;
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">
            Activity Logs
          </h2>
          <p className="text-[11px] text-hb-muted font-bold uppercase tracking-widest mt-1">
            Detailed Match History
          </p>
        </div>
        <div className="bg-hb-surface border border-hb-border px-3 py-1.5 rounded-xl text-[10px] font-black text-hb-gold uppercase shadow-sm">
          Real Time
        </div>
      </div>

      <div className="space-y-8">
        {history.length === 0 ? (
          <div className="py-20 text-center opacity-30 border-2 border-dashed border-hb-border rounded-[2.5rem]">
            <i className="fas fa-receipt text-4xl mb-4"></i>
            <p className="text-[11px] font-black uppercase tracking-widest">No match records found</p>
          </div>
        ) : (
          history.map((h, i) => {
            const grid =
              h.mode === "mini"
                ? generateMiniCard(h.cardId)
                : generateCard(h.cardId);
            const flatGrid = grid.flat();
            const calledSet = new Set(h.calledNumbers as number[]);

            return (
              <div
                key={i}
                className="bg-hb-surface rounded-[2.5rem] border border-hb-border overflow-hidden shadow-2xl transition-all hover:border-hb-gold/30"
              >
                {/* Header Info */}
                <div className="p-5 flex items-center justify-between bg-black/40 border-b border-hb-border">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-black text-white tracking-tight">
                        {h.id}
                      </span>
                      <span
                        className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase border ${h.mode === "mini" ? "bg-hb-gold/10 text-hb-gold border-hb-gold/20" : "bg-hb-gold/20 text-hb-gold border-hb-gold/30"}`}
                      >
                        {h.mode}
                      </span>
                    </div>
                    <span className="text-[9px] text-hb-muted font-bold uppercase tracking-wider">
                      {h.date}
                    </span>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-[18px] font-black leading-none mb-1 ${h.status === "won" ? "text-hb-emerald" : "text-red-500"}`}
                    >
                      {h.status === "won"
                        ? `+${h.win.toLocaleString()}`
                        : `-${h.stake.toLocaleString()}`}
                    </div>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${h.status === "won" ? "bg-hb-emerald/10 text-hb-emerald" : "bg-red-500/10 text-red-500"}`}
                    >
                      {h.status}
                    </span>
                  </div>
                </div>

                {/* Vertical Side-by-Side: Cartela vs Call Log */}
                <div className="p-5 grid grid-cols-12 gap-6 bg-black">
                  {/* Left: The Cartela Grid (History Stage) */}
                  <div className="col-span-7">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[9px] font-black text-hb-gold uppercase tracking-widest italic">
                        Match Card #{h.cardId}
                      </span>
                    </div>
                    <div
                      className={`grid ${h.mode === "mini" ? "grid-cols-3" : "grid-cols-5"} gap-1 bg-[#0A0A0A] p-3 rounded-2xl border border-hb-border shadow-inner`}
                    >
                      {flatGrid.map((num, idx) => {
                        const isMarked = num === 0 || calledSet.has(num);
                        const isWinningNum = (h.winNumbers as number[])?.includes(num);
                        return (
                          <div
                            key={idx}
                            className={`aspect-square flex items-center justify-center text-[10px] font-black rounded-lg border transition-all
                              ${
                                isWinningNum
                                  ? "bg-hb-gold text-hb-blueblack border-hb-gold shadow-sm"
                                  : isMarked
                                    ? "bg-hb-emerald/20 text-hb-emerald border-hb-emerald/30"
                                    : "bg-hb-surface text-hb-muted/20 border-hb-border/30"
                              }`}
                          >
                            {num === 0 ? "★" : num}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Vertical Call History Log */}
                  <div className="col-span-5 flex flex-col">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[9px] font-black text-hb-gold uppercase tracking-widest italic">
                        Call Log
                      </span>
                    </div>
                    <div className="flex-1 bg-hb-surface border border-hb-border/50 rounded-2xl overflow-hidden flex flex-col max-h-[160px]">
                      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
                        {h.calledNumbers.map((num: number, idx: number) => {
                          const isWinningNum = (h.winNumbers as number[])?.includes(num);
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all
                                ${
                                  isWinningNum
                                    ? "bg-hb-gold text-hb-blueblack border-hb-gold shadow-sm"
                                    : "bg-black/20 text-white border-hb-border shadow-sm"
                                }`}
                            >
                              <span
                                className={`w-5 h-5 shrink-0 rounded-lg flex items-center justify-center text-[8px] font-black border ${isWinningNum ? "bg-hb-blueblack/20 border-hb-blueblack/10 text-hb-blueblack" : "bg-black border-hb-border text-hb-muted"}`}
                              >
                                {idx + 1}
                              </span>
                              <span className="text-[11px] font-black tracking-tight uppercase">
                                {num === 0 ? "FREE" : `B-${num}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-2 bg-black border-t border-hb-border/50 text-center">
                        <span className="text-[8px] font-black text-hb-gold/40 uppercase tracking-widest italic">
                          End of Session
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Footer */}
                <div className="px-5 py-4 flex items-center justify-between bg-[#050505] border-t border-hb-border/50">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-hb-muted uppercase tracking-widest">
                        Players
                      </span>
                      <span className="text-[11px] font-black text-white">
                        {h.players}
                      </span>
                    </div>
                    <div className="w-px h-6 bg-hb-border"></div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-hb-muted uppercase tracking-widest">
                        Prize
                      </span>
                      <span className="text-[11px] font-black text-hb-emerald">
                        {h.win} ETB
                      </span>
                    </div>
                  </div>
                  {h.status === "won" && (
                    <div className="flex items-center gap-1.5 bg-hb-gold/10 text-hb-gold px-3 py-1.5 rounded-xl border border-hb-gold/20">
                      <i className="fas fa-crown text-[10px]"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        VERIFIED
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-12 p-8 bg-hb-surface rounded-[2.5rem] border border-hb-border border-dashed text-center">
        <i className="fas fa-receipt text-hb-gold/20 text-4xl mb-4"></i>
        <h4 className="text-[13px] font-black text-white uppercase mb-2">
          Immutable Ledger
        </h4>
        <p className="text-[11px] text-hb-muted font-bold leading-relaxed px-4">
          Match logs are securely stored for 30 days. For dispute resolution or
          technical assistance, contact Support.
        </p>
      </div>
    </div>
  );
};

export default HistoryView;

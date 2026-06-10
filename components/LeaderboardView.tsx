import React, { useState, useEffect, useCallback } from "react";

interface LeaderboardEntry {
  username: string;
  balance: number;
  rank: number;
  prize: string;
  coinsWon: number;
  gamesPlayed: number;
}

const TIERS = {
  10: { minGames: 300, multiplier: 1, basePrize: 3000 },
  20: { minGames: 250, multiplier: 2, basePrize: 3000 },
  1000: { minGames: 200, multiplier: 1, basePrize: 50000 }, // Custom high stakes
};

interface LeaderboardViewProps {
  onPlay?: () => void;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onPlay }) => {
  const [tab, setTab] = useState<"daily" | "weekly">("daily");
  const [selectedBet, setSelectedBet] = useState<10 | 20 | 1000>(10);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ daily: "", weekly: "" });

  const calculatePrize = (rank: number, bet: 10 | 20 | 1000) => {
    if (rank > 4) return "0 ETB";

    const config = TIERS[bet];
    let prize = 0;
    if (rank === 1)
      prize = config.basePrize * (bet === 20 ? config.multiplier : 1);
    else if (rank === 2)
      prize = (config.basePrize / 2) * (bet === 20 ? config.multiplier : 1);
    else if (rank === 3)
      prize = (config.basePrize / 3) * (bet === 20 ? config.multiplier : 1);
    else if (rank === 4) prize = 100 * (bet === 20 ? config.multiplier : 1);

    // Custom high stakes overrides for 1000 ETB
    if (bet === 1000) {
      if (rank === 1) prize = 50000;
      else if (rank === 2) prize = 25000;
      else if (rank === 3) prize = 15000;
      else if (rank === 4) prize = 5000;
    }

    return `${prize.toLocaleString()} ETB`;
  };

  const getTimers = useCallback(() => {
    const now = new Date();

    // Daily
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const dDiff = endOfDay.getTime() - now.getTime();
    const dh = Math.floor(dDiff / (1000 * 60 * 60));
    const dm = Math.floor((dDiff % (1000 * 60 * 60)) / (1000 * 60));
    const ds = Math.floor((dDiff % (1000 * 60)) / 1000);

    // Weekly (Resets on Sunday night)
    const daysUntilNextWeek = (7 - now.getDay()) % 7;
    const nextWeek = new Date(now);
    nextWeek.setDate(
      now.getDate() + (daysUntilNextWeek === 0 ? 7 : daysUntilNextWeek),
    );
    nextWeek.setHours(23, 59, 59, 999);
    const wDiff = nextWeek.getTime() - now.getTime();
    const wd = Math.floor(wDiff / (1000 * 60 * 60 * 24));
    const wh = Math.floor((wDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    setCountdown({
      daily: `${dh.toString().padStart(2, "0")}:${dm.toString().padStart(2, "0")}:${ds.toString().padStart(2, "0")}`,
      weekly: `${wd}d : ${wh}h`,
    });
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [tab, selectedBet]);

  useEffect(() => {
    getTimers();
    const interval = setInterval(getTimers, 1000);
    return () => clearInterval(interval);
  }, [getTimers]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Mock data instead of Supabase
      const mockData = [
        { username: "Dawit", balance: 45000, wins: 152 },
        { username: "Almaz", balance: 32000, wins: 128 },
        { username: "Kebede", balance: 28500, wins: 98 },
        { username: "Meseret", balance: 21000, wins: 85 },
        { username: "Tadesse", balance: 18400, wins: 76 },
        { username: "Hanna", balance: 15200, wins: 64 },
        { username: "Bereket", balance: 12100, wins: 52 },
        { username: "Selam", balance: 9800, wins: 45 },
        { username: "Yared", balance: 7500, wins: 38 },
        { username: "Gennet", balance: 5200, wins: 22 },
      ];

      const formattedData = mockData.map((profile, index) => {
        return {
          username: profile.username || "Anonymous",
          balance: profile.balance,
          rank: index + 1,
          prize: calculatePrize(index + 1, selectedBet),
          coinsWon: tab === "daily" ? profile.balance : profile.wins * 100, // Adjusted logic
          gamesPlayed: Math.floor(profile.wins * 3.2 + (10 - index) * 2), // Mock games played
        };
      });

      // Sort based on tab
      if (tab === "daily") {
        formattedData.sort((a, b) => b.balance - a.balance);
      } else {
        formattedData.sort((a, b) => b.coinsWon - a.coinsWon);
      }

      setLeaders(formattedData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const minGames = TIERS[selectedBet].minGames;

  return (
    <div className="p-4 pb-24">
      {/* Header with Timers */}
      <div className="bg-gradient-to-br from-orange-600 to-red-600 p-8 rounded-[2.5rem] text-white mb-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-1 italic tracking-tighter uppercase leading-none">
            Hall of Fame
          </h2>
          <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.3em]">
            The ETHIOLOTTORY Legends
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[8px] font-black uppercase opacity-60 block mb-1">
                Daily Reset
              </span>
              <span className="text-lg font-black italic tracking-wider tabular-nums">
                {countdown.daily}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[8px] font-black uppercase opacity-60 block mb-1">
                Weekly Prize
              </span>
              <span className="text-lg font-black italic tracking-wider tabular-nums">
                {countdown.weekly}
              </span>
            </div>
          </div>
        </div>
        <i className="fas fa-trophy absolute -right-6 -bottom-6 text-white/10 text-[8rem] rotate-12"></i>
      </div>

      {/* Bet Selection Filter */}
      <div className="px-1 mb-6">
        <label className="text-[10px] font-black text-hb-muted uppercase tracking-widest mb-3 block">
          Game Stakes
        </label>
        <div className="grid grid-cols-3 gap-2 bg-[#1A1A1A] p-2 rounded-[2rem] border border-hb-border shadow-inner">
          {[10, 20, 1000].map((bet) => (
            <button
              key={bet}
              onClick={() => setSelectedBet(bet as 10 | 20 | 1000)}
              className={`py-3.5 rounded-3xl font-black text-[11px] uppercase transition-all flex flex-col items-center gap-0.5
                ${selectedBet === bet ? "bg-hb-gold text-hb-blueblack shadow-lg scale-[1.02]" : "text-hb-muted hover:text-white"}`}
            >
              <span>{bet} ETB</span>
              {bet === 20 && (
                <span className="text-[7px] font-black bg-black/10 px-1.5 py-0.5 rounded-full">
                  2X REWARD
                </span>
              )}
              {bet === 1000 && (
                <span className="text-[7px] font-black bg-black/10 px-1.5 py-0.5 rounded-full">
                  ELITE
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 bg-hb-surface/50 p-1.5 rounded-[2rem] border border-hb-border/50">
        <button
          onClick={() => setTab("daily")}
          className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${tab === "daily" ? "bg-white text-orange-600 shadow-xl" : "text-hb-muted"}`}
        >
          <i className="fas fa-chart-line"></i>
          Top Balances
        </button>
        <button
          onClick={() => setTab("weekly")}
          className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${tab === "weekly" ? "bg-white text-orange-600 shadow-xl" : "text-hb-muted"}`}
        >
          <i className="fas fa-crown"></i>
          Victory Count
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="bg-[#0A0A0A] rounded-[2.5rem] border border-hb-border overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-hb-gold/20 border-t-hb-gold rounded-full animate-spin"></div>
            <span className="text-[10px] font-black text-hb-muted uppercase tracking-widest">
              Loading Rankings...
            </span>
          </div>
        ) : (
          <div>
            {leaders.map((l, i) => (
              <div
                key={i}
                className={`flex flex-col gap-4 p-6 border-b border-hb-border/50 last:border-0 ${i === 0 ? "bg-hb-gold/5" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg border-2
                      ${
                        l.rank === 1
                          ? "bg-hb-gold text-hb-blueblack border-white/20"
                          : l.rank === 2
                            ? "bg-gray-400 text-hb-blueblack border-white/10"
                            : l.rank === 3
                              ? "bg-orange-400 text-hb-blueblack border-white/10"
                              : "bg-[#151515] text-hb-muted border-hb-border"
                      }`}
                  >
                    {l.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm tracking-tight">
                        {l.username}
                      </span>
                      {l.rank <= 3 && (
                        <i
                          className={`fas fa-certificate text-[10px] ${l.rank === 1 ? "text-hb-gold" : "text-white/40"}`}
                        ></i>
                      )}
                    </div>
                    <div className="text-[9px] text-hb-muted font-bold uppercase tracking-wider">
                      {l.coinsWon.toLocaleString()} Coins Won
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="text-[13px] font-black text-hb-gold italic">
                      {l.prize}
                    </div>
                    {l.rank <= 4 ? (
                      <div className="text-[8px] text-emerald-500 font-black uppercase tracking-tighter">
                        Guaranteed
                      </div>
                    ) : (
                      <button
                        onClick={onPlay}
                        className="text-[8px] bg-hb-gold text-hb-blueblack px-2 py-0.5 rounded-full font-black uppercase tracking-tighter hover:scale-105 transition-transform"
                      >
                        Play Game
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar Column */}
                <div className="px-1">
                  <div className="flex justify-between items-center mb-1.5 px-0.5">
                    <span className="text-[8px] font-black text-hb-muted uppercase tracking-widest">
                      Eligibility Status
                    </span>
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">
                      {l.gamesPlayed} / {minGames} Games
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${l.gamesPlayed >= minGames ? "bg-hb-emerald shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-hb-gold"}`}
                      style={{
                        width: `${Math.min(100, (l.gamesPlayed / minGames) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-8 bg-orange-500/5 rounded-[2.5rem] border border-orange-500/20 text-center">
        <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-info-circle text-xs"></i>
        </div>
        <p className="text-[10px] text-orange-200/60 font-bold leading-relaxed uppercase tracking-widest px-4">
          Eligibility Requirements: <br />
          Min {minGames} games required for {selectedBet} ETB tier rewards.{" "}
          <br />
          Prizes are distributed every {tab === "daily" ? "24 hours" : "7 days"}
          .
        </p>
      </div>
    </div>
  );
};

export default LeaderboardView;

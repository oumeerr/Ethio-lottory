import React, { useState, useEffect } from "react";

interface HomeViewProps {
  onQuickPlay: () => void;
  gameState: { status: string; countdown_end: string | null; players: number };
}

const HomeView: React.FC<HomeViewProps> = ({ onQuickPlay, gameState }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (gameState.status === "countdown" && gameState.countdown_end) {
      const interval = setInterval(() => {
        const end = new Date(gameState.countdown_end!).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((end - now) / 1000));
        setTimeLeft(diff);
        if (diff <= 0) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [gameState.status, gameState.countdown_end]);

  return (
    <div className="p-4 flex flex-col gap-5 animate-in fade-in duration-700">
      {/* Game Lobby Status Banner */}
      <div
        className={`p-6 rounded-[2.5rem] border transition-all duration-500 overflow-hidden relative shadow-2xl
        ${
          gameState.status === "playing"
            ? "bg-hb-blueblack border-hb-border"
            : gameState.status === "countdown"
              ? "bg-orange-500 shadow-[0_20px_50px_rgba(249,115,22,0.4)] border-white/20"
              : "bg-orange-600/10 border-orange-500/20"
        }`}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${gameState.status === "playing" ? "bg-red-500" : gameState.status === "countdown" ? "bg-hb-blueblack" : "bg-orange-500"}`}
              ></div>
              <span
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${gameState.status === "countdown" ? "text-hb-blueblack" : "text-hb-muted"}`}
              >
                {gameState.status === "playing"
                  ? "Match in Progress"
                  : gameState.status === "countdown"
                    ? "Game Launching"
                    : "Waiting for Players"}
              </span>
            </div>
            <div className="bg-black/10 px-3 py-1 rounded-full border border-black/10">
              <span
                className={`text-[9px] font-black uppercase ${gameState.status === "countdown" ? "text-hb-blueblack" : "text-orange-500"}`}
              >
                {gameState.players} / 2 Players Minimum
              </span>
            </div>
          </div>

          {gameState.status === "playing" ? (
            <div className="text-center py-2">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">
                Game is Full
              </h2>
              <p className="text-[10px] text-hb-muted font-bold uppercase tracking-widest leading-relaxed">
                A high-stakes battle is underway. <br />
                Stake your cards now to join the next round!
              </p>
            </div>
          ) : gameState.status === "countdown" ? (
            <div className="text-center py-2">
              <span className="text-[48px] font-black text-hb-blueblack tabular-nums tracking-tighter drop-shadow-sm leading-none block mb-1">
                {timeLeft ?? "..."}s
              </span>
              <p className="text-[10px] text-hb-blueblack/60 font-black uppercase tracking-widest">
                Quantum Gateway Opening
              </p>
            </div>
          ) : (
            <div className="text-center py-2">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">
                Lobby Open
              </h2>
              <p className="text-[10px] text-orange-200 font-bold uppercase tracking-widest leading-relaxed">
                Need {Math.max(0, 2 - gameState.players)} more players to
                initiate <br />
                quantum matchmaking sequence.
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Background Icon */}
        <i
          className={`fas absolute -right-6 -bottom-6 text-[8rem] rotate-12 opacity-10 transition-all duration-700
          ${
            gameState.status === "playing"
              ? "fa-lock text-white"
              : gameState.status === "countdown"
                ? "fa-bolt text-hb-blueblack"
                : "fa-users text-orange-500"
          }`}
        ></i>
      </div>

      <div
        className="bg-orange-500 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group cursor-pointer"
        onClick={onQuickPlay}
      >
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-1 italic tracking-tighter uppercase leading-none">
            Play Game
          </h2>
          <p className="text-[11px] font-bold opacity-80 uppercase tracking-[0.3em]">
            Join the Game
          </p>

          <button className="mt-8 flex items-center gap-3 bg-white text-orange-600 px-6 py-3 rounded-2xl font-black uppercase text-[12px] shadow-lg active:scale-95 transition-all">
            Play Now
            <i className="fas fa-play text-[10px]"></i>
          </button>
        </div>
        <i className="fas fa-dice absolute -right-8 -bottom-8 text-white/20 text-[10rem] rotate-12 group-hover:rotate-45 transition-transform duration-700"></i>
      </div>

      <div className="bg-hb-surface border border-hb-border p-8 rounded-[2rem] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[12px] font-black text-hb-muted uppercase tracking-widest">
            Card Explorer
          </h3>
          <span className="text-[12px] text-hb-gold font-bold px-3 py-1 bg-hb-gold/10 rounded-lg border border-hb-gold/20">
            1-400 Range
          </span>
        </div>
        <p className="text-[13px] text-hb-muted opacity-80 mb-6 font-medium leading-relaxed">
          Select your lucky numbers. Browse the full collection of available
          cards.
        </p>
        <button
          onClick={onQuickPlay}
          className="w-full py-5 bg-hb-bg rounded-[1.5rem] text-[12px] font-black text-hb-muted uppercase hover:text-white hover:border-hb-muted border border-hb-border transition-all shadow-inner"
        >
          View Available Cards
        </button>
      </div>
    </div>
  );
};

export default HomeView;

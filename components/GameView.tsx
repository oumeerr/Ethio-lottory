import React, { useState, useEffect, useRef, useCallback } from "react";
import { User } from "../types";
import { APP_CONFIG } from "../config";
import { generateCard, generateMiniCard } from "../services/constants";

interface GameViewProps {
  cardIds: number[];
  betAmount: number;
  mode: "classic" | "mini";
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  matchStartTime: number;
  onClose: () => void;
}

const GameView: React.FC<GameViewProps> = ({
  cardIds,
  betAmount,
  mode,
  user,
  setUser,
  matchStartTime,
  onClose,
}) => {
  const [gameState, setGameState] = useState<
    "matchmaking" | "playing" | "finished"
  >("matchmaking");
  const [nextRoundTimer, setNextRoundTimer] = useState(3);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const isAutoPlayRef = useRef(isAutoPlay);

  useEffect(() => {
    isAutoPlayRef.current = isAutoPlay;
    if (isAutoPlay && gameState === "playing") {
      setMarkedByCard((prev) => {
        const next = { ...prev };
        cardIds.forEach((id) => {
          const validMarks = new Set(prev[id]);
          drawnNumbersRef.current.forEach((num) => {
            if (allCardsData.current[id].flat().includes(num)) {
              validMarks.add(num);
            }
          });
          next[id] = validMarks;
        });
        return next;
      });
    }
  }, [isAutoPlay, cardIds, gameState]);

  // Deterministic remaining time calculation
  const getRemainingTime = useCallback(() => {
    const elapsed = Math.floor((Date.now() - matchStartTime) / 1000);
    const remaining = APP_CONFIG.GAME.MATCHMAKING_SECONDS - elapsed;
    return Math.max(0, remaining);
  }, [matchStartTime]);

  const [countdown, setCountdown] = useState(getRemainingTime());
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const drawnNumbersRef = useRef<number[]>([]);

  useEffect(() => {
    drawnNumbersRef.current = drawnNumbers;
  }, [drawnNumbers]);

  const [markedByCard, setMarkedByCard] = useState<Record<number, Set<number>>>(
    cardIds.reduce((acc, id) => ({ ...acc, [id]: new Set([0]) }), {}),
  );
  const markedByCardRef = useRef(markedByCard);

  useEffect(() => {
    markedByCardRef.current = markedByCard;
  }, [markedByCard]);

  const [winner, setWinner] = useState<string | null>(null);
  const [winningCardIds, setWinningCardIds] = useState<number[]>([]);
  const [winnings, setWinnings] = useState(0);

  // Generate hard combinations on load using improved constants
  const allCardsData = useRef<Record<number, number[][]>>(
    cardIds.reduce(
      (acc, id) => ({
        ...acc,
        [id]: mode === "mini" ? generateMiniCard(id) : generateCard(id),
      }),
      {},
    ),
  );

  const callInterval = useRef<number | null>(null);

  const checkWinForCard = useCallback(
    (id: number, currentMarked: Set<number>) => {
      const grid = allCardsData.current[id];
      const isMarked = (n: number) => currentMarked.has(n);
      const size = mode === "mini" ? 3 : 5;

      // Row Check
      for (let r = 0; r < size; r++)
        if (grid[r].every((num) => isMarked(num))) return true;

      // Column Check
      for (let c = 0; c < size; c++) {
        let colMarked = true;
        for (let r = 0; r < size; r++)
          if (!isMarked(grid[r][c])) colMarked = false;
        if (colMarked) return true;
      }

      // Diagonal Check
      let d1 = true,
        d2 = true;
      for (let i = 0; i < size; i++) {
        if (!isMarked(grid[i][i])) d1 = false;
        if (!isMarked(grid[i][size - 1 - i])) d2 = false;
      }
      if (d1 || d2) return true;

      // Special Patterns for Classic Mode
      if (mode === "classic") {
        const topLeft = isMarked(grid[0][0]);
        const topRight = isMarked(grid[0][4]);
        const bottomLeft = isMarked(grid[4][0]);
        const bottomRight = isMarked(grid[4][4]);
        if (topLeft && topRight && bottomLeft && bottomRight) return true;
      }
      return false;
    },
    [mode],
  );

  const winningCardsList = cardIds.filter((id) =>
    checkWinForCard(id, markedByCard[id]),
  );
  const isAnyWinning = winningCardsList.length > 0;

  // Fetch lobby data for current players
  useEffect(() => {
    // Mocking lobby sync
  }, []);

  const handleCallBingo = useCallback(
    (winners?: number[]) => {
      if (callInterval.current) clearInterval(callInterval.current);

      const actualWinners =
        (Array.isArray(winners) ? winners : null) ||
        cardIds.filter((id) => {
          const validMarks = new Set(
            [...markedByCardRef.current[id]].filter(
              (n) => n === 0 || drawnNumbersRef.current.includes(n),
            ),
          );
          return checkWinForCard(id, validMarks);
        });
      const isActuallyWinning = actualWinners.length > 0;

      if (!isActuallyWinning) {
        setWinnings(0);
        setWinningCardIds([]);
        setWinner("HOUSE (FALSE BINGO)");
        setGameState("finished");
        return;
      }

      const totalStake = betAmount * 2.5; // Simulate a larger pot
      const winnersCount = actualWinners.length;
      const totalWinPool = Math.floor(
        totalStake * (1 - APP_CONFIG.GAME.HOUSE_FEE_PERCENT),
      );
      const winAmountPerCard = Math.floor(totalWinPool / (winnersCount || 1));
      const totalWinnings = winnersCount * winAmountPerCard;

      const wins = user.games_won;

      setWinnings(totalWinnings);
      setWinningCardIds(actualWinners);
      setWinner(
        winnersCount > 1
          ? `${user.username} (${winnersCount} Winners Split)`
          : user.username,
      );

      // DB Sync for games won
      const updatePayload: Partial<User> = {
        games_won: wins + 1,
        balance: user.balance + totalWinnings,
      };
      if (user.has_deposited) {
        updatePayload.games_won_after_deposit =
          (user.games_won_after_deposit || 0) + 1;
      }

      // Record Win on Server
      fetch("/api/game/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerId: user.telegram_id,
          prizeAmount: totalWinnings,
          cardId: actualWinners[0] || cardIds[0],
          mode,
          calledNumbers: drawnNumbersRef.current,
          winNumbers: actualWinners.length > 0 ? Array.from(markedByCardRef.current[actualWinners[0]]) : [],
          itemCount: 2 // Assuming 2 players for mock
        })
      }).catch(console.error);

      setUser((prev) => ({
        ...prev,
        balance: prev.balance + totalWinnings,
        games_won: prev.games_won + 1,
        games_won_after_deposit: user.has_deposited
          ? (prev.games_won_after_deposit || 0) + 1
          : prev.games_won_after_deposit,
      }));
      setGameState("finished");
    },
    [betAmount, user.username, setUser, user.balance, user.games_won, user.telegram_id, user.id, user.has_deposited, user.games_won_after_deposit],
  );

  const getCardProgress = useCallback(
    (id: number) => {
      const grid = allCardsData.current[id];
      const marked = markedByCard[id];
      const size = mode === "mini" ? 3 : 5;
      let max = 0;
      for (let r = 0; r < size; r++) {
        const count = grid[r].filter((n) => marked.has(n)).length;
        if (count > max) max = count;
      }
      for (let c = 0; c < size; c++) {
        let count = 0;
        for (let r = 0; r < size; r++) if (marked.has(grid[r][c])) count++;
        if (count > max) max = count;
      }
      return { current: max, total: size };
    },
    [mode, markedByCard],
  );

  // Matchmaking Timer Sync - Ensures game starts NO MATTER WHAT
  useEffect(() => {
    if (gameState === "matchmaking") {
      const initialRemaining = getRemainingTime();
      if (initialRemaining <= 0) {
        setGameState("playing");
        return;
      }

      setCountdown(initialRemaining);

      const timer = setInterval(() => {
        const remaining = getRemainingTime();
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
          setGameState("playing");
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, getRemainingTime]);

  // Autoplayer Effect
  useEffect(() => {
    if (gameState === "playing" && isAutoPlay && isAnyWinning) {
      handleCallBingo();
    }
  }, [gameState, isAutoPlay, isAnyWinning, handleCallBingo]);

  // Next Round Timer Effect
  useEffect(() => {
    if (gameState === "finished" && nextRoundTimer > 0) {
      const timer = setInterval(() => {
        setNextRoundTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, nextRoundTimer]);

  useEffect(() => {
    if (gameState === "playing") {
      const poolSize = mode === "mini" ? 30 : 75;
      const pool = Array.from({ length: poolSize }, (_, i) => i + 1);
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      let idx = 0;

      const intervalMs =
        mode === "mini"
          ? APP_CONFIG.GAME.CALL_INTERVAL_MINI_MS
          : APP_CONFIG.GAME.CALL_INTERVAL_CLASSIC_MS;

      callInterval.current = window.setInterval(() => {
        // Check if game should auto-stop due to win in auto-play mode
        const currentWinningCards = cardIds.filter((id) =>
          checkWinForCard(id, markedByCardRef.current[id]),
        );
        if (isAutoPlayRef.current && currentWinningCards.length > 0) {
          if (callInterval.current) clearInterval(callInterval.current);
          handleCallBingo(currentWinningCards);
          return;
        }

        if (idx >= poolSize) {
          if (callInterval.current) clearInterval(callInterval.current);
          setGameState("finished");
          setWinner("DRAW (NO WINNERS)");
          return;
        }

        const num = shuffled[idx++];
        setDrawnNumbers((prev) => [...prev, num]);

        if (isAutoPlayRef.current) {
          setMarkedByCard((prev) => {
            const next = { ...prev };
            cardIds.forEach((id) => {
              if (allCardsData.current[id].flat().includes(num)) {
                next[id] = new Set([...prev[id], num]);
              }
            });
            return next;
          });
        }
      }, intervalMs);

      return () => {
        if (callInterval.current) clearInterval(callInterval.current);
      };
    }
  }, [gameState, mode, cardIds]);

  return (
    <div className="min-h-full flex flex-col items-center pt-4 px-2 pb-20">
      {/* Sequential Draw Feed Styling */}
      {gameState === "matchmaking" && (
        <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
          <div className="bg-black p-8 rounded-[32px] shadow-2xl flex flex-col items-center justify-center text-center w-full max-w-[340px] border border-hb-border mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 border-[4px] border-hb-gold/20 border-t-hb-gold rounded-full animate-spin"></div>
              <div className="text-left">
                <h3 className="text-[18px] font-black text-white uppercase tracking-tight leading-none italic">
                  Game Prep
                </h3>
                <p className="text-[11px] text-hb-muted font-bold uppercase mt-1 tracking-widest opacity-60">
                  Initializing Deck
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 bg-black px-6 py-4 rounded-3xl border border-hb-border w-full justify-center shadow-inner">
              <span className="text-[10px] font-black text-hb-muted uppercase tracking-[0.2em]">
                Launch Sequence
              </span>
              <span className="text-[36px] font-black text-hb-gold tabular-nums tracking-tighter shadow-hb-gold/20 drop-shadow-md">
                {countdown}s
              </span>
            </div>
          </div>

          <div className="w-full mb-2 max-w-[400px]">
            <div className="flex items-center gap-2 mb-4 px-4">
              <div className="w-1.5 h-1.5 bg-hb-gold rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase text-hb-muted tracking-[0.3em]">
                Synching Quantum Deck
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-h-[45vh] overflow-y-auto no-scrollbar pb-8 px-2">
              {cardIds.map((id) => (
                <div
                  key={id}
                  className="bg-black p-3 rounded-2xl border border-hb-border shadow-lg relative overflow-hidden group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-hb-gold bg-[#1A1A1A] px-2 py-1 rounded-md border border-hb-border tracking-wider">
                      #{id}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-hb-emerald shadow-[0_0_8px_rgba(5,150,105,0.5)]"></div>
                  </div>
                  <div
                    className={`grid ${mode === "mini" ? "grid-cols-3" : "grid-cols-5"} gap-1 opacity-90 transition-all duration-500 bg-black p-2 rounded-xl border border-hb-border/30`}
                  >
                    {allCardsData.current[id].flat().map((n, i) => (
                      <div
                        key={i}
                        className={`aspect-square flex items-center justify-center text-[8px] font-black rounded-md ${n === 0 ? "bg-hb-emerald/20 text-hb-emerald border-hb-emerald/30 shadow-[inset_0_0_10px_rgba(5,150,105,0.2)]" : "bg-hb-surface text-white/60"}`}
                      >
                        {n === 0 ? "★" : n}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <div className="w-full max-w-[440px] animate-in slide-in-from-bottom-5 duration-500">
          <div className="flex justify-between items-center mb-6 bg-black px-6 py-5 rounded-[32px] shadow-2xl border border-hb-border mx-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-hb-muted uppercase tracking-[0.2em] mb-1.5">
                Prize Pool
              </span>
              <span className="text-[26px] font-black text-hb-emerald leading-none tracking-tighter italic">
                {(
                  betAmount *
                  2 *
                  (1 - APP_CONFIG.GAME.HOUSE_FEE_PERCENT)
                ).toLocaleString()}{" "}
                <span className="text-[12px] opacity-60 not-italic">ETB</span>
              </span>
            </div>
            <div className="bg-hb-surface border border-hb-border text-white px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-hb-emerald animate-pulse"></div>
              <span className="text-[11px] font-black uppercase tracking-widest text-hb-muted">
                Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-10 justify-center h-[70px]">
            {drawnNumbers.length > 0 ? (
              <div className="flex flex-col items-center animate-in zoom-in-50 duration-300">
                <div className="text-[38px] font-black text-white px-10 py-2 bg-black rounded-2xl border-[3px] border-hb-gold shadow-[0_10px_30px_rgba(255,215,0,0.2)] scale-110 relative tabular-nums italic">
                  {drawnNumbers[drawnNumbers.length - 1]}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-hb-emerald text-white text-[12px] font-black rounded-xl flex items-center justify-center border-2 border-white/20 shadow-lg">
                    {drawnNumbers.length}
                  </div>
                </div>
                <div className="text-[10px] font-black text-hb-muted uppercase tracking-[0.4em] mt-5 opacity-40 italic">
                  Live Feed Output
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-hb-gold rounded-full animate-bounce"></div>
                <span className="text-hb-muted italic text-[16px] uppercase tracking-[0.3em] font-black opacity-30">
                  Connecting Feed...
                </span>
              </div>
            )}
          </div>

          <div className="px-5 mb-4 flex items-center justify-between">
            <span className="text-[12px] font-black text-hb-gold uppercase tracking-[0.2em] italic">
              Game Cards
            </span>
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border transition-all ${isAutoPlay ? "bg-hb-gold text-hb-blueblack border-hb-gold shadow-[0_5px_15px_rgba(255,215,0,0.3)] scale-105" : "bg-black text-hb-muted border-hb-border hover:border-hb-muted/40"}`}
            >
              <i
                className={`fas ${isAutoPlay ? "fa-robot" : "fa-hand-pointer"} text-[12px]`}
              ></i>
              <span className="text-[11px] font-black uppercase tracking-widest">
                {isAutoPlay ? "Auto" : "Manual"}
              </span>
            </button>
          </div>

          <div
            className={`grid ${cardIds.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-4 px-3`}
          >
            {cardIds.map((id) => {
              const progress = getCardProgress(id);
              const isWinning = checkWinForCard(id, markedByCard[id]);
              return (
                <div
                  key={id}
                  className={`bg-black p-3 rounded-[28px] border transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col h-fit
                  ${isWinning ? "ring-2 ring-hb-gold scale-[1.05] border-hb-gold z-10 shadow-[0_20px_50px_rgba(255,215,0,0.15)]" : "border-hb-border opacity-95"}`}
                >
                  <div className="flex justify-between items-center mb-3 px-1.5">
                    <span className="text-[11px] font-black text-white italic tracking-tighter opacity-80 decoration-hb-gold decoration-2">
                      #{id}{" "}
                      <span className="text-[8px] opacity-40 not-italic uppercase tracking-widest ml-1">
                        Card
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden border border-hb-border/50">
                        <div
                          className="h-full bg-hb-gold shadow-[0_0_8px_rgba(255,215,0,0.5)] transition-all duration-700 ease-out"
                          style={{
                            width: `${(progress.current / progress.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-black text-hb-gold/60">
                        {progress.current}/{progress.total}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`grid ${mode === "mini" ? "grid-cols-3" : "grid-cols-5"} gap-1.5 justify-items-center bg-black p-2.5 rounded-2xl border border-hb-border/50`}
                  >
                    {allCardsData.current[id].flat().map((num, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          if (!isAutoPlay && num !== 0) {
                            setMarkedByCard((prev) => {
                              const next = { ...prev };
                              const nextSet = new Set(prev[id]);
                              if (nextSet.has(num)) nextSet.delete(num);
                              else nextSet.add(num);
                              next[id] = nextSet;
                              return next;
                            });
                          }
                        }}
                        className={`aspect-square w-full flex items-center justify-center rounded-xl font-black text-[13px] transition-all duration-500 border ${!isAutoPlay && num !== 0 ? "cursor-pointer" : ""}
                        ${
                          num === 0
                            ? "bg-hb-emerald/20 text-hb-emerald border-hb-emerald/30 shadow-[inset_0_0_10px_rgba(5,150,105,0.2)]"
                            : markedByCard[id].has(num)
                              ? "bg-hb-gold text-hb-blueblack border-hb-gold shadow-[0_5px_15px_rgba(255,215,0,0.4)] scale-110"
                              : "bg-hb-surface text-white border-hb-border/30"
                        }`}
                      >
                        {num === 0 ? "★" : num}
                      </div>
                    ))}
                  </div>
                  {isWinning && (
                    <div className="absolute inset-0 bg-hb-gold/10 flex items-center justify-center pointer-events-none backdrop-blur-[2px] animate-pulse">
                      <div className="bg-hb-gold text-hb-blueblack text-[13px] font-black px-5 py-2 rounded-2xl shadow-2xl uppercase tracking-[0.2em] border border-hb-blueblack/20 italic">
                        BINGO!
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 px-3 flex flex-col gap-4">
            <button
              onClick={() => handleCallBingo()}
              disabled={isAutoPlay && isAnyWinning}
              className={`w-full h-[76px] rounded-[28px] font-black text-[26px] shadow-2xl transition-all uppercase tracking-tight border-b-[6px] flex items-center justify-center gap-4 active:scale-95 bg-hb-gold border-[#d97706] text-hb-blueblack hover:brightness-110 ${isAutoPlay && isAnyWinning ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
            >
              <i className="fas fa-crown text-[20px]"></i>
              {isAutoPlay && isAnyWinning ? "Processing..." : "BINGO!"}
            </button>
            <button
              onClick={onClose}
              className="text-[11px] font-black text-hb-muted uppercase tracking-[0.4em] hover:text-red-500 py-3 transition-colors"
            >
              Abandom Match
            </button>
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
          <div className="w-40 h-40 mb-10 bg-gradient-to-br from-hb-gold to-[#f59e0b] rounded-full flex items-center justify-center text-[70px] shadow-[0_0_60px_rgba(251,191,36,0.4)] relative border-4 border-white/20 animate-bounce">
            {winner === user.username ? "🏆" : "🕯️"}
            <div className="absolute -top-6 -right-6 bg-white text-hb-blueblack text-[14px] font-black px-5 py-2 rounded-2xl border-4 border-hb-gold uppercase shadow-2xl skew-x-[-10deg]">
              {winner === user.username ? "Champ" : "Lost"}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-[48px] font-black italic tracking-tighter uppercase leading-none text-white drop-shadow-2xl">
              {winner === user.username ? "GAME CHAMPION!" : "DEFEATED"}
            </h2>
            <div className="text-[20px] font-black text-hb-gold mt-4 uppercase tracking-[0.3em]">
              {winner}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] p-10 w-full max-w-[360px] shadow-3xl mb-12 relative overflow-hidden group">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-hb-gold/5 blur-3xl rounded-full"></div>
            <div className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] mb-8 border-b border-white/10 pb-4 italic">
              Game Summary
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-[15px] font-bold text-white/60">
                Tickets:
              </span>
              <div className="flex gap-2.5">
                {winningCardIds.length > 0 ? (
                  winningCardIds.map((id) => (
                    <span
                      key={id}
                      className="bg-hb-gold text-hb-blueblack text-[13px] font-black px-4 py-2 rounded-2xl shadow-xl transform hover:rotate-3 transition-transform"
                    >
                      #{id}
                    </span>
                  ))
                ) : (
                  <span className="text-red-500 font-black text-[13px] uppercase tracking-[0.2em] animate-pulse">
                    NO WIN
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-[15px] font-bold text-white/60">
                Payout:
              </span>
              <span
                className={`${winner === user.username ? "text-hb-emerald" : "text-hb-muted"} text-[38px] font-black tracking-tighter italic`}
              >
                {winnings.toLocaleString()}{" "}
                <span className="text-[14px] not-italic">ETB</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={nextRoundTimer > 0}
            className={`w-full max-w-[300px] h-20 font-black rounded-[2rem] shadow-[0_15px_40px_rgba(255,255,255,0.1)] active:scale-95 uppercase tracking-[0.2em] text-[18px] transition-all duration-300 flex items-center justify-center gap-3
               ${nextRoundTimer > 0 ? "bg-hb-surface text-hb-muted cursor-not-allowed opacity-50" : "bg-white text-hb-blueblack hover:bg-hb-gold"}`}
          >
            {nextRoundTimer > 0 ? (
              <>
                <i className="fas fa-clock animate-spin text-[14px]"></i>
                Next Round {nextRoundTimer}s
              </>
            ) : (
              "Next game"
            )}
          </button>
        </div>
      )}

      <div className="mt-auto pt-8 text-hb-muted font-black text-[10px] opacity-10 uppercase tracking-[0.5em] italic">
        ENTROPY ENGINE 5.0.1 • HARDMODE ACTIVE
      </div>
    </div>
  );
};

export default GameView;

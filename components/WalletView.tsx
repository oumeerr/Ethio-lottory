import React, { useState, useEffect } from "react";
import { User, Transaction } from "../types";
import { APP_CONFIG } from "../config";

interface WalletViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

type PaymentMethod = "telebirr" | "cbe" | "ebirr" | "kacha" | "mpesa";

interface MethodButtonProps {
  id: PaymentMethod;
  selected: boolean;
  onClick: (id: PaymentMethod) => void;
  logoUrl: string;
}

// Hosted logos for Ethiopian Payment Providers (using high-availability public URLs)
const LOGOS = {
  telebirr:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/4a/6c/2e/4a6c2e37-122e-130f-2169-2810c9d94944/AppIcon-0-0-1x_U007emarketing-0-5-0-85-220.png/512x512bb.jpg",
  cbe: "https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/f2/86/81/f286810c-300c-7703-e820-221614972e25/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.jpg",
  ebirr:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/7e/1c/64/7e1c641f-1339-930c-529d-473133874313/AppIcon-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg",
  kacha:
    "https://pbs.twimg.com/profile_images/1542866598379438081/Hj3x-k-9_400x400.jpg",
  mpesa:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/37/1c/9a/371c9a63-718a-f823-7476-857c0e811c7d/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.jpg",
};

const DepositGuide: React.FC<{ method: PaymentMethod }> = ({
  method,
}) => {
  const ussdCodes: Record<PaymentMethod, string> = {
    telebirr: "*127#",
    cbe: "*847#",
    ebirr: "*841#",
    kacha: "*677#",
    mpesa: "*733#",
  };

  const appNames: Record<PaymentMethod, string> = {
    telebirr: "Telebirr Super App",
    cbe: "CBE Birr App",
    ebirr: "E-Birr App",
    kacha: "Kacha App",
    mpesa: "M-Pesa App",
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-hb-gold/20 flex items-center justify-center text-hb-gold font-black text-xs border border-hb-gold/30">
          1
        </div>
        <p className="text-[12px] font-bold text-white uppercase tracking-wider">
          Choose {method === "cbe" ? "CBE Birr" : method.toUpperCase()} WALLET
        </p>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-hb-gold/20 flex items-center justify-center text-hb-gold font-black text-xs border border-hb-gold/30">
          2
        </div>
        <p className="text-[12px] font-bold text-white uppercase tracking-wider">
          Copy Wallet Number
        </p>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-hb-gold/20 flex items-center justify-center text-hb-gold font-black text-xs border border-hb-gold/30">
          3
        </div>
        <div className="flex flex-col">
          <p className="text-[12px] font-bold text-white uppercase tracking-wider">
            Pay by USSD {ussdCodes[method]}
          </p>
          <p className="text-[10px] text-hb-gold font-black uppercase tracking-widest italic mt-0.5">
            or {appNames[method]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-hb-gold/20 flex items-center justify-center text-hb-gold font-black text-xs border border-hb-gold/30">
          4
        </div>
        <p className="text-[12px] font-bold text-white uppercase tracking-wider">
          Submit Ref ID & Amount
        </p>
      </div>
    </div>
  );
};

const MethodButton: React.FC<MethodButtonProps> = ({
  id,
  selected,
  onClick,
  logoUrl,
}) => {
  const isSelectedStyle = selected
    ? "border-hb-gold ring-2 ring-hb-gold/50 bg-[#121212]"
    : "border-hb-border bg-[#121212] hover:border-hb-muted opacity-60 hover:opacity-100";

  return (
    <button
      onClick={() => onClick(id)}
      className={`relative aspect-square rounded-2xl border-2 transition-all group shadow-sm active:scale-95 flex items-center justify-center p-2 overflow-hidden ${isSelectedStyle}`}
    >
      <img
        src={logoUrl}
        alt={id}
        className="w-full h-full object-contain rounded-xl"
      />
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-hb-gold rounded-full flex items-center justify-center shadow-md">
          <i className="fas fa-check text-[8px] text-hb-blueblack"></i>
        </div>
      )}
    </button>
  );
};

const WalletView: React.FC<WalletViewProps> = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState<
    "deposit" | "withdraw" | "transfer" | "bonus"
  >("deposit");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [refId, setRefId] = useState("");
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("telebirr");
  const [showMethods, setShowMethods] = useState(false);
  const [showWithdrawMethods, setShowWithdrawMethods] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [loading, setLoading] = useState(false);

  const [depositHistory, setDepositHistory] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("hb_deposits");
    return saved ? JSON.parse(saved) : [];
  });
  const [withdrawHistory, setWithdrawHistory] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("hb_withdrawals");
    return saved ? JSON.parse(saved) : [];
  });
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod>("telebirr");
  const [transferHistory, setTransferHistory] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("hb_transfers");
    return saved ? JSON.parse(saved) : [];
  });
  const [bonusHistory] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("hb_bonus_history");
    if (saved) return JSON.parse(saved);
    // Initial Registration Bonus
    return [
      {
        id: "init_bonus",
        type: "bonus",
        amount: 15,
        status: "completed",
        created_at: new Date().toISOString(),
        metadata: { reason: "Registration Bonus" },
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("hb_deposits", JSON.stringify(depositHistory));
  }, [depositHistory]);
  useEffect(() => {
    localStorage.setItem("hb_withdrawals", JSON.stringify(withdrawHistory));
  }, [withdrawHistory]);
  useEffect(() => {
    localStorage.setItem("hb_transfers", JSON.stringify(transferHistory));
  }, [transferHistory]);
  useEffect(() => {
    localStorage.setItem("hb_bonus_history", JSON.stringify(bonusHistory));
  }, [bonusHistory]);

  useEffect(() => {
    setAmount("");
    setRefId("");
    setBank("");
    setRecipientUsername("");
    setAccountNumber(user.phone || user.mobile || "");
    setAccountHolder(user.username || "");
  }, [activeTab, user.phone, user.mobile, user.username]);

  const getDepositNumbers = () => {
    if (selectedMethod === "ebirr" || selectedMethod === "kacha") {
      return APP_CONFIG.WALLET.DEPOSIT_PHONES.MERCHANT;
    }
    if (selectedMethod === "mpesa") {
      return APP_CONFIG.WALLET.DEPOSIT_PHONES.MPESA;
    }
    return APP_CONFIG.WALLET.DEPOSIT_PHONES.STANDARD;
  };

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    alert(`Phone number ${num} copied to clipboard!`);
  };

  const isWithdrawActive = () => {
    const now = new Date();
    const hour = now.getHours();
    return (
      hour >= APP_CONFIG.WALLET.WITHDRAWAL_START_HOUR &&
      hour < APP_CONFIG.WALLET.WITHDRAWAL_END_HOUR
    );
  };

  const handleTransaction = async (
    type: "deposit" | "withdraw" | "transfer",
  ) => {
    const val = parseFloat(amount);
    if (!val || isNaN(val)) return alert("Please enter a valid amount");

    if (type === "deposit") {
      if (val < 30) return alert("Minimum deposit is 30 ETB");
      if (!refId) return alert("Transaction Reference ID is required");
    }

    if (type === "withdraw") {
      if (val < 100) return alert("Minimum withdrawal is 100 ETB");
      if (!bank || !accountNumber || !accountHolder)
        return alert("Please complete all bank details");
      if (user.balance < val) return alert("Insufficient balance");

      // Check bonus withdrawal conditions
      // if ((user.bonus_balance || 0) > 0 && (user.games_played || 0) < 6)
      //   return alert("You must play 6 or more games before withdrawing!");
      // if (user.has_deposited && (user.games_won_after_deposit || 0) < 2)
      //   return alert("You must win 2 or more games after deposit to withdraw!");
    }

    if (type === "transfer") {
      if (val < 100) return alert("Minimum transfer is 100 ETB");
      if (!recipientUsername) return alert("Recipient username required");
      if (user.balance < val * 1.05) return alert("Insufficient balance");
    }

    setLoading(true);

    try {
      const response = await fetch("/api/transactions/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.telegram_id,
          amount: val,
          type,
          recipientUsername, // for transfers
          status: type === "deposit" ? "pending" : "completed"
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Transaction failed");

      if (type === "deposit") {
        setDepositHistory((prev) => [
          {
            id: Math.random().toString(36).substr(2, 9),
            user_id: user.telegram_id,
            type,
            amount: val,
            status: "pending",
            created_at: new Date().toISOString(),
            metadata: { method: selectedMethod, refId },
          },
          ...prev,
        ]);
        alert("Deposit submitted for verification. It will be credited once confirmed.");
      } else if (type === "withdraw") {
        const methodMap: Record<string, string> = {
          telebirr: "Telebirr",
          cbe: "CBE Birr",
          ebirr: "E-Birr",
          kacha: "Kacha",
          mpesa: "M-Pesa",
        };

        setWithdrawHistory((prev) => [
          {
            id: Math.random().toString(36).substr(2, 9),
            user_id: user.telegram_id,
            type,
            amount: val,
            status: "completed",
            created_at: new Date().toISOString(),
            metadata: { 
              bank: methodMap[withdrawMethod], 
              accountNumber: user.phone || user.mobile, 
              accountHolder: user.username 
            },
          },
          ...prev,
        ]);
        setUser((prev) => ({ ...prev, balance: prev.balance - val }));
        alert("Withdrawal request submitted successfully.");
      } else if (type === "transfer") {
        const fee = val * APP_CONFIG.WALLET.TRANSFER_FEE_PERCENT;
        const totalDeduction = val + fee;

        setTransferHistory((prev) => [
          {
            id: Math.random().toString(36).substr(2, 9),
            user_id: user.telegram_id,
            type,
            amount: val,
            status: "completed",
            created_at: new Date().toISOString(),
            recipient_username: recipientUsername,
          },
          ...prev,
        ]);
        setUser((prev) => ({
          ...prev,
          balance: prev.balance - totalDeduction,
        }));
        alert(`Transferred ${val} ETB to @${recipientUsername}`);
      }
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : String(e);
      alert(message || "Transaction failed");
    }

    setAmount("");
    setRefId("");
    setRecipientUsername("");
    setAccountNumber("");
    setAccountHolder("");
    setLoading(false);
  };

  const transferValue = parseFloat(amount) || 0;
  const transferFee = transferValue * APP_CONFIG.WALLET.TRANSFER_FEE_PERCENT;
  const totalTransferDeduction = transferValue + transferFee;

  const renderHistory = (history: Transaction[], type: string) => {
    if (history.length === 0) {
      return (
        <div className="mt-8 flex flex-col items-center justify-center py-10 opacity-30 border-2 border-dashed border-hb-border rounded-3xl">
          <i className="fas fa-history text-3xl mb-3"></i>
          <p className="text-[11px] font-bold uppercase tracking-widest">
            No {type} History
          </p>
        </div>
      );
    }

    return (
      <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-hb-gold animate-pulse"></div>
            <h3 className="text-[11px] font-black text-hb-muted uppercase tracking-[0.2em]">
              Recent {type}s
            </h3>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-hb-border/50 to-transparent ml-4"></div>
        </div>
        <div className="space-y-3">
          {history.map((tx) => {
            const isPositive = tx.type === "deposit" || tx.type === "bonus";
            const isNeutral = tx.type === "transfer";
            const statusColors: Record<string, string> = {
              pending: "bg-orange-500/10 text-orange-500 border-orange-500/10",
              completed:
                "bg-emerald-500/10 text-emerald-500 border-emerald-500/10",
              failed: "bg-red-500/10 text-red-500 border-red-500/10",
            };
            const statusIcons: Record<string, string> = {
              pending: "fa-hourglass-half",
              completed: "fa-check-double",
              failed: "fa-exclamation-triangle",
            };

            return (
              <div key={tx.id} className="group relative overflow-hidden">
                <div className="bg-[#1A1A1A] border border-hb-border/80 p-4 rounded-2xl flex items-center justify-between transition-all duration-300 hover:border-hb-gold/40 hover:bg-[#202020] active:scale-[0.99] shadow-sm">
                  <div className="flex items-center gap-4 relative z-10">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-[18px] shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                        isPositive
                          ? "bg-emerald-500/10 text-emerald-500"
                          : isNeutral
                            ? "bg-hb-blue/10 text-hb-blue"
                            : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      <i
                        className={`fas ${
                          tx.type === "deposit"
                            ? "fa-arrow-trend-up"
                            : tx.type === "withdraw"
                              ? "fa-arrow-trend-down"
                              : tx.type === "bonus"
                                ? "fa-gift"
                                : "fa-right-left"
                        }`}
                      ></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[14px] font-bold text-white tracking-tight">
                          {tx.type === "bonus"
                            ? tx.metadata?.reason || "Bonus Reward"
                            : tx.type.charAt(0).toUpperCase() +
                              tx.type.slice(1)}
                        </span>
                        <span
                          className={`text-[8px] px-1.5 py-0.5 rounded-md border font-black uppercase flex items-center gap-1 leading-none ${statusColors[tx.status] || statusColors.pending}`}
                        >
                          <i
                            className={`fas ${statusIcons[tx.status] || statusIcons.pending} text-[7px]`}
                          ></i>
                          {tx.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-hb-muted font-medium flex items-center gap-1.5">
                        <span className="opacity-80">
                          {new Date(tx.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-hb-border"></span>
                        <span className="opacity-80">
                          {new Date(tx.created_at).toLocaleTimeString(
                            undefined,
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                        {tx.recipient_username && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-hb-border"></span>
                            <span className="text-hb-gold/60">
                              @{tx.recipient_username}
                            </span>
                          </>
                        )}
                        {tx.metadata?.method && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-hb-border"></span>
                            <span className="opacity-80">
                              {tx.metadata.method}
                            </span>
                          </>
                        )}
                        {tx.type === "withdraw" && tx.metadata?.bank && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-hb-border"></span>
                            <span className="opacity-80 truncate max-w-[100px]">
                              {tx.metadata.bank}
                            </span>
                          </>
                        )}
                      </div>
                      {tx.type === "withdraw" && tx.metadata?.accountNumber && (
                        <div className="text-[9px] text-hb-muted/60 mt-0.5 font-mono">
                          AC: {tx.metadata.accountNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div
                      className={`text-[17px] font-black tracking-tight ${isPositive ? "text-emerald-500" : "text-white"}`}
                    >
                      {isPositive ? "+" : "-"}
                      {tx.amount.toLocaleString()}
                    </div>
                    <div className="text-[9px] font-bold text-hb-muted uppercase tracking-wider opacity-60">
                      ETB
                    </div>
                  </div>

                  {/* Glass highlight effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-5">
      {/* Refer & Earn Section */}
      <div className="bg-hb-gold rounded-[24px] p-6 mb-6 shadow-lg shadow-hb-gold/10 relative overflow-hidden group">
        <div className="relative z-10">
          <h3 className="text-hb-blueblack font-black text-lg italic tracking-tighter mb-1 uppercase">
            Refer & Earn Bonus
          </h3>
          <p className="text-hb-blueblack/60 text-[10px] font-bold uppercase tracking-widest mb-4">
            Invite friends & get 10 ETB each!
          </p>

              <div className="flex gap-2">
                <div className="flex-1 bg-hb-blueblack/5 border border-hb-blueblack/10 rounded-xl px-4 flex items-center overflow-hidden h-12">
                  <span className="text-hb-blueblack/50 text-[9px] font-mono font-bold truncate">
                    t.me/Ethiolottorybingo?start={user.phone ? user.phone.replace("+251", "") : user.id}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const displayId = user.phone ? user.phone.replace("+251", "") : user.id;
                    navigator.clipboard.writeText(
                      `https://t.me/Ethiolottorybingo?start=${displayId}`,
                    );
                    alert("Referral link copied!");
                  }}
              className="bg-hb-blueblack text-white px-4 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
            >
              Copy
            </button>
          </div>
        </div>
        <i className="fas fa-gift absolute -right-4 -bottom-4 text-hb-blueblack/10 text-[6rem] rotate-12 group-hover:rotate-0 transition-transform duration-500"></i>
      </div>

      <div className="bg-gradient-to-br from-[#1A1A1A] to-black border border-hb-border p-8 rounded-[24px] text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase opacity-60 mb-1.5 tracking-widest text-hb-muted">
            Available Balance
          </p>
          <h2 className="text-[32px] font-black mb-4 text-hb-gold drop-shadow-sm leading-none">
            {user.balance.toLocaleString()}{" "}
            <span className="text-[16px] opacity-70 font-bold text-white">
              ETB
            </span>
          </h2>
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-hb-gold/10 rounded-lg text-[10px] font-bold uppercase border border-hb-gold/20 text-hb-gold">
              Secured Vault
            </div>
            <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold uppercase border border-white/5 text-hb-muted">
              Verified Player
            </div>
          </div>
        </div>
        <i className="fas fa-wallet absolute -right-6 -bottom-6 text-hb-gold/10 text-[9rem] -rotate-12"></i>
      </div>

      <div className="flex bg-hb-surface border border-hb-border p-1.5 rounded-2xl mb-8 overflow-x-auto gap-1 no-scrollbar">
        {["deposit", "withdraw", "transfer", "bonus"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "deposit" | "withdraw" | "transfer" | "bonus")}
            className={`flex-1 min-w-[80px] py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? "bg-hb-gold text-hb-blueblack shadow-md" : "text-hb-muted hover:text-white"}`}
          >
            {tab === "deposit"
              ? "Deposit"
              : tab === "withdraw"
                ? "Withdraw"
                : tab === "transfer"
                  ? "Transfer"
                  : "Bonus"}
          </button>
        ))}
      </div>

      {activeTab === "deposit" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between ml-1">
              <span className="text-[10px] font-black uppercase text-hb-muted tracking-widest">
                Payment Provider
              </span>
              <button 
                onClick={() => setShowMethods(!showMethods)}
                className="text-[10px] font-black uppercase text-hb-gold tracking-widest flex items-center gap-1.5 bg-hb-gold/10 px-2.5 py-1 rounded-lg border border-hb-gold/20"
              >
                {showMethods ? "Close" : "Change"}
                <i className={`fas fa-chevron-${showMethods ? 'up' : 'down'} text-[8px]`}></i>
              </button>
            </div>

            {showMethods ? (
              <div className="grid grid-cols-5 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <MethodButton
                  id="telebirr"
                  selected={selectedMethod === "telebirr"}
                  logoUrl={LOGOS.telebirr}
                  onClick={(id) => { setSelectedMethod(id); setShowMethods(false); }}
                />
                <MethodButton
                  id="cbe"
                  selected={selectedMethod === "cbe"}
                  logoUrl={LOGOS.cbe}
                  onClick={(id) => { setSelectedMethod(id); setShowMethods(false); }}
                />
                <MethodButton
                  id="ebirr"
                  selected={selectedMethod === "ebirr"}
                  logoUrl={LOGOS.ebirr}
                  onClick={(id) => { setSelectedMethod(id); setShowMethods(false); }}
                />
                <MethodButton
                  id="kacha"
                  selected={selectedMethod === "kacha"}
                  logoUrl={LOGOS.kacha}
                  onClick={(id) => { setSelectedMethod(id); setShowMethods(false); }}
                />
                <MethodButton
                  id="mpesa"
                  selected={selectedMethod === "mpesa"}
                  logoUrl={LOGOS.mpesa}
                  onClick={(id) => { setSelectedMethod(id); setShowMethods(false); }}
                />
              </div>
            ) : (
              <div 
                onClick={() => setShowMethods(true)}
                className="bg-hb-surface border border-hb-border p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:border-hb-gold/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <img src={LOGOS[selectedMethod]} className="w-10 h-10 rounded-xl object-contain bg-white p-1" alt={selectedMethod} />
                  <div>
                    <span className="text-white font-black text-sm uppercase tracking-tighter italic">
                      {selectedMethod === "cbe" ? "CBE Birr" : selectedMethod.toUpperCase()}
                    </span>
                    <p className="text-[10px] text-hb-muted font-bold uppercase tracking-widest">Active Provider</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-hb-muted group-hover:text-hb-gold transition-colors">
                  <i className="fas fa-shuffle text-xs"></i>
                </div>
              </div>
            )}
          </div>

          <div className="bg-hb-surface p-7 rounded-[24px] border border-hb-border shadow-sm space-y-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 mb-4">
                <h3 className="font-black text-white text-[18px] uppercase tracking-tight italic">
                  Deposit Steps
                </h3>
              </div>

              <DepositGuide
                method={selectedMethod}
              />

              <div className="bg-hb-gold/5 border border-hb-gold/10 p-4 rounded-2xl space-y-3">
                <p className="text-[10px] text-hb-gold font-black uppercase tracking-[0.2em] mb-1">
                  Copy Payout Number
                </p>
                {getDepositNumbers().map((num) => (
                  <div
                    key={num}
                    className="bg-black/40 border border-white/5 py-4 px-6 rounded-2xl flex items-center justify-between group hover:border-hb-gold/30 transition-colors"
                  >
                    <div className="text-left">
                      <span className="text-[19px] font-black text-hb-gold tracking-widest font-mono block leading-none">
                        {num}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(num)}
                      className="flex items-center gap-2 px-4 py-2 bg-hb-gold text-hb-blueblack rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg hover:brightness-110"
                    >
                      <i className="fas fa-copy"></i>
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-hb-border/50">
              <h3 className="font-bold text-white text-[16px] uppercase tracking-tight text-center">
                Verify Payment
              </h3>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-hb-muted ml-1 uppercase tracking-tighter italic">
                  Deposit Amount (Min 30 ETB)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full input-human shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-hb-muted ml-1 uppercase tracking-tighter italic">
                  Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="Ref/Txn code"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  className="w-full input-human shadow-sm"
                />
              </div>

              <button
                onClick={() => handleTransaction("deposit")}
                disabled={loading}
                className="w-full h-[54px] bg-hb-gold text-hb-blueblack font-bold rounded-xl text-[14px] uppercase shadow-lg active:scale-[0.98] mt-4 flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-check-circle"></i>
                )}
                {loading ? "Verifying..." : "Submit Deposit"}
              </button>
            </div>
          </div>

          {/* Deposit History Section */}
          {renderHistory(depositHistory, "Deposit")}
        </div>
      )}

      {activeTab === "withdraw" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between ml-1">
              <span className="text-[10px] font-black uppercase text-hb-muted tracking-widest">
                Payment Provider
              </span>
              <button 
                onClick={() => setShowWithdrawMethods(!showWithdrawMethods)}
                className="text-[10px] font-black uppercase text-hb-gold tracking-widest flex items-center gap-1.5 bg-hb-gold/10 px-2.5 py-1 rounded-lg border border-hb-gold/20"
              >
                {showWithdrawMethods ? "Close" : "Change"}
                <i className={`fas fa-chevron-${showWithdrawMethods ? 'up' : 'down'} text-[8px]`}></i>
              </button>
            </div>

            {showWithdrawMethods ? (
              <div className="grid grid-cols-5 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <MethodButton
                  id="telebirr"
                  selected={withdrawMethod === "telebirr"}
                  logoUrl={LOGOS.telebirr}
                  onClick={(id) => { setWithdrawMethod(id); setShowWithdrawMethods(false); }}
                />
                <MethodButton
                  id="cbe"
                  selected={withdrawMethod === "cbe"}
                  logoUrl={LOGOS.cbe}
                  onClick={(id) => { setWithdrawMethod(id); setShowWithdrawMethods(false); }}
                />
                <MethodButton
                  id="ebirr"
                  selected={withdrawMethod === "ebirr"}
                  logoUrl={LOGOS.ebirr}
                  onClick={(id) => { setWithdrawMethod(id); setShowWithdrawMethods(false); }}
                />
                <MethodButton
                  id="kacha"
                  selected={withdrawMethod === "kacha"}
                  logoUrl={LOGOS.kacha}
                  onClick={(id) => { setWithdrawMethod(id); setShowWithdrawMethods(false); }}
                />
                <MethodButton
                  id="mpesa"
                  selected={withdrawMethod === "mpesa"}
                  logoUrl={LOGOS.mpesa}
                  onClick={(id) => { setWithdrawMethod(id); setShowWithdrawMethods(false); }}
                />
              </div>
            ) : (
              <div 
                onClick={() => setShowWithdrawMethods(true)}
                className="bg-hb-surface border border-hb-border p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:border-hb-gold/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <img src={LOGOS[withdrawMethod]} className="w-10 h-10 rounded-xl object-contain bg-white p-1" alt={withdrawMethod} />
                  <div>
                    <span className="text-white font-black text-sm uppercase tracking-tighter italic">
                      {withdrawMethod === "cbe" ? "CBE Birr" : withdrawMethod.toUpperCase()}
                    </span>
                    <p className="text-[10px] text-hb-muted font-bold uppercase tracking-widest">Payout Provider</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-hb-muted group-hover:text-hb-gold transition-colors">
                  <i className="fas fa-shuffle text-xs"></i>
                </div>
              </div>
            )}
          </div>

          <div className="bg-hb-surface p-7 rounded-[24px] border border-hb-border shadow-sm space-y-6">
            <div className="text-center">
              <h3 className="font-bold text-white text-[18px] mb-1 italic uppercase tracking-tighter">
                Withdraw via {withdrawMethod.toUpperCase()}
              </h3>
              <p className="text-[12px] text-hb-muted font-medium">
                Window: {APP_CONFIG.WALLET.WITHDRAWAL_START_HOUR} AM to{" "}
                {APP_CONFIG.WALLET.WITHDRAWAL_END_HOUR - 12} PM.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-hb-muted ml-1 uppercase tracking-tighter italic">
                  Amount to Withdraw (Min {APP_CONFIG.WALLET.MIN_WITHDRAWAL_ETB} ETB)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00 ETB"
                  className="w-full input-human shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-hb-muted ml-1 uppercase tracking-tighter italic">
                  Payout Mobile Number (Synced)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={user.phone || user.mobile || ""}
                    readOnly
                    className="w-full input-human opacity-70 bg-white/5 border-dashed cursor-not-allowed"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-hb-gold/10 px-2 py-1 rounded-md border border-hb-gold/20">
                    <i className="fas fa-lock text-hb-gold text-[10px]"></i>
                    <span className="text-[9px] font-black text-hb-gold uppercase tracking-widest">
                      Verified
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-hb-muted/60 mt-1 ml-1 uppercase font-bold tracking-widest italic">
                  Withdrawals are sent to your registered number only.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-hb-muted ml-1 uppercase tracking-tighter italic">
                  Account Name
                </label>
                <input
                  type="text"
                  value={user.username || ""}
                  readOnly
                  className="w-full input-human opacity-70 bg-white/5 border-dashed cursor-not-allowed"
                />
              </div>

              <button
                onClick={() => handleTransaction("withdraw")}
                disabled={!isWithdrawActive() || loading}
                className="w-full h-[54px] bg-hb-gold text-hb-blueblack font-bold rounded-xl text-[14px] uppercase shadow-lg active:scale-[0.98] disabled:opacity-40 transition-all mt-4 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-arrow-down-to-bracket"></i>
                )}
                {loading ? "Processing..." : `Withdraw to ${withdrawMethod}`}
              </button>


              {/* <div className="mt-4 p-4 bg-[#121212] rounded-2xl border border-hb-border/50 text-center space-y-2">
                <p className="text-[10px] text-hb-muted font-bold uppercase tracking-widest mb-2">
                  Withdrawal Requirements:
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-hb-gold/5 rounded-lg border border-hb-gold/10">
                    <i className="fas fa-gamepad text-hb-gold text-[10px]"></i>
                    <p className="text-[10px] text-hb-gold font-bold italic">
                      Must play 6+ games.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-hb-gold/5 rounded-lg border border-hb-gold/10">
                    <i className="fas fa-trophy text-hb-gold text-[10px]"></i>
                    <p className="text-[10px] text-hb-gold font-bold italic">
                      Must win 2+ games after deposit.
                    </p>
                  </div>
                </div>
              </div> */}

              {!isWithdrawActive() && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-[10px] text-red-500 font-bold text-center italic leading-tight">
                    Withdrawal window is closed. It operates from{" "}
                    {APP_CONFIG.WALLET.WITHDRAWAL_START_HOUR} AM to{" "}
                    {APP_CONFIG.WALLET.WITHDRAWAL_END_HOUR - 12} PM.
                  </p>
                </div>
              )}
            </div>

            {/* Withdrawal History Section */}
            {renderHistory(withdrawHistory, "Withdrawal")}
          </div>
        </div>
      )}

      {activeTab === "transfer" && (
        <div className="bg-hb-surface p-7 rounded-[24px] border border-hb-border shadow-sm space-y-6">
          <div className="text-center">
            <h3 className="font-bold text-white text-[18px] mb-1 italic">
              Send Money
            </h3>
            <p className="text-[12px] text-hb-muted font-medium">
              Move funds to another player's account (Min 100 ETB).
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-hb-muted ml-1">
                Recipient Username
              </label>
              <input
                type="text"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                placeholder="e.g. BingoKing"
                className="w-full input-human"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-hb-muted ml-1">
                Amount to Send
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00 ETB"
                className="w-full input-human"
              />
            </div>

            {transferValue > 0 && (
              <div className="bg-[#121212] p-4 rounded-xl border border-hb-border text-[12px] animate-in fade-in slide-in-from-top-1">
                <div className="flex justify-between mb-2">
                  <span className="text-hb-muted font-bold">
                    Transfer Amount
                  </span>
                  <span className="font-bold text-white">
                    {transferValue.toFixed(2)} ETB
                  </span>
                </div>
                <div className="flex justify-between mb-2 text-hb-gold">
                  <span className="font-bold">Fee (5%)</span>
                  <span className="font-bold">
                    +{transferFee.toFixed(2)} ETB
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-hb-border/50 font-black text-white text-[14px]">
                  <span>Total Deductible</span>
                  <span>{totalTransferDeduction.toFixed(2)} ETB</span>
                </div>
              </div>
            )}

            <button
              onClick={() => handleTransaction("transfer")}
              disabled={user.balance < totalTransferDeduction || loading}
              className="w-full h-[54px] bg-hb-gold text-hb-blueblack font-bold rounded-xl text-[14px] uppercase shadow-lg active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <i className="fas fa-spinner fa-spin"></i>}
              {user.balance < totalTransferDeduction
                ? "Insufficient Funds"
                : "Send Money"}
            </button>
          </div>

          {/* Transfer History Section */}
          {renderHistory(transferHistory, "Transfer")}
        </div>
      )}

      {activeTab === "bonus" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-hb-surface p-7 rounded-[24px] border border-hb-border shadow-sm mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-white font-black text-sm italic uppercase tracking-widest">
                Bonus History
              </h3>
              <p className="text-hb-muted text-[10px] font-bold">
                Earned from referrals & promos
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                  Total Earned
                </span>
              </div>
              <span className="text-xl font-black text-hb-gold italic">
                {bonusHistory
                  .reduce((acc, curr) => acc + (curr.amount || 0), 0)
                  .toLocaleString()}{" "}
                ETB
              </span>
            </div>
          </div>
          {renderHistory(bonusHistory, "Bonus")}
        </div>
      )}
    </div>
  );
};

export default WalletView;

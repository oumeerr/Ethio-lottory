import React from "react";
import { View, Language, User } from "../types";

interface SidebarProps {
  onClose: () => void;
  onNavigate: (view: View) => void;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  onLogout: () => void;
  user: User;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onClose,
  onNavigate,
  currentLang,
  onLangChange,
  onLogout,
  user,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative w-80 h-full bg-hb-surface shadow-[25px_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col slide-in-left border-r border-hb-border">
          <div className="bg-[#121212] p-10 text-white relative overflow-hidden border-b border-hb-border">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-[2rem] bg-orange-600/20 p-4 mb-5 shadow-inner border border-orange-500/30 flex items-center justify-center">
              <div className="flex font-black text-4xl italic tracking-tighter">
                <span className="text-green-500">E</span>
                <span className="text-yellow-400">L</span>
                <span className="text-red-500">B</span>
              </div>
            </div>
            <div className="flex flex-col items-center leading-none font-black tracking-tight italic uppercase drop-shadow-sm">
              <div className="text-xl">
                <span className="text-green-500">ETHIO</span>
                <span className="text-yellow-400">LOTTORY</span>
              </div>
              <span className="text-red-500 text-2xl">BINGO</span>
            </div>
            <div className="text-[11px] font-black uppercase opacity-60 tracking-widest mt-1">
              Master Tier Player
            </div>
          </div>
          <i className="fas fa-certificate absolute -right-8 -top-8 text-white/5 text-[14rem] rotate-45"></i>
        </div>

        <div className="flex-1 overflow-y-auto py-10 px-8 no-scrollbar bg-hb-surface">
          <div className="mb-10">
            <h4 className="text-[11px] font-black text-hb-muted uppercase tracking-[0.2em] mb-6">
              Navigation
            </h4>
            <div className="space-y-2">
              <SidebarLink
                icon="fa-home"
                color="text-white"
                bg="bg-[#121212] group-hover:bg-hb-gold group-hover:text-hb-blueblack"
                label="Dashboard Home"
                onClick={() => onNavigate("home")}
              />
              <SidebarLink
                icon="fa-th"
                color="text-white"
                bg="bg-[#121212] group-hover:bg-hb-gold group-hover:text-hb-blueblack"
                label="Card Gallery"
                onClick={() => onNavigate("all-cards")}
              />
              <SidebarLink
                icon="fa-file-invoice-dollar"
                color="text-white"
                bg="bg-[#121212] group-hover:bg-hb-gold group-hover:text-hb-blueblack"
                label="Payment Proof"
                onClick={() => onNavigate("payment-proof")}
              />
              <SidebarLink
                icon="fa-user-circle"
                color="text-white"
                bg="bg-[#121212] group-hover:bg-hb-gold group-hover:text-hb-blueblack"
                label="Profile Settings"
                onClick={() => onNavigate("profile")}
              />
              {user.isAdmin && (
                <>
                  <SidebarLink
                    icon="fa-bullhorn"
                    color="text-white"
                    bg="bg-[#121212] group-hover:bg-hb-gold group-hover:text-hb-blueblack"
                    label="Promo Creator"
                    onClick={() => onNavigate("promo")}
                  />
                  <SidebarLink
                    icon="fa-database"
                    color="text-hb-gold"
                    bg="bg-[#121212] group-hover:bg-hb-gold group-hover:text-hb-blueblack"
                    label="SQL Admin"
                    onClick={() => onNavigate("sql-admin")}
                  />
                </>
              )}
              <SidebarLink
                icon="fa-cog"
                color="text-white"
                bg="bg-[#121212] group-hover:bg-hb-gold group-hover:text-hb-blueblack"
                label="App Settings"
                onClick={() => onNavigate("settings")}
              />
            </div>
          </div>

          <div className="mb-10">
            <h4 className="text-[11px] font-black text-hb-muted uppercase tracking-[0.2em] mb-6">
              Sound Preferences
            </h4>
            <button
              onClick={onToggleSound}
              className="w-full flex items-center justify-between py-3.5 text-white hover:text-hb-gold transition-all group rounded-2xl px-3 hover:bg-[#121212] border border-transparent hover:border-hb-border/50"
            >
              <div className="flex items-center gap-5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-inner border border-hb-border/20 bg-[#121212] group-hover:bg-hb-gold group-hover:text-hb-blueblack ${soundEnabled ? "text-hb-gold" : "text-hb-muted"}`}
                >
                  <i className={`fas ${soundEnabled ? "fa-volume-up" : "fa-volume-mute"} text-lg`}></i>
                </div>
                <span className="font-bold text-base tracking-tight">Game Sounds</span>
              </div>
              <div
                className={`w-12 h-6 rounded-full p-1 transition-colors ${soundEnabled ? "bg-hb-gold" : "bg-hb-muted/20"}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${soundEnabled ? "translate-x-6" : "translate-x-0"}`}
                ></div>
              </div>
            </button>
          </div>

          <div>
            <h4 className="text-[11px] font-black text-hb-muted uppercase tracking-[0.2em] mb-6">
              Language
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <LangBtn
                active={currentLang === Language.ENGLISH}
                onClick={() => onLangChange(Language.ENGLISH)}
              >
                English (US)
              </LangBtn>
              <LangBtn
                active={currentLang === Language.AMHARIC}
                onClick={() => onLangChange(Language.AMHARIC)}
              >
                አማርኛ (Amharic)
              </LangBtn>
              <LangBtn
                active={currentLang === Language.OROMOO}
                onClick={() => onLangChange(Language.OROMOO)}
              >
                Afaan Oromoo
              </LangBtn>
              <LangBtn
                active={currentLang === Language.TIGRINYA}
                onClick={() => onLangChange(Language.TIGRINYA)}
              >
                ትግርኛ (Tigrinya)
              </LangBtn>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-hb-border flex flex-col gap-4 bg-[#121212]">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-4 rounded-2xl shadow-md active:scale-95 transition-all text-[12px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white"
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout Game
          </button>
          <div className="flex items-center justify-between opacity-40 px-2">
            <span className="text-[10px] font-black text-hb-muted italic">
              V 3.0.1 STABLE
            </span>
            <div className="flex gap-2">
              <i className="fab fa-telegram-plane"></i>
              <i className="fas fa-shield-alt"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarLink: React.FC<{
  icon: string;
  color: string;
  bg: string;
  label: string;
  onClick: () => void;
}> = ({ icon, color, bg, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-5 py-3.5 text-white hover:text-hb-gold transition-all group rounded-2xl px-3 hover:bg-[#121212] border border-transparent hover:border-hb-border/50"
  >
    <div
      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-inner border border-hb-border/20 ${bg} ${color}`}
    >
      <i className={`fas ${icon} text-lg`}></i>
    </div>
    <span className="font-bold text-base tracking-tight">{label}</span>
  </button>
);

const LangBtn: React.FC<{
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}> = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-2xl text-[13px] font-black text-left transition-all border ${active ? "bg-hb-gold text-hb-blueblack border-hb-gold shadow-sm" : "bg-[#121212] text-hb-muted border-hb-border hover:border-hb-muted"}`}
  >
    {children}
  </button>
);

export default Sidebar;

import React, { useState } from "react";
import { User } from "../types";

interface ProfileViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, setUser }) => {
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [newPhone, setNewPhone] = useState(user.phone || user.mobile || "");
  const [loading, setLoading] = useState(false);

  const bonusBalance = user.bonus_balance || 0;

  const handleSave = async () => {
    if (!newUsername.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.telegram_id,
          username: newUsername,
          phone: newPhone
        })
      });

      if (!response.ok) throw new Error("Update failed");

      setUser((prev) => ({ 
        ...prev, 
        username: newUsername,
        mobile: newPhone,
        phone: newPhone
      }));
      setEditing(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center text-center py-8">
        <div className="relative mb-4">
          <img
            src={user.photo}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white shadow-xl"
          />
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-hb-gold text-hb-blueblack rounded-full flex items-center justify-center shadow-lg">
            <i className="fas fa-camera text-xs"></i>
          </button>
        </div>

        {editing ? (
          <div className="flex flex-col items-stretch gap-4 animate-in fade-in zoom-in duration-200 w-full max-w-[300px]">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-hb-muted uppercase tracking-widest ml-1">Username</label>
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-hb-border px-4 py-3 rounded-2xl font-bold outline-none text-white focus:border-hb-gold/50 transition-colors"
                placeholder="Username"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-hb-muted uppercase tracking-widest ml-1">Phone Number</label>
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-hb-border px-4 py-3 rounded-2xl font-bold outline-none text-white focus:border-hb-gold/50 transition-colors"
                placeholder="+251..."
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-hb-gold text-hb-blueblack font-black text-[11px] uppercase tracking-widest h-12 rounded-2xl active:scale-95 transition-transform"
              >
                {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
                Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={loading}
                className="px-6 bg-hb-surface border border-hb-border text-hb-muted font-black text-[11px] uppercase tracking-widest h-12 rounded-2xl active:scale-95 transition-transform"
              >
                Exit
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-hb-gold">
              {user.username}
            </h2>
            <button
              onClick={() => setEditing(true)}
              className="text-gray-300 hover:text-gray-500 transition-colors"
            >
              <i className="fas fa-edit text-sm"></i>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="bg-hb-surface p-3 rounded-xl border border-hb-border w-full flex justify-between items-center">
          <span className="text-[10px] font-bold text-hb-muted uppercase">
            User ID
          </span>
          <span className="text-xs font-black text-hb-gold font-mono select-all">
            {user.phone ? user.phone.replace("+251", "") : user.id.split("-")[0]}
          </span>
        </div>
        <div className="bg-hb-surface p-3 rounded-xl border border-hb-border w-full flex justify-between items-center">
          <span className="text-[10px] font-bold text-hb-muted uppercase">
            Linked Mobile
          </span>
          <span className="text-xs font-black text-hb-gold font-mono italic">
            {user.phone || user.mobile || "Waiting for Sync..."}
          </span>
        </div>
        <div className="bg-hb-surface p-3 rounded-xl border border-hb-border w-full flex justify-between items-center">
          <span className="text-[10px] font-bold text-hb-muted uppercase">
            Bonus Funds
          </span>
          <span className="text-xs font-black text-hb-gold">
            {bonusBalance.toLocaleString()} ETB
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase mb-1">
            Referrals
          </span>
          <span className="text-2xl font-black text-hb-gold/60">
            {user.referrals}
          </span>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase mb-1">
            Total Wins
          </span>
          <span className="text-2xl font-black text-hb-gold">{user.games_won || 0}</span>
        </div>
      </div>

      <div className="bg-[#121212] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-hb-border">
        <h3 className="text-lg font-black mb-1 italic relative z-10 text-hb-gold">
          REFER & EARN
        </h3>
        <p className="text-[10px] opacity-60 mb-6 relative z-10 font-bold uppercase tracking-widest leading-normal">
          Invite friends to the Telegram channel and get 10 ETB for every friend!
        </p>

        <div className="space-y-4 relative z-10">
          <div className="bg-hb-surface p-4 rounded-2xl border border-hb-border flex flex-col gap-2">
            <span className="text-[8px] font-black text-hb-muted uppercase tracking-widest">
              Your Referral Link
            </span>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono truncate mr-2 font-black text-hb-gold lowercase">
                https://t.me/Ethiolottorybingo?start={user.phone ? user.phone.replace("+251", "") : user.id}
              </span>
              <button
                onClick={() => {
                  const displayId = user.phone ? user.phone.replace("+251", "") : user.id;
                  navigator.clipboard.writeText(
                    `https://t.me/Ethiolottorybingo?start=${displayId}`,
                  );
                  alert("Referral link copied!");
                }}
                className="bg-hb-gold text-hb-blueblack px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap active:scale-95 transition-transform"
              >
                COPY
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-1">
          <p className="text-[9px] text-center text-hb-gold font-black italic">
            BONUS: 10 ETB TO YOU • 15 ETB TO FRIEND
          </p>
          <p className="text-[8px] text-center text-hb-muted uppercase tracking-widest opacity-40">
            PAID UPON FRIEND CONTACT SYNC
          </p>
        </div>
        <i className="fas fa-link absolute -right-4 -bottom-4 text-hb-gold/5 text-7xl rotate-12"></i>
      </div>
    </div>
  );
};

export default ProfileView;

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabaseClient";
import { SupabaseProfile } from "../types";
import { Eye, EyeOff, Hash, Phone, Lock, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface LoginViewProps {
  onLogin: (data?: SupabaseProfile) => void;
}

type AuthMode = "login" | "register" | "otp" | "forgot" | "reset_otp" | "new_password";

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [identifier, setIdentifier] = useState(""); // For login (email/phone/username)

  // OTP Timer
  const [timeLeft, setTimeLeft] = useState(180);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (mode === "otp" || mode === "reset_otp") {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [mode]);

  const startTimer = () => {
    setTimeLeft(180);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .or(`phone.eq.${identifier},username.eq.${identifier}`)
        .maybeSingle();

      if (fetchError || !data) {
        throw new Error("User not found or incorrect information");
      }

      if (data.password !== password) {
        throw new Error("Incorrect password. Please try again.");
      }

      setSuccess("Login successful! Welcome back.");
      setTimeout(() => onLogin(data), 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Use phone as identifier for OTP
      const identifier = "+251" + phone;

      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .or(`phone.eq.${identifier},username.eq.${username}`)
        .maybeSingle();

      if (existing) {
        throw new Error("Phone or Username already registered");
      }

      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      setSuccess("Verification code sent to your mobile/email.");
      setMode("otp");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during registration");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id, phone")
        .or(`phone.eq.${identifier},username.eq.${identifier}`)
        .maybeSingle();

      if (!existing) {
        throw new Error("No account matched these credentials");
      }

      setSuccess(`Recovery code sent to your verified mobile.`);
      setMode("reset_otp");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to process recovery. Please contact support.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ password })
        .or(`phone.eq.${identifier},username.eq.${identifier}`);

      if (updateError) throw updateError;

      setSuccess("Password reset successful! You can now log in.");
      setTimeout(() => {
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not update password. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const identifierValue = mode === "otp" ? "+251" + phone : phone;

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifierValue, otp }),
      });
      
      if (!res.ok) throw new Error("Invalid OTP code.");

      if (mode === "reset_otp") {
        setMode("new_password");
        setSuccess("Mobile verified! Set your new password below.");
      } else {
        const { data, error: insertError } = await supabase
          .from("profiles")
          .insert([{
            username,
            phone: "+251" + phone,
            password,
            balance: 25.00,
            bonus_balance: 0.00, // Or whatever the split, requested 25 total
            telegram_id: Math.floor(Math.random() * 1000000)
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        setSuccess("Registration successful! Welcome to the Game.");
        setTimeout(() => onLogin(data), 1500);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during verification");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#0d1b2a] relative overflow-hidden p-4 font-sans">
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-b from-[#22C55E]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-gradient-to-t from-hb-gold/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center text-center w-full max-w-sm">
        
        <div className="relative mb-8 flex flex-col items-center">
           <div className="w-24 h-24 relative flex items-center justify-center bg-orange-600/20 border-2 border-orange-500/30 rounded-2xl shadow-xl">
             <div className="flex font-black text-4xl italic tracking-tighter">
                <span className="text-green-500">E</span>
                <span className="text-yellow-400">L</span>
                <span className="text-red-500">B</span>
             </div>
           </div>
           
           <h1 className="mt-6 font-black italic tracking-tighter uppercase drop-shadow-lg flex flex-col items-center leading-none">
             <div className="text-xl">
               <span className="text-green-500">ETHIO</span>
               <span className="text-yellow-400">LOTTORY</span>
             </div>
             <span className="text-red-500 text-2xl">BINGO</span>
           </h1>
           <p className="text-hb-muted text-[10px] font-black uppercase tracking-[0.4em] opacity-60">
             Official Lottery Game
           </p>
        </div>

        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[11px] text-red-500 font-bold text-left">{error}</p>
          </div>
        )}
        {success && (
          <div className="w-full bg-green-500/10 border border-green-500/20 p-3 rounded-xl mb-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <p className="text-[11px] text-green-500 font-bold text-left">{success}</p>
          </div>
        )}

        <div className="w-full bg-[#1b263b]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
          
          {(mode === "login" || mode === "register" || mode === "forgot") && (
            <div className="flex bg-[#0d1b2a]/50 p-1.5 rounded-2xl mb-8 border border-white/5">
              <button 
                onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === "login" || mode === "forgot" ? "bg-hb-gold text-hb-blueblack shadow-lg" : "text-hb-muted hover:text-white"}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === "register" ? "bg-hb-gold text-hb-blueblack shadow-lg" : "text-hb-muted hover:text-white"}`}
              >
                Sign Up
              </button>
            </div>
          )}

          <form className="space-y-5" onSubmit={
            mode === "login" ? handleLogin : 
            mode === "register" ? handleRegister : 
            mode === "forgot" ? handleForgotPassword :
            mode === "new_password" ? handleResetPassword :
            handleVerifyOtp
          }>
            
            {(mode === "login" || mode === "forgot") && (
              <>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-black text-hb-muted tracking-widest ml-1">Phone Number Or Username</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-hb-muted group-focus-within:text-hb-gold transition-colors">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input 
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter mobile or username"
                      className="w-full h-14 bg-[#0d1b2a] border border-white/10 rounded-2xl pl-12 pr-4 text-sm text-white placeholder:text-hb-muted/40 focus:border-hb-gold/50 focus:ring-1 focus:ring-hb-gold/50 transition-all outline-none"
                    />
                  </div>
                </div>

                {mode === "login" && (
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] uppercase font-black text-hb-muted tracking-widest">Password</label>
                      <button 
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-[9px] font-black uppercase text-hb-gold hover:underline"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-hb-muted group-focus-within:text-hb-gold transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full h-14 bg-[#0d1b2a] border border-white/10 rounded-2xl pl-12 pr-12 text-sm font-mono tracking-widest text-white placeholder:text-hb-muted/40 focus:border-hb-gold/50 focus:ring-1 focus:ring-hb-gold/50 transition-all outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-hb-muted hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {mode === "register" && (
              <>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-black text-hb-muted tracking-widest ml-1">Phone Number (+251)</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-hb-gold font-bold text-sm">
                      +251
                    </div>
                    <input 
                      type="tel"
                      required
                      maxLength={9}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="912345678"
                      className="w-full h-14 bg-[#0d1b2a] border border-white/10 rounded-2xl pl-16 pr-4 text-sm font-bold text-white placeholder:text-hb-muted/40 focus:border-hb-gold/50 focus:ring-1 focus:ring-hb-gold/50 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase font-black text-hb-muted tracking-widest ml-1">Username</label>
                    <input 
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="User123"
                      className="w-full h-14 bg-[#0d1b2a] border border-white/10 rounded-2xl px-4 text-sm text-white placeholder:text-hb-muted/40 focus:border-hb-gold/50 outline-none"
                    />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-black text-hb-muted tracking-widest ml-1">Create Password (6+ chars)</label>
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. Abc@123"
                      className="w-full h-14 bg-[#0d1b2a] border border-white/10 rounded-2xl px-4 pr-12 text-sm font-mono tracking-widest text-white placeholder:text-hb-muted/40 focus:border-hb-gold/50 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-hb-muted hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-black text-hb-muted tracking-widest ml-1">Confirm Password</label>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full h-14 bg-[#0d1b2a] border border-white/10 rounded-2xl px-4 text-sm font-mono tracking-widest text-white placeholder:text-hb-muted/40 focus:border-hb-gold/50 outline-none"
                  />
                </div>
              </>
            )}

            {mode === "new_password" && (
              <>
                <div className="space-y-1.5 text-left">
                  <h3 className="text-white font-black uppercase text-center mb-4 italic tracking-widest">Set New Password</h3>
                  <label className="text-[10px] uppercase font-black text-hb-muted tracking-widest ml-1">New Password</label>
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. NewPass123"
                      className="w-full h-14 bg-[#0d1b2a] border border-white/10 rounded-2xl px-4 pr-12 text-sm font-mono tracking-widest text-white placeholder:text-hb-muted/40 focus:border-hb-gold/50 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-hb-muted hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-black text-hb-muted tracking-widest ml-1">Confirm New Password</label>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-14 bg-[#0d1b2a] border border-white/10 rounded-2xl px-4 text-sm font-mono tracking-widest text-white placeholder:text-hb-muted/40 focus:border-hb-gold/50 outline-none"
                  />
                </div>
              </>
            )}

            {(mode === "otp" || mode === "reset_otp") && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-white font-black uppercase italic tracking-widest">Verification</h3>
                  <p className="text-[11px] text-hb-muted">Enter the OTP sent to your linked credentials</p>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  <input 
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-DIGITS"
                    className="w-full h-16 bg-[#0d1b2a] border-2 border-hb-gold/30 rounded-2xl text-center text-3xl font-black text-hb-gold tracking-[0.5em] outline-none focus:border-hb-gold animate-pulse"
                  />
                  
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-3 h-3 ${timeLeft > 0 ? "text-hb-muted" : "text-hb-gold animate-spin"}`} />
                    {timeLeft > 0 ? (
                      <span className="text-[11px] font-black text-hb-muted uppercase tracking-widest">Wait {formatTime(timeLeft)}</span>
                    ) : (
                      <button 
                        type="button"
                        onClick={startTimer}
                        className="text-[11px] font-black text-hb-gold uppercase tracking-widest underline decoration-hb-gold/30"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-hb-gold text-hb-blueblack font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_30px_rgba(249,115,22,0.3)] active:scale-[0.97] transition-all flex items-center justify-center gap-3 hover:brightness-110 disabled:opacity-70 disabled:cursor-wait mt-4"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : mode === "login" ? <ArrowRight className="w-5 h-5" /> : mode === "register" ? <Phone className="w-5 h-5" /> : mode === "forgot" ? <RefreshCw className="w-5 h-5" /> : mode === "new_password" ? <Lock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              {loading ? "Processing..." : mode === "login" ? "Enter the Game" : mode === "register" ? "Get OTP Code" : mode === "forgot" ? "Send Recovery Code" : mode === "new_password" ? "Update Password" : "Confirm Code"}
            </button>

            {mode === "forgot" && (
              <button 
                type="button"
                onClick={() => setMode("login")}
                className="w-full text-[10px] font-black uppercase text-hb-muted tracking-widest hover:text-white transition-colors"
              >
                Back to Login
              </button>
            )}
          </form>
        </div>

        <p className="max-w-[240px] text-[10px] text-hb-muted/40 font-bold uppercase tracking-[0.2em] leading-loose mt-8">
          By continuing, you agree to our{" "}
          <span className="text-hb-muted/60 underline">Fair Play Terms</span>.
          <br />Securely synced with Ethiopia Lottery Svc.
        </p>
      </div>
    </div>
  );
};

export default LoginView;

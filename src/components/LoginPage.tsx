import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, Loader2, Shield, AlertCircle, ArrowRight, GraduationCap } from 'lucide-react';

type AuthMode = 'choose' | 'admin' | 'login' | 'register';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
}

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode,        setMode]        = useState<AuthMode>('choose');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [name,        setName]        = useState('');
  const [role,        setRole]        = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const clearError = () => setError('');

  // ── Super Admin login ──────────────────────────────────────────────────────
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); clearError();
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Xatolik yuz berdi"); return; }
      localStorage.setItem('auth_token', data.token);
      onLoginSuccess(data.token, data.user);
    } catch { setError("Server bilan aloqa yo'q"); }
    finally { setLoading(false); }
  };

  // ── Oddiy login ────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); clearError();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Xatolik yuz berdi"); return; }
      localStorage.setItem('auth_token', data.token);
      onLoginSuccess(data.token, data.user);
    } catch { setError("Server bilan aloqa yo'q"); }
    finally { setLoading(false); }
  };

  // ── Ro'yxatdan o'tish ──────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Ism kiritilishi shart"); return; }
    if (password.length < 8) { setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak"); return; }
    setLoading(true); clearError();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Xatolik yuz berdi"); return; }
      localStorage.setItem('auth_token', data.token);
      onLoginSuccess(data.token, data.user);
    } catch { setError("Server bilan aloqa yo'q"); }
    finally { setLoading(false); }
  };

  // ── Google OAuth (demo) ────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true); clearError();
    try {
      // Demo: haqiqiy loyihada Google One Tap yoki OAuth popup ishlatiladi
      // Bu yerda demo foydalanuvchi yaratamiz
      const demoGoogleUser = {
        googleId: 'google-demo-' + Date.now(),
        email: 'demo.google.' + Date.now() + '@gmail.com',
        name: "Google Foydalanuvchi",
        avatar: "https://lh3.googleusercontent.com/a/demo",
      };
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoGoogleUser),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Google login xatosi"); return; }
      localStorage.setItem('auth_token', data.token);
      onLoginSuccess(data.token, data.user);
    } catch { setError("Google login amalga oshmadi"); }
    finally { setLoading(false); }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">

      {/* Dekorativ doiralar */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-3">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">EduPlatform</h1>
          <p className="text-xs text-slate-400 mt-0.5">Talabalar Bilimini Baholash Tizimi</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

          {/* ── CHOOSE ─────────────────────────────────────────────────── */}
          {mode === 'choose' && (
            <div className="p-6 space-y-3">
              <h2 className="text-base font-bold text-white text-center mb-4">Kirish turini tanlang</h2>

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-all shadow-md disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                Google orqali kirish
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-slate-500">yoki</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Email login */}
              <button
                onClick={() => setMode('login')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md"
              >
                <GraduationCap className="w-4 h-4" /> Email bilan kirish
              </button>

              {/* Register */}
              <button
                onClick={() => setMode('register')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/8 hover:bg-white/12 text-slate-300 text-sm font-medium border border-white/10 transition-all"
              >
                Yangi akkaunt ochish
              </button>

              {/* Admin */}
              <div className="pt-1">
                <button
                  onClick={() => setMode('admin')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/20 transition-all"
                >
                  <Shield className="w-3.5 h-3.5" /> Super Admin kirish
                </button>
              </div>
            </div>
          )}

          {/* ── ADMIN LOGIN ─────────────────────────────────────────── */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <button type="button" onClick={() => { setMode('choose'); clearError(); }} className="text-slate-400 hover:text-white text-lg leading-none">←</button>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" /> Super Admin
                  </h2>
                  <p className="text-[11px] text-slate-500">.env fayli orqali sozlangan</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5 text-xs text-amber-300 flex gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                Bu sahifa faqat tizim administratori uchun. Parol .env faylida saqlanadi.
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-xs text-red-400 flex gap-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {error}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Admin Email</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="admin@eduplatform.uz" required
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Parol</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required
                      className="w-full px-3 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? 'Tekshirilmoqda...' : 'Admin sifatida kirish'}
              </button>
            </form>
          )}

          {/* ── EMAIL LOGIN ─────────────────────────────────────────── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <button type="button" onClick={() => { setMode('choose'); clearError(); }} className="text-slate-400 hover:text-white text-lg leading-none">←</button>
                <div>
                  <h2 className="text-sm font-bold text-white">Kirish</h2>
                  <p className="text-[11px] text-slate-500">Email va parol orqali</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-xs text-red-400 flex gap-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {error}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com" required
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Parol</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required
                      className="w-full px-3 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/20"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Kirilmoqda...' : 'Kirish'}
              </button>

              {/* Google */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-slate-500">yoki</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <button type="button" onClick={handleGoogleLogin} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all shadow-sm disabled:opacity-60"
              >
                <GoogleIcon /> Google orqali kirish
              </button>

              <p className="text-center text-xs text-slate-500">
                Akkaunt yo'qmi?{' '}
                <button type="button" onClick={() => { setMode('register'); clearError(); }} className="text-indigo-400 font-semibold hover:text-indigo-300">
                  Ro'yxatdan o'ting
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER ────────────────────────────────────────────── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="p-6 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <button type="button" onClick={() => { setMode('choose'); clearError(); }} className="text-slate-400 hover:text-white text-lg leading-none">←</button>
                <div>
                  <h2 className="text-sm font-bold text-white">Ro'yxatdan o'tish</h2>
                  <p className="text-[11px] text-slate-500">Yangi akkaunt yaratish</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-xs text-red-400 flex gap-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">To'liq ism</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Alisher Toshmatov" required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com" required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Parol (kamida 8 ta belgi)</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={8}
                    className="w-full px-3 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/20"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Rol tanlash */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['STUDENT', 'TEACHER'] as const).map(r => (
                    <button
                      key={r} type="button" onClick={() => setRole(r)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${role === r ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                    >
                      {r === 'STUDENT' ? '🎓 Talaba' : '👨‍🏫 O\'qituvchi'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? "Ro'yxatdan o'tilmoqda..." : "Akkaunt yaratish"}
              </button>

              <p className="text-center text-xs text-slate-500">
                Akkaunt bormi?{' '}
                <button type="button" onClick={() => { setMode('login'); clearError(); }} className="text-indigo-400 font-semibold hover:text-indigo-300">
                  Kirish
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-4">
          © 2025 EduPlatform &bull; O'zbekiston Oliy Ta'lim Tizimi
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

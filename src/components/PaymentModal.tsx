import React, { useState, useEffect, useCallback } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, XCircle, Loader2, ExternalLink, Smartphone, ArrowRight, RefreshCw } from 'lucide-react';
import { paymentApi } from '../services/api';

// ── Types ──────────────────────────────────────────────────────────────────────
type Provider = 'Click' | 'Payme' | 'Uzum' | 'Stripe';
type Mode     = 'redirect' | 'inline';
type Status   = 'idle' | 'creating' | 'waiting' | 'success' | 'failed';

interface PaymentModalProps {
  /** To'lov maqsadi */
  type: 'SUBSCRIPTION' | 'ARTICLE';
  /** UZS da summa */
  amount: number;
  /** Foydalanuvchi ID */
  userId: string;
  /** Maqola buyurtmasi ID (faqat ARTICLE uchun) */
  orderId?: string;
  /** To'lov tavsifi */
  description: string;
  /** JWT token */
  token?: string;
  /** Modalni yopish */
  onClose: () => void;
  /** Muvaffaqiyatli to'lov */
  onSuccess: () => void;
}

// ── Provider configs ───────────────────────────────────────────────────────────
const PROVIDERS: { id: Provider; label: string; color: string; bg: string; border: string; logo: string; supportInline: boolean; description: string }[] = [
  {
    id: 'Click',
    label: 'Click',
    color: '#1C8EF9',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    logo: 'C',
    supportInline: true,
    description: "O'zbek milliy to'lov tizimi",
  },
  {
    id: 'Payme',
    label: 'Payme',
    color: '#00AAFF',
    bg: '#F0FBFF',
    border: '#BAE6FD',
    logo: 'P',
    supportInline: true,
    description: "Paycom tizimi orqali to'lov",
  },
  {
    id: 'Uzum',
    label: 'Uzum',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    logo: 'U',
    supportInline: false,
    description: 'Uzum Bank — tez va qulay',
  },
  {
    id: 'Stripe',
    label: 'Stripe',
    color: '#635BFF',
    bg: '#F5F5FF',
    border: '#C7D2FE',
    logo: 'S',
    supportInline: true,
    description: "Xalqaro karta bilan to'lov",
  },
];

// ── Inline karta formasi (Stripe / Click / Payme uchun) ───────────────────────
interface InlineFormProps {
  provider: Provider;
  amount: number;
  inlineData?: { merchantId: string; amount: number; currency: string; orderId: string; description: string };
  inlineToken?: string;
  onPay: (cardData: { number: string; expiry: string; cvc: string; name: string }) => void;
  loading: boolean;
}

const InlineCardForm: React.FC<InlineFormProps> = ({ provider, amount, onPay, loading }) => {
  const [num,    setNum]    = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc,    setCvc]    = useState('');
  const [name,   setName]   = useState('');

  const formatNum = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    onPay({ number: num.replace(/\s/g, ''), expiry, cvc, name });
  };

  const prov = PROVIDERS.find(p => p.id === provider)!;

  return (
    <div className="space-y-3">
      {/* Card preview */}
      <div
        className="rounded-2xl p-5 text-white relative overflow-hidden shadow-lg"
        style={{ background: `linear-gradient(135deg, ${prov.color} 0%, ${prov.color}99 100%)` }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="text-xs font-semibold opacity-80 uppercase tracking-widest">{provider} Karta</div>
          <CreditCard className="w-6 h-6 opacity-70" />
        </div>
        <div className="font-mono text-base tracking-widest mb-3 opacity-90">
          {num || '•••• •••• •••• ••••'}
        </div>
        <div className="flex justify-between text-xs opacity-70">
          <span>{name || 'KARTA EGASI'}</span>
          <span>{expiry || 'MM/YY'}</span>
        </div>
      </div>

      {/* Inputs */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Karta raqami</label>
        <input
          value={num}
          onChange={e => setNum(formatNum(e.target.value))}
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Muddati</label>
          <input
            value={expiry}
            onChange={e => setExpiry(formatExp(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">CVC / CVV</label>
          <input
            value={cvc}
            onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="•••"
            maxLength={3}
            type="password"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Karta egasining ismi</label>
        <input
          value={name}
          onChange={e => setName(e.target.value.toUpperCase())}
          placeholder="ALISHER TOSHMATOV"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm uppercase focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !num || !expiry || !cvc}
        className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md"
        style={{ background: loading ? '#94a3b8' : prov.color }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
        {loading ? "To'lanmoqda..." : `${amount.toLocaleString()} UZS to'lash`}
      </button>

      <p className="text-center text-[11px] text-slate-400">
        🔒 256-bit SSL shifrlash &bull; Ma'lumotlaringiz xavfsiz
      </p>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// MAIN MODAL
// ════════════════════════════════════════════════════════════════════════════════
export const PaymentModal: React.FC<PaymentModalProps> = ({
  type, amount, userId, orderId, description, token, onClose, onSuccess,
}) => {
  const [provider,   setProvider]   = useState<Provider>('Click');
  const [mode,       setMode]       = useState<Mode>('redirect');
  const [status,     setStatus]     = useState<Status>('idle');
  const [paymentId,  setPaymentId]  = useState<string>('');
  const [inlineData, setInlineData] = useState<any>(null);
  const [inlineTok,  setInlineTok]  = useState<string>('');
  const [errMsg,     setErrMsg]     = useState('');
  const [pollCount,  setPollCount]  = useState(0);

  const prov = PROVIDERS.find(p => p.id === provider)!;

  // Mode: Uzum faqat redirect
  useEffect(() => {
    if (provider === 'Uzum') setMode('redirect');
  }, [provider]);

  // Redirect to'lovdan qaytganda URL ni tekshirish
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid    = params.get('id');
    const result = params.get('payment');
    if (result === 'success' && pid) {
      setPaymentId(pid);
      setStatus('success');
    } else if (result === 'failed' && pid) {
      setErrMsg("To'lov amalga oshmadi yoki bekor qilindi.");
      setStatus('failed');
    }
  }, []);

  // Polling (redirect dan qaytgandan keyin yoki inline uchun)
  useEffect(() => {
    if (status !== 'waiting' || !paymentId) return;
    const interval = setInterval(async () => {
      try {
        const s = await paymentApi.getStatus(paymentId, token);
        setPollCount(c => c + 1);
        if (s.status === 'SUCCESS') {
          setStatus('success');
          clearInterval(interval);
        } else if (s.status === 'FAILED' || s.status === 'CANCELLED') {
          setErrMsg("To'lov amalga oshmadi.");
          setStatus('failed');
          clearInterval(interval);
        }
      } catch {}
    }, 2500);
    return () => clearInterval(interval);
  }, [status, paymentId, token]);

  // Redirect to'lovni boshlash
  const handleRedirect = useCallback(async () => {
    setStatus('creating');
    setErrMsg('');
    try {
      const data = await paymentApi.create({ type, userId, amount, provider, mode: 'redirect', orderId, description, token, returnUrl: window.location.href.split('?')[0] });
      setPaymentId(data.paymentId);
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (e: any) {
      setErrMsg(e.message || "Xatolik yuz berdi");
      setStatus('failed');
    }
  }, [type, userId, amount, provider, orderId, description, token]);

  // Inline to'lov formini ochish
  const handleOpenInline = useCallback(async () => {
    setStatus('creating');
    setErrMsg('');
    try {
      const data = await paymentApi.create({ type, userId, amount, provider, mode: 'inline', orderId, description, token });
      setPaymentId(data.paymentId);
      setInlineData(data.inlineData);
      setInlineTok(data.inlineToken || '');
      setStatus('idle');
    } catch (e: any) {
      setErrMsg(e.message || "Xatolik yuz berdi");
      setStatus('failed');
    }
  }, [type, userId, amount, provider, orderId, description, token]);

  // Inline karta ma'lumotlari bilan to'lash (demo: muvaffaqiyatli deb hisoblaymiz)
  const handleInlinePay = useCallback(async (_cardData: any) => {
    if (!paymentId) return;
    setStatus('waiting');
    // Demo: 2 soniyadan keyin demo-success ga so'rov yuboramiz
    await new Promise(r => setTimeout(r, 1500));
    try {
      await fetch('/api/payments/demo-success/' + paymentId);
      setStatus('success');
    } catch {
      setStatus('waiting');
    }
  }, [paymentId]);

  const reset = () => { setStatus('idle'); setPaymentId(''); setInlineData(null); setErrMsg(''); };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">To'lov</h2>
              <p className="text-[11px] text-slate-500">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-indigo-700">{amount.toLocaleString()} UZS</span>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* SUCCESS */}
          {status === 'success' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900">To'lov muvaffaqiyatli!</h3>
              <p className="text-xs text-slate-500">
                {type === 'SUBSCRIPTION' ? 'Obunangiz faollashtirildi.' : "Maqola buyurtmangiz qabul qilindi."}
              </p>
              <button
                onClick={() => { onSuccess(); onClose(); }}
                className="mt-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
              >
                Davom etish
              </button>
            </div>
          )}

          {/* FAILED */}
          {status === 'failed' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900">To'lov amalga oshmadi</h3>
              {errMsg && <p className="text-xs text-red-600">{errMsg}</p>}
              <button onClick={reset} className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 mx-auto">
                <RefreshCw className="w-3.5 h-3.5" /> Qayta urinish
              </button>
            </div>
          )}

          {/* WAITING / POLLING */}
          {status === 'waiting' && (
            <div className="text-center py-8 space-y-3">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">To'lov tekshirilmoqda...</p>
              <p className="text-xs text-slate-400">Iltimos, kuting. ({pollCount * 2}s)</p>
            </div>
          )}

          {/* CREATING */}
          {status === 'creating' && (
            <div className="text-center py-8 space-y-3">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-600">To'lov sessiyasi yaratilmoqda...</p>
            </div>
          )}

          {/* IDLE — Provider tanlash + to'lov */}
          {status === 'idle' && (
            <>
              {/* Provider tanlash */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  To'lov tizimini tanlang
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROVIDERS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setProvider(p.id); setInlineData(null); }}
                      className="p-3 rounded-xl border-2 text-left transition-all cursor-pointer"
                      style={{
                        borderColor:     provider === p.id ? p.color      : '#E2E8F0',
                        backgroundColor: provider === p.id ? p.bg         : '#FAFAFA',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-sm"
                          style={{ background: p.color }}
                        >
                          {p.logo}
                        </div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: provider === p.id ? p.color : '#374151' }}
                        >
                          {p.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Uzum faqat redirect */}
              {provider !== 'Uzum' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    To'lov usuli
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['redirect', 'inline'] as Mode[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { setMode(m); setInlineData(null); }}
                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${mode === m ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {m === 'redirect' ? <ExternalLink className="w-3.5 h-3.5 text-indigo-600" /> : <Smartphone className="w-3.5 h-3.5 text-indigo-600" />}
                          <span className={`text-xs font-bold ${mode === m ? 'text-indigo-700' : 'text-slate-600'}`}>
                            {m === 'redirect' ? 'Redirect' : 'Inline (Karta)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {m === 'redirect' ? "To'lov sahifasiga o'tish" : "Karta ma'lumotlarini shu yerda kiriting"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inline karta formasi */}
              {mode === 'inline' && inlineData && (
                <InlineCardForm
                  provider={provider}
                  amount={amount}
                  inlineData={inlineData}
                  inlineToken={inlineTok}
                  onPay={handleInlinePay}
                  loading={status === 'waiting'}
                />
              )}

              {/* Action tugmalar */}
              {!(mode === 'inline' && inlineData) && (
                <button
                  type="button"
                  onClick={mode === 'redirect' ? handleRedirect : handleOpenInline}
                  className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                  style={{ background: prov.color }}
                >
                  {mode === 'redirect'
                    ? <><ExternalLink className="w-4 h-4" /> {prov.label} orqali to'lash <ArrowRight className="w-4 h-4 ml-1" /></>
                    : <><Smartphone className="w-4 h-4" /> Karta ma'lumotlarini kiriting <ArrowRight className="w-4 h-4 ml-1" /></>
                  }
                </button>
              )}

              <p className="text-center text-[10px] text-slate-400">
                🔒 To'lovlar xavfsiz shifrlangan &bull; Hech qanday ma'lumot saqlanmaydi
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

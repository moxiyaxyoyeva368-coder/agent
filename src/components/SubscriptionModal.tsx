import React, { useState, useCallback } from 'react';
import {
  X, Calendar, CheckCircle2, Sparkles, BookOpen, Award, ShieldCheck
} from 'lucide-react';
import { Subscription, User, AdminSettings } from '../types';
import { PaymentModal } from './PaymentModal';

interface SubscriptionModalProps {
  currentUser: User;
  currentSubscription?: Subscription;
  settings: AdminSettings;
  onClose: () => void;
  onPurchase: (paymentMethod: string) => Promise<void>;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  currentUser,
  currentSubscription,
  settings,
  onClose,
  onPurchase,
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [isSuccess,   setIsSuccess]   = useState(false);

  const price = settings.subscriptionPrice6Months || 250000;
  const token = localStorage.getItem('auth_token') || undefined;

  const handlePaySuccess = useCallback(async () => {
    // Server tarafda to'lov allaqachon tasdiqlangan — App.tsx ni refresh qilamiz
    try { await onPurchase('PaymentModal'); } catch {}
    setIsSuccess(true);
    setShowPayment(false);
  }, [onPurchase]);

  // ── Success ekrani ────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Obuna faollashtirildi!</h3>
          <p className="text-xs text-slate-500">
            6 oy davomida barcha fanlar, ma'ruzalar va testlardan to'liq foydalanishingiz mumkin.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            Kabinetga qaytish
          </button>
        </div>
      </div>
    );
  }

  // ── PaymentModal ──────────────────────────────────────────────────────────
  if (showPayment) {
    return (
      <PaymentModal
        type="SUBSCRIPTION"
        amount={price}
        userId={currentUser.id}
        description="6 oylik ta'lim obunasi"
        token={token}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaySuccess}
      />
    );
  }

  // ── Asosiy modal ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">6 Oylik Ta'lim Obunasi</h2>
              <p className="text-xs text-slate-500">Platformaga to'liq kirish huquqi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Aktiv obuna bor bo'lsa */}
          {currentSubscription?.status === 'ACTIVE' && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-800">Obunangiz faol</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  Amal qilish muddati: {new Date(currentSubscription.endDate).toLocaleDateString('uz-Latn')}
                </p>
              </div>
            </div>
          )}

          {/* Plan card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg">
            <div className="flex items-center justify-between text-xs text-indigo-200 mb-3">
              <span className="font-semibold uppercase tracking-wider">Talaba ta'rif rejasi</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/40 text-[10px] font-mono">6 OY</span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black text-white">{price.toLocaleString()}</span>
              <span className="text-xs text-indigo-200">UZS</span>
            </div>
            <ul className="space-y-2 text-xs text-indigo-100 border-t border-indigo-700/60 pt-3">
              {[
                "Barcha fanlar va cheksiz mavzularga kirish",
                "PDF va Word ma'ruza materiallarini yuklab olish",
                "Rasmiy testlar va avtomatik baholash",
                "Guruhlararo reyting va statistika",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Afzalliklar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: <BookOpen className="w-5 h-5 text-indigo-500" />, label: "6+ fan" },
              { icon: <Award className="w-5 h-5 text-amber-500" />,    label: "Sertifikat" },
              { icon: <Sparkles className="w-5 h-5 text-purple-500" />, label: "AI yordam" },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                {item.icon}
                <span className="text-[11px] font-semibold text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>

          {/* To'lov tugmasi */}
          <button
            onClick={() => setShowPayment(true)}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            {price.toLocaleString()} UZS — To'lash
          </button>

          <p className="text-center text-[11px] text-slate-400">
            Click, Payme, Uzum, Stripe qabul qilinadi &bull; 🔒 Xavfsiz to'lov
          </p>
        </div>
      </div>
    </div>
  );
};

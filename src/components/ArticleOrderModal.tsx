import React, { useState } from 'react';
import {
  X,
  FileText,
  CreditCard,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Clock,
  Globe,
  Layers,
  ShieldCheck,
  Send
} from 'lucide-react';
import { ArticleType, ArticleOrder, User, AdminSettings } from '../types';

interface ArticleOrderModalProps {
  currentUser: User;
  settings: AdminSettings;
  onClose: () => void;
  onSuccessOrder: (order: Partial<ArticleOrder>) => Promise<void>;
}

export const ArticleOrderModal: React.FC<ArticleOrderModalProps> = ({
  currentUser,
  settings,
  onClose,
  onSuccessOrder
}) => {
  const [step, setStep] = useState<'FORM' | 'PAYMENT' | 'CONFIRMATION'>('FORM');
  const [title, setTitle] = useState('');
  const [articleType, setArticleType] = useState<ArticleType>('OAK');
  const [volumePages, setVolumePages] = useState('5-8 bet');
  const [language, setLanguage] = useState<"O'zbek" | "Rus" | "Ingliz">("O'zbek");
  const [subjectArea, setSubjectArea] = useState('Ijtimoiy-gumanitar fanlar');
  const [requirements, setRequirements] = useState(
    'OAK standartlariga muvofiq, IMRAD formati, kamida 12 ta zamonaviy ilmiy adabiyot havolasi, antiplagiat darajasi 85%+ bo‘lishi lozim.'
  );
  const [deadline, setDeadline] = useState('7 kun');
  const [notes, setNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'Click' | 'Payme' | 'Uzum' | 'Karta'>('Click');
  const [cardNumber, setCardNumber] = useState('8600 1492 8841 9021');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<ArticleOrder | null>(null);

  // Calculate dynamic pricing
  const calculatePrice = () => {
    let base = settings.articleBasePriceOAK;
    if (articleType === 'SCOPUS_WOS') base = settings.articleBasePriceScopus;
    else if (articleType === 'RESPUBLIKA_KONFERENSIYA') base = settings.articleBasePriceConference;
    else if (articleType === 'XALQARO_KONFERENSIYA') base = 300000;
    else if (articleType === 'TEZIS') base = settings.articleBasePriceThesis;

    // Language multiplier
    if (language === 'Ingliz') base += 100000;
    else if (language === 'Rus') base += 50000;

    // Volume multiplier
    if (volumePages === '8-12 bet') base += 80000;
    else if (volumePages === '15+ bet') base += 150000;

    // Urgency multiplier
    if (deadline === '3 kun') base += 100000;

    return base;
  };

  const calculatedAmount = calculatePrice();

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Iltimos, maqola mavzusi va nomini kiriting!");
      return;
    }
    setStep('PAYMENT');
  };

  const handleFinalPaymentAndSubmit = async () => {
    setIsProcessing(true);
    try {
      const orderPayload: Partial<ArticleOrder> = {
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        studentPhone: currentUser.phone || '+998 90 000-00-00',
        title,
        articleType,
        volumePages,
        language,
        subjectArea,
        requirements,
        deadline,
        notes,
        amount: calculatedAmount,
        paymentStatus: 'PAID',
        paymentMethod,
        status: 'NEW_ORDER'
      };

      await onSuccessOrder(orderPayload);
      setStep('CONFIRMATION');
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Ilmiy Maqola Yozdirish Xizmati
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                  Mustaqil Xizmat
                </span>
              </div>
              <p className="text-xs text-slate-500">
                OAK, Scopus/WoS, Respublika anjumanlari uchun professional mualliflik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 'FORM' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              1
            </span>
            <span className={step === 'FORM' ? 'font-semibold text-slate-900' : 'text-slate-500'}>
              Maqola talablari
            </span>
          </div>
          <div className="w-10 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 'PAYMENT' ? 'bg-amber-600 text-white' : step === 'CONFIRMATION' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </span>
            <span className={step === 'PAYMENT' ? 'font-semibold text-slate-900' : 'text-slate-500'}>
              Alohida to‘lov
            </span>
          </div>
          <div className="w-10 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 'CONFIRMATION' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              3
            </span>
            <span className={step === 'CONFIRMATION' ? 'font-semibold text-slate-900' : 'text-slate-500'}>
              Tasdiqlandi
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 'FORM' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p leading-relaxed>
                  <strong>Eslatma:</strong> Maqola xizmati 6 oylik platforma obunasidan alohida xizmat bo‘lib, to‘lov to‘g‘ridan-to‘g‘ri ilmiy ekspert va o‘qituvchilar kabinetiga yangi buyurtma sifatida tushadi.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Maqola mavzusi (Nomi) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Ibn Xaldunning ijtimoiy-falsafiy qarashlari..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Type and Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Maqola turi
                  </label>
                  <select
                    value={articleType}
                    onChange={e => setArticleType(e.target.value as ArticleType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="OAK">OAK Jurnali (Respublika OAK)</option>
                    <option value="SCOPUS_WOS">Scopus / Web of Science (Xalqaro)</option>
                    <option value="RESPUBLIKA_KONFERENSIYA">Respublika ilmiy anjumani</option>
                    <option value="XALQARO_KONFERENSIYA">Xalqaro ilmiy konferensiya</option>
                    <option value="TEZIS">Ilmiy tezis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kerakli hajm (Bet)
                  </label>
                  <select
                    value={volumePages}
                    onChange={e => setVolumePages(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="3-5 bet">3 - 5 bet (Standart konferensiya/tezis)</option>
                    <option value="5-8 bet">5 - 8 bet (Standart OAK)</option>
                    <option value="8-12 bet">8 - 12 bet (Kengaytirilgan OAK)</option>
                    <option value="15+ bet">15+ bet (Scopus / Monografiya bobi)</option>
                  </select>
                </div>
              </div>

              {/* Language and Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Maqola tili
                  </label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="O'zbek">O‘zbek tili</option>
                    <option value="Rus">Rus tili</option>
                    <option value="Ingliz">Ingliz tili (Akademik)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tayyorlash muddati
                  </label>
                  <select
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="7 kun">7 kun (Standart)</option>
                    <option value="5 kun">5 kun</option>
                    <option value="3 kun">3 kun (Tezkor / Shoshilinch)</option>
                    <option value="15 kun">15 kun</option>
                  </select>
                </div>
              </div>

              {/* Direction & Requirements */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Yo‘nalish / Fan sohasi
                </label>
                <input
                  type="text"
                  value={subjectArea}
                  onChange={e => setSubjectArea(e.target.value)}
                  placeholder="Masalan: Falsafa, Pedagogika, Axborot texnologiyalari..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Maxsus talablar (IMRAD, manbalar soni, antiplagiat)
                </label>
                <textarea
                  rows={2}
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  placeholder="Talablaringizni batafsil yozing..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dynamic Price Summary Box */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Xizmat narxi:</span>
                  <div className="text-xl font-bold font-mono text-amber-400">
                    {calculatedAmount.toLocaleString()} UZS
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  To‘lovga o‘tish →
                </button>
              </div>
            </form>
          )}

          {step === 'PAYMENT' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                  Buyurtma tafsiloti:
                </div>
                <div className="font-bold text-sm text-slate-900">"{title}"</div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">{articleType}</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">{volumePages}</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">{language}</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Muddat: {deadline}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">To‘lov summasi:</span>
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {calculatedAmount.toLocaleString()} UZS
                  </span>
                </div>
              </div>

              {/* Payment methods selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  To‘lov tizimini tanlang:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['Click', 'Payme', 'Uzum', 'Karta'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        paymentMethod === method
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mock card input fields */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Karta raqami (Uzcard / Humo / Visa)
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Amal qilish muddati
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      To‘lovchi
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.name}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-100 text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  ← Talablarni o‘zgartirish
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleFinalPaymentAndSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isProcessing ? 'To‘lanmoqda...' : `${calculatedAmount.toLocaleString()} UZS To‘lash va Buyurtma berish`}</span>
                </button>
              </div>
            </div>
          )}

          {step === 'CONFIRMATION' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                To‘lov muvaffaqiyatli amalga oshirildi!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Buyurtmangiz tizimda ro‘yxatga olindi va biriktirilgan ilmiy muallif/o‘qituvchi kabinetiga bildirishnoma bilan yuborildi.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 max-w-md mx-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mavzu:</span>
                  <strong className="truncate max-w-[240px]">{title}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Holati:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    Yangi buyurtma (To‘langan)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Muddati:</span>
                  <span>{deadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">To‘lov usuli:</span>
                  <span>{paymentMethod}</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Tushunarli, kabinetga o‘tish
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

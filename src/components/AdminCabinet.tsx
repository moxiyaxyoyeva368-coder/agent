import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  CreditCard,
  Plus,
  Trash2,
  Edit,
  Sliders,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Search,
  Award
} from 'lucide-react';
import {
  Subject,
  Topic,
  Group,
  User,
  ArticleOrder,
  PaymentTransaction,
  Subscription,
  AdminSettings
} from '../types';

interface AdminCabinetProps {
  currentUser: User;
  subjects: Subject[];
  topics: Topic[];
  groups: Group[];
  users: User[];
  articles: ArticleOrder[];
  subscriptions: Subscription[];
  payments: PaymentTransaction[];
  settings: AdminSettings;
  stats: {
    totalUsers: number;
    activeUsers: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    totalSubjects: number;
    totalTopics: number;
    totalTests: number;
    totalArticleOrders: number;
    completedArticles: number;
    pendingArticles: number;
    todayRevenue: number;
    monthlyRevenue: number;
    subscriptionRevenue: number; // Spec 26 requirement
    articleRevenue: number;      // Spec 26 requirement
    totalRevenue: number;
  };
  onCreateSubject: (subjectData: Partial<Subject>) => Promise<void>;
  onUpdateSubject: (id: string, subjectData: Partial<Subject>) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  onUpdateSettings: (newSettings: Partial<AdminSettings>) => Promise<void>;
  onCreateUser: (userData: Partial<User>) => Promise<void>;
}

export const AdminCabinet: React.FC<AdminCabinetProps> = ({
  currentUser,
  subjects = [],
  topics = [],
  groups = [],
  users = [],
  articles = [],
  subscriptions = [],
  payments = [],
  settings = {
    defaultPassingScore: 60,
    subscriptionPrice6Months: 250000,
    articleBasePriceOAK: 350000,
    articleBasePriceScopus: 1800000,
    articleBasePriceConference: 200000
  },
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    totalSubjects: 0,
    totalTopics: 0,
    totalTests: 0,
    totalArticleOrders: 0,
    completedArticles: 0,
    pendingArticles: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    subscriptionRevenue: 0,
    articleRevenue: 0,
    totalRevenue: 0
  },
  onCreateSubject,
  onUpdateSubject,
  onDeleteSubject,
  onUpdateSettings,
  onCreateUser
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SUBJECTS' | 'FINANCE' | 'USERS' | 'SETTINGS'>('DASHBOARD');

  const safeSubjects = subjects || [];
  const safeTopics = topics || [];
  const safeGroups = groups || [];
  const safeUsers = users || [];
  const safeArticles = articles || [];
  const safeSubscriptions = subscriptions || [];
  const safePayments = payments || [];

  // Subject modal state
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubj, setEditingSubj] = useState<Subject | null>(null);
  const [subjName, setSubjName] = useState('');
  const [subjCode, setSubjCode] = useState('');
  const [subjCategory, setSubjCategory] = useState('');
  const [subjDesc, setSubjDesc] = useState('');

  // Settings form state
  const [passScore, setPassScore] = useState(settings.defaultPassingScore || 60);
  const [subPrice, setSubPrice] = useState(settings.subscriptionPrice6Months || 250000);
  const [oakPrice, setOakPrice] = useState(settings.articleBasePriceOAK || 350000);
  const [scopusPrice, setScopusPrice] = useState(settings.articleBasePriceScopus || 1800000);
  const [confPrice, setConfPrice] = useState(settings.articleBasePriceConference || 200000);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Financial filter
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'SUBSCRIPTION' | 'ARTICLE'>('ALL');

  // New Subject
  const handleOpenNewSubject = () => {
    setEditingSubj(null);
    setSubjName('');
    setSubjCode(`FAN-${Math.floor(100 + Math.random() * 900)}`);
    setSubjCategory('Ijtimoiy-gumanitar fanlar');
    setSubjDesc('');
    setShowSubjectModal(true);
  };

  const handleEditSubject = (s: Subject) => {
    setEditingSubj(s);
    setSubjName(s.name);
    setSubjCode(s.code);
    setSubjCategory(s.category);
    setSubjDesc(s.description);
    setShowSubjectModal(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim()) return;

    if (editingSubj) {
      await onUpdateSubject(editingSubj.id, {
        name: subjName,
        code: subjCode,
        category: subjCategory,
        description: subjDesc
      });
    } else {
      await onCreateSubject({
        name: subjName,
        code: subjCode,
        category: subjCategory,
        description: subjDesc,
        teacherName: 'Kafedra o‘qituvchisi'
      });
    }
    setShowSubjectModal(false);
  };

  const handleSaveGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await onUpdateSettings({
        defaultPassingScore: Number(passScore),
        subscriptionPrice6Months: Number(subPrice),
        articleBasePriceOAK: Number(oakPrice),
        articleBasePriceScopus: Number(scopusPrice),
        articleBasePriceConference: Number(confPrice)
      });
      alert("Tizim sozlamalari muvaffaqiyatli yangilandi!");
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Export financial ledger to CSV
  const handleExportFinanceCSV = () => {
    const headers = ['ID', 'Turi', 'Foydalanuvchi', 'Summa (UZS)', 'Holati', 'To\'lov tizimi', 'Sana', 'Izoh'];
    const rows = payments.map(p => [
      p.id,
      p.type === 'SUBSCRIPTION' ? 'Obuna to\'lovi' : 'Maqola to\'lovi',
      `"${p.userName}"`,
      p.amount,
      p.status,
      p.paymentMethod,
      new Date(p.createdAt).toLocaleDateString(),
      `"${p.description}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `moliya_hisoboti_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayments = safePayments.filter(p => {
    if (paymentFilter === 'ALL') return true;
    return p.type === paymentFilter;
  });

  return (
    <div className="space-y-6">
      {/* Admin Title Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Super Administrator Paneli</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Platformaning To‘liq Boshqaruv Markazi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fanlar, mavzular, testlar, obunalar, maqola buyurtmalari va moliyaviy hisobotlar
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin can add new subject without developer as explicitly demanded in Spec Section 4 & 36 */}
          <button
            onClick={handleOpenNewSubject}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi fan qo‘shish</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'DASHBOARD'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Umumiy Statistika (KPI)
        </button>

        <button
          onClick={() => setActiveTab('SUBJECTS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'SUBJECTS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Fanlar Boshqaruvi ({subjects.length})
        </button>

        <button
          onClick={() => setActiveTab('FINANCE')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'FINANCE'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          To‘lovlar va Moliya (Obuna vs Maqola)
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'USERS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Foydalanuvchilar ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'SETTINGS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tizim Sozlamalari (O‘tish bali va Narxlar)
        </button>
      </div>

      {/* TAB 1: ADMIN DASHBOARD (SPEC SECTION 27) */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* SEPARATE REVENUE CARDS (MANDATED BY SPEC 26 & 27) */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Moliyaviy ko‘rsatkichlar (Alohida hisoblanadi)
              </h3>
              <span className="text-[11px] text-slate-400">UZS valyutasida</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                  <span>Jami Daromad</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black font-mono text-slate-900 mt-2">
                  {stats.totalRevenue.toLocaleString()} UZS
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Bugungi tushum: <strong>{stats.todayRevenue.toLocaleString()} UZS</strong>
                </p>
              </div>

              {/* SPEC MANDATE: OBUNADAN DAROMAD ALOHIDA */}
              <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-xs bg-indigo-50/20">
                <div className="flex items-center justify-between text-indigo-700 text-xs font-bold uppercase">
                  <span>Obunadan Daromad</span>
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black font-mono text-indigo-900 mt-2">
                  {stats.subscriptionRevenue.toLocaleString()} UZS
                </div>
                <p className="text-[11px] text-indigo-600 mt-1">
                  Faol 6 oylik obunalar: <strong>{stats.activeSubscriptions} ta</strong>
                </p>
              </div>

              {/* SPEC MANDATE: MAQOLADAN DAROMAD ALOHIDA */}
              <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
                <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase">
                  <span>Maqoladan Daromad</span>
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black font-mono text-amber-900 mt-2">
                  {stats.articleRevenue.toLocaleString()} UZS
                </div>
                <p className="text-[11px] text-amber-700 mt-1">
                  Jami buyurtmalar: <strong>{stats.totalArticleOrders} ta</strong>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                  <span>Oylik Daromad</span>
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-black font-mono text-purple-900 mt-2">
                  {stats.monthlyRevenue.toLocaleString()} UZS
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Ushbu oy hisobi</p>
              </div>
            </div>
          </div>

          {/* Academic & User KPIs */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
              Ta’lim va tizim faolligi
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Jami Foydalanuvchilar</div>
                <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{stats.totalUsers}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Faol Talabalar</div>
                <div className="text-xl font-bold text-emerald-600 mt-1 font-mono">{stats.activeUsers}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Jami Fanlar</div>
                <div className="text-xl font-bold text-indigo-600 mt-1 font-mono">{stats.totalSubjects}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Jami Mavzular</div>
                <div className="text-xl font-bold text-indigo-600 mt-1 font-mono">{stats.totalTopics}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Jami Savollar</div>
                <div className="text-xl font-bold text-indigo-600 mt-1 font-mono">{stats.totalTests}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Bajarilgan Maqolalar</div>
                <div className="text-xl font-bold text-amber-600 mt-1 font-mono">{stats.completedArticles}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FANLAR BOSHQARUVI (SPEC SECTION 4) */}
      {activeTab === 'SUBJECTS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Barcha Fanlar Ro‘yxati</h3>
              <p className="text-xs text-slate-500">Administrator dasturchisiz yangi fan qo‘sha oladi</p>
            </div>
            <button
              onClick={handleOpenNewSubject}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yangi fan qo‘shish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeSubjects.map(s => {
              const subjTopics = safeTopics.filter(t => t.subjectId === s.id);

              return (
                <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-mono font-bold">
                        {s.code}
                      </span>
                      <span className="text-xs text-slate-400">{s.category}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditSubject(s)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`"${s.name}" fanini va uning mavzularini o‘chirishni tasdiqlaysizmi?`)) {
                            onDeleteSubject(s.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900">{s.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Mavzular soni: <strong>{subjTopics.length} ta</strong></span>
                    <span>O‘qituvchi: <strong>{s.teacherName || 'Biriktirilmagan'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TO'LOVLAR VA MOLIYA (SPEC SECTION 26) */}
      {activeTab === 'FINANCE' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Filtr:</span>
              <button
                onClick={() => setPaymentFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  paymentFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Barchasi ({payments.length})
              </button>
              <button
                onClick={() => setPaymentFilter('SUBSCRIPTION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  paymentFilter === 'SUBSCRIPTION' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Faqat Obuna ({payments.filter(p => p.type === 'SUBSCRIPTION').length})
              </button>
              <button
                onClick={() => setPaymentFilter('ARTICLE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  paymentFilter === 'ARTICLE' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Faqat Maqola ({payments.filter(p => p.type === 'ARTICLE').length})
              </button>
            </div>

            <button
              onClick={handleExportFinanceCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Hisobotni Excel (CSV) qilish</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Tranzaksiya ID</th>
                  <th className="py-3 px-4">Turi</th>
                  <th className="py-3 px-4">Talaba (Foydalanuvchi)</th>
                  <th className="py-3 px-4">Summa</th>
                  <th className="py-3 px-4">To‘lov tizimi</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500">{pay.referenceId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        pay.type === 'SUBSCRIPTION'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {pay.type === 'SUBSCRIPTION' ? '6 Oylik Obuna' : 'Maqola Buyurtmasi'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{pay.userName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {pay.amount.toLocaleString()} UZS
                    </td>
                    <td className="py-3 px-4 text-slate-600">{pay.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Muvaffaqiyatli
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(pay.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase">
                Barcha Foydalanuvchilar Ro‘yxati
              </span>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <th className="py-2.5 px-4">Foydalanuvchi</th>
                  <th className="py-2.5 px-4">Roli</th>
                  <th className="py-2.5 px-4">Telefon / Email</th>
                  <th className="py-2.5 px-4">OTM / Muassasa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.specialty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'AUTHOR' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role === 'ADMIN' ? 'Super Admin' :
                         u.role === 'TEACHER' ? 'O‘qituvchi' :
                         u.role === 'AUTHOR' ? 'Maqola muallifi' : 'Talaba'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{u.email}</div>
                      <div className="text-[11px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.institution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: TIZIM SOZLAMALARI (SPEC SECTION 11 & 36) */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Platforma Global Sozlamalari
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Davlat ta’lim standarti bo‘yicha o‘tish ballari va xizmat narxlarini boshqarish
            </p>
          </div>

          <form onSubmit={handleSaveGlobalSettings} className="space-y-4 text-xs">
            {/* Spec 11: O'tish bali parametr bo'lishi kerak */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
              <label className="block font-bold text-purple-950 uppercase text-[11px]">
                Umumiy standart test o‘tish bali (%) *
              </label>
              <p className="text-[11px] text-purple-800">
                Ushbu foizdan past ball olgan talabalarga "O‘TMADI", teng yoki yuqori olganlarga "O‘TDI" belgilanadi.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={passScore}
                  onChange={e => setPassScore(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-xl border border-purple-300 font-mono font-black text-sm bg-white"
                />
                <span className="font-bold text-purple-900">% (Hozirgi standart: 60%)</span>
              </div>
            </div>

            {/* Spec 17: 6 oylik obuna narxi */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                6 Oylik Ta’lim Obunasi Narxi (UZS)
              </label>
              <input
                type="number"
                value={subPrice}
                onChange={e => setSubPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm"
              />
            </div>

            {/* Article base prices */}
            <div className="border-t border-slate-200 pt-3 space-y-3">
              <h4 className="font-bold text-slate-800 uppercase text-[11px]">
                Ilmiy Maqola Xizmatlari Bazaviy Narxlari:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">OAK Jurnali (UZS)</label>
                  <input
                    type="number"
                    value={oakPrice}
                    onChange={e => setOakPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Scopus / Web of Science (UZS)</label>
                  <input
                    type="number"
                    value={scopusPrice}
                    onChange={e => setScopusPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Respublika Anjumani (UZS)</label>
                  <input
                    type="number"
                    value={confPrice}
                    onChange={e => setConfPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 cursor-pointer disabled:opacity-50"
              >
                {isSavingSettings ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NEW SUBJECT MODAL (SPEC 4 & 36) */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              {editingSubj ? 'Fanni tahrirlash' : '+ Yangi fan qo‘shish'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Administrator dasturchi yordamisiz yangi fanni yaratishi va unga mavzular biriktirishi mumkin.
            </p>

            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Fan nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Falsafa, Dinshunoslik, Tarix..."
                  value={subjName}
                  onChange={e => setSubjName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Fan kodi</label>
                  <input
                    type="text"
                    value={subjCode}
                    onChange={e => setSubjCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kategoriya</label>
                  <input
                    type="text"
                    value={subjCategory}
                    onChange={e => setSubjCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Fan tavsifi</label>
                <textarea
                  rows={3}
                  value={subjDesc}
                  onChange={e => setSubjDesc(e.target.value)}
                  placeholder="Fanning asosiy maqsadi va vazifalari..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  {editingSubj ? 'Saqlash' : 'Fanni yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

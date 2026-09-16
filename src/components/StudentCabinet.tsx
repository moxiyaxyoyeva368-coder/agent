import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  Download,
  Lock,
  ChevronRight,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import {
  Subject,
  Topic,
  TestAttempt,
  Subscription,
  ArticleOrder,
  User
} from '../types';

interface StudentCabinetProps {
  currentUser: User;
  subjects: Subject[];
  topics: Topic[];
  attempts: TestAttempt[];
  activeSubscription?: Subscription;
  articles: ArticleOrder[];
  onSelectTopic: (topic: Topic) => void;
  onOpenTest: (topic: Topic) => void;
  onOpenSubscription: () => void;
  onOpenArticleOrder: () => void;
}

export const StudentCabinet: React.FC<StudentCabinetProps> = ({
  currentUser,
  subjects = [],
  topics = [],
  attempts = [],
  activeSubscription,
  articles = [],
  onSelectTopic,
  onOpenTest,
  onOpenSubscription,
  onOpenArticleOrder
}) => {
  const [activeTab, setActiveTab] = useState<'SUBJECTS' | 'ARTICLES' | 'SUMMARY'>('SUBJECTS');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');

  const safeSubjects = subjects || [];
  const safeTopics = topics || [];
  const safeAttempts = attempts || [];
  const safeArticles = articles || [];

  // Subscription calculation
  const getSubscriptionDetails = () => {
    if (!activeSubscription || activeSubscription.status !== 'ACTIVE') {
      return { isExpired: true, daysLeft: 0, endDate: null };
    }
    const end = new Date(activeSubscription.endDate).getTime();
    const now = new Date().getTime();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return {
      isExpired: days <= 0,
      daysLeft: Math.max(0, days),
      endDate: new Date(activeSubscription.endDate).toLocaleDateString()
    };
  };

  const subDetails = getSubscriptionDetails();

  // Selected subject & its topics
  const activeSubject = safeSubjects.find(s => s.id === selectedSubjectId) || safeSubjects[0];
  const subjectTopics = safeTopics
    .filter(t => t.subjectId === activeSubject?.id)
    .sort((a, b) => a.topicNumber - b.topicNumber);

  // Subject performance calculation (Spec Section 13)
  const calculateSubjectStats = (subjId: string) => {
    const sTopics = safeTopics.filter(t => t.subjectId === subjId);
    const sAttempts = safeAttempts.filter(a => a.studentId === currentUser.id && a.subjectId === subjId);

    const completed = sAttempts.length;
    const passed = sAttempts.filter(a => a.status === 'PASSED').length;
    const totalScore = sAttempts.reduce((acc, a) => acc + a.scorePercentage, 0);
    const average = completed > 0 ? Math.round(totalScore / completed) : 0;

    return { totalTopics: sTopics.length, completed, passed, average };
  };

  const currentStats = activeSubject ? calculateSubjectStats(activeSubject.id) : { totalTopics: 0, completed: 0, passed: 0, average: 0 };

  // Overall student statistics
  const userAttempts = safeAttempts.filter(a => a.studentId === currentUser.id);
  const totalUserPassed = userAttempts.filter(a => a.status === 'PASSED').length;
  const overallAverage = userAttempts.length > 0
    ? Math.round(userAttempts.reduce((acc, a) => acc + a.scorePercentage, 0) / userAttempts.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* 6-Month Subscription Card & Status Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        subDetails.isExpired
          ? 'bg-rose-50 border-rose-200 text-rose-950 shadow-xs'
          : 'bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-lg'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              subDetails.isExpired ? 'bg-rose-200 text-rose-800' : 'bg-indigo-500/30 text-indigo-300'
            }`}>
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  {subDetails.isExpired ? 'Obunangiz muddati tugagan' : '6 Oylik Ta’lim Obunasi'}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  subDetails.isExpired
                    ? 'bg-rose-200 text-rose-900'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {subDetails.isExpired ? 'Nofaol' : 'FAOL'}
                </span>
              </div>

              {subDetails.isExpired ? (
                <p className="text-xs text-rose-700 mt-1 max-w-xl">
                  Platformadan foydalanishni davom ettirish va testlarni topshirish uchun 6 oylik obunani uzaytiring.
                </p>
              ) : (
                <p className="text-xs text-indigo-200 mt-1 flex flex-wrap items-center gap-3">
                  <span>Amal qilish muddati: <strong>{subDetails.endDate}</strong> gacha</span>
                  <span>•</span>
                  <span>Qolgan kunlar: <strong>{subDetails.daysLeft} kun</strong></span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSubscription}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                subDetails.isExpired
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-white hover:bg-slate-100 text-slate-900'
              }`}
            >
              {subDetails.isExpired ? 'Obunani yangilash (250,000 UZS)' : 'Obunani uzaytirish'}
            </button>
            <button
              onClick={onOpenArticleOrder}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Maqola yozdirish
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('SUBJECTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'SUBJECTS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Mening fanlarim</span>
        </button>

        <button
          onClick={() => setActiveTab('ARTICLES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'ARTICLES'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mening ilmiy maqolalarim</span>
          {safeArticles.filter(a => a.studentId === currentUser.id).length > 0 && (
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
              {safeArticles.filter(a => a.studentId === currentUser.id).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('SUMMARY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'SUMMARY'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Umumiy o‘zlashtirishim</span>
        </button>
      </div>

      {/* TAB 1: MENING FANLARIM (SPEC SECTION 12 & 13) */}
      {activeTab === 'SUBJECTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Subjects List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              O‘quv fanlari ro‘yxati
            </h3>

            <div className="space-y-2">
              {safeSubjects.map(subj => {
                const isSelected = subj.id === activeSubject?.id;
                const stats = calculateSubjectStats(subj.id);

                return (
                  <button
                    key={subj.id}
                    onClick={() => setSelectedSubjectId(subj.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-indigo-600 ring-2 ring-indigo-50 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-bold text-indigo-700 font-mono">
                        {subj.code}
                      </div>
                      {stats.completed > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          O‘rtacha: {stats.average}%
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mt-1 leading-snug">
                      {subj.name}
                    </h4>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{subj.teacherName}</span>
                      <span>{stats.completed} / {stats.totalTopics} topshirilgan</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{
                          width: stats.totalTopics > 0 ? `${(stats.completed / stats.totalTopics) * 100}%` : '0%'
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Subject Details & Topics */}
          <div className="lg:col-span-8 space-y-4">
            {activeSubject ? (
              <>
                {/* Subject Overview Card with Average Calculation */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-semibold text-indigo-600">{activeSubject.category}</span>
                      <h2 className="text-lg font-bold text-slate-900">{activeSubject.name}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">O‘qituvchi: {activeSubject.teacherName}</p>
                    </div>

                    {/* Auto-calculated overall average score for this subject (Spec 13) */}
                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-indigo-800">
                          Fan bo‘yicha umumiy o‘rtacha:
                        </div>
                        <div className="text-2xl font-black font-mono text-indigo-900">
                          {currentStats.average}%
                        </div>
                      </div>
                      <Award className="w-7 h-7 text-indigo-600 shrink-0" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {activeSubject.description}
                  </p>
                </div>

                {/* Topics List for this Subject (Spec 12 & 13) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Mavzular va Testlar ({subjectTopics.length} ta mavzu)
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Har bir test faqat bir marta topshiriladi
                    </span>
                  </div>

                  {subjectTopics.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                      Ushbu fanga hali mavzular kiritilmagan.
                    </div>
                  ) : (
                    subjectTopics.map(topic => {
                      const attempt = attempts.find(
                        a => a.studentId === currentUser.id && a.topicId === topic.id
                      );
                      const isCompleted = !!attempt;
                      const isPassed = attempt?.status === 'PASSED';

                      return (
                        <div
                          key={topic.id}
                          className={`p-4 rounded-2xl border transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isCompleted
                              ? isPassed
                                ? 'border-emerald-200/80 bg-emerald-50/20'
                                : 'border-rose-200/80 bg-rose-50/20'
                              : 'border-slate-200 hover:border-indigo-200'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                              isCompleted
                                ? isPassed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {topic.topicNumber}
                            </div>

                            <div>
                              <h4 className="font-bold text-sm text-slate-900 leading-snug">
                                {topic.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                {topic.description}
                              </p>

                              {/* Status Display as specified in Section 12:
                                  1. Mavzu — Bajarilmagan
                                  2. Mavzu — 85% — O‘tdi
                                  3. Mavzu — 60% — O‘tdi
                                  4. Mavzu — 55% — O‘tmadi */}
                              <div className="mt-2 flex items-center gap-2">
                                {isCompleted ? (
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    isPassed
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {isPassed ? (
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    ) : (
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                    )}
                                    <span>{attempt.scorePercentage}% — {isPassed ? 'O‘tdi' : 'O‘tmadi'}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    Bajarilmagan
                                  </span>
                                )}

                                <span className="text-[11px] text-slate-400">
                                  O‘tish: {topic.passingScore}% • {topic.questions.length} savol
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Read Lecture Button */}
                            <button
                              onClick={() => onSelectTopic(topic)}
                              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Ma’ruza matni</span>
                            </button>

                            {/* Test Button or Locked State */}
                            {isCompleted ? (
                              <button
                                onClick={() => onSelectTopic(topic)}
                                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium cursor-pointer hover:bg-slate-50"
                                title="Ushbu test topshirilgan. Qayta topshirish imkoniyati mavjud emas."
                              >
                                🔒 Topshirilgan
                              </button>
                            ) : subDetails.isExpired ? (
                              <button
                                onClick={onOpenSubscription}
                                className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Lock className="w-3 h-3" />
                                Obuna kerak
                              </button>
                            ) : (
                              <button
                                onClick={() => onOpenTest(topic)}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <span>Test topshirish</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 2: MENING MAQOLA BUYURTMALARIM (SECTIONS 20, 21, 22, 23, 25) */}
      {activeTab === 'ARTICLES' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Mening Ilmiy Maqola Buyurtmalarim
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                OAK, Scopus va anjuman maqolalari tayyorlanish jarayoni va tayyor fayllarni yuklab olish
              </p>
            </div>
            <button
              onClick={onOpenArticleOrder}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
            >
              + Yangi maqola buyurtma qilish
            </button>
          </div>

          <div className="space-y-3">
            {safeArticles.filter(a => a.studentId === currentUser.id).length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Sizda hali maqola buyurtmalari yo‘q</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  OAK, Scopus jurnallari yoki ilmiy anjumanlar uchun maqola kerak bo‘lsa, buyurtma bering.
                </p>
                <button
                  onClick={onOpenArticleOrder}
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Maqola buyurtma qilish
                </button>
              </div>
            ) : (
              safeArticles
                .filter(a => a.studentId === currentUser.id)
                .map(art => {
                  const isReady = art.status === 'READY' || art.status === 'COMPLETED' || art.status === 'SENT_TO_USER';

                  return (
                    <div
                      key={art.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                            №{art.orderNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                            {art.articleType}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(art.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isReady
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {art.status === 'NEW_ORDER' ? 'Yangi buyurtma' :
                             art.status === 'ACCEPTED' ? 'Qabul qilindi' :
                             art.status === 'IN_PROGRESS' ? 'Tayyorlanmoqda' :
                             art.status === 'UNDER_REVIEW' ? 'Tekshiruvda' :
                             isReady ? 'Tayyor (Yuklab oling)' : art.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-slate-900">
                          {art.title}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100">Hajm: {art.volumePages}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100">Tili: {art.language}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100">Soha: {art.subjectArea}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100">Muddat: {art.deadline}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono font-bold">
                            To‘lov: {art.amount.toLocaleString()} UZS (To‘langan)
                          </span>
                        </div>
                      </div>

                      {art.assignedToName && (
                        <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                          <span>Biriktirilgan mutaxassis: <strong>{art.assignedToName}</strong></span>
                        </div>
                      )}

                      {/* Download Section if Completed (Spec Section 25) */}
                      {art.uploadedFile && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                              {art.uploadedFile.format}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-emerald-950">
                                {art.uploadedFile.name}
                              </div>
                              <span className="text-[11px] text-emerald-700">
                                Hajmi: {art.uploadedFile.size} • Tayyorlangan sana: {new Date(art.uploadedFile.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const content = `ILMIY MAQOLA
Mavzu: ${art.title}
Turi: ${art.articleType}
Muallif: ${art.studentName}
Tayyorlagan ekspert: ${art.assignedToName || 'Ilmiy ekspert'}

ANVON: ${art.title}
ANNOTATSIYA:
Ushbu tadqiqot ishida ${art.subjectArea} sohasidagi dolzarb masalalar, zamonaviy ilmiy nazariyalar va amaliy tavsiyalar chuqur tahlil qilingan.

ADABIYOTLAR RO'YXATI:
1. O'zbekiston Respublikasi qonun hujjatlari to'plami.
2. Zamonaviy ilmiy monografiyalar va xalqaro maqolalar to'plami.`;

                              const blob = new Blob([content], { type: 'application/msword' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = art.uploadedFile?.name || 'maqola.docx';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Faylni yuklab olish</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: UMUMIY O'ZLASHTIRISH VA REYTING KO'RSATKICHLARI */}
      {activeTab === 'SUMMARY' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Umumiy O‘rtacha Ball</span>
              <div className="text-3xl font-black font-mono text-indigo-600 mt-2">
                {overallAverage}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Barcha topshirilgan testlar bo‘yicha</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Topshirilgan Testlar</span>
              <div className="text-3xl font-black font-mono text-slate-900 mt-2">
                {userAttempts.length} ta
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {totalUserPassed} tasi o‘tgan (≥60%)
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Guruhdagi O‘rningiz</span>
              <div className="text-3xl font-black font-mono text-amber-600 mt-2">
                Top 15%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Guruh: Pedagogika 101-guruh</p>
            </div>
          </div>

          {/* Test Attempts History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Topshirilgan testlar bayonnomasi (Bir martalik urinishlar)
              </h4>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {userAttempts.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  Hozircha testlar topshirilmagan
                </div>
              ) : (
                userAttempts.map(att => {
                  const topic = topics.find(t => t.id === att.topicId);
                  const subj = subjects.find(s => s.id === att.subjectId);

                  return (
                    <div key={att.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">
                          {subj?.name} • {topic?.topicNumber}-Mavzu
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {topic?.title} — {new Date(att.completedAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full font-bold font-mono text-xs ${
                          att.status === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {att.scorePercentage}% ({att.status === 'PASSED' ? 'O‘tdi' : 'O‘tmadi'})
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

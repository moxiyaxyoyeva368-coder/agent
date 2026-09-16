import React from 'react';
import {
  X,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Award,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Topic, Subject, TestAttempt } from '../types';

interface TopicDetailModalProps {
  topic: Topic | null;
  subject?: Subject;
  attempt?: TestAttempt;
  isSubscriptionActive: boolean;
  onClose: () => void;
  onStartTest: (topic: Topic) => void;
  onOpenSubscription: () => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  subject,
  attempt,
  isSubscriptionActive,
  onClose,
  onStartTest,
  onOpenSubscription
}) => {
  if (!topic) return null;

  const handleDownloadMock = (fileName: string, type: string) => {
    // Generate an authentic downloadable text/mock blob
    const content = `OTM ELEKTRON TA'LIM PLATFORMASI
Fan: ${subject?.name || ''}
Mavzu ${topic.topicNumber}: ${topic.title}
O'tish bali: ${topic.passingScore}%

MA'RUZA MATNI:
${topic.lectureText}

Ushbu material oliy ta'lim talabalari uchun rasmiy ma'ruza matni hisoblanadi.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <span>{subject?.name || 'Fan'}</span>
              <span>•</span>
              <span>{topic.topicNumber}-Mavzu</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {topic.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Attempt Status Banner if already taken */}
          {attempt ? (
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              attempt.status === 'PASSED'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}>
              {attempt.status === 'PASSED' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs sm:text-sm">
                <div className="font-bold flex items-center gap-2">
                  <span>Test natijasi: {attempt.scorePercentage}% — {attempt.status === 'PASSED' ? 'O‘tdi' : 'O‘tmadi'}</span>
                  <span className="text-[11px] font-normal opacity-80">
                    ({attempt.correctAnswers} / {attempt.totalQuestions} ta to‘g‘ri javob)
                  </span>
                </div>
                <p className="mt-1 opacity-90">
                  Ushbu mavzu bo‘yicha test avval topshirilgan. Qayta topshirish imkoniyati mavjud emas. Real natijangiz shaxsiy reytingingizda saqlandi.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Muhim eslatma: Bir martalik urinish qoidasi!</span>
                <p className="mt-0.5 text-amber-800">
                  Davlat ta’lim standarti me’yorlariga ko‘ra har bir mavzu bo‘yicha testni faqat <strong>1 marta</strong> topshirish mumkin. Qayta topshirish taqiqlangan. Testni boshlashdan oldin ma’ruzani to‘liq o‘rganib chiqing.
                </p>
              </div>
            </div>
          )}

          {/* Downloadable Materials Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Ma’ruza fayllari va o‘quv qo‘llanmalar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleDownloadMock(topic.pdfFileName || 'maruza.pdf', 'PDF')}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs border border-rose-100">
                    PDF
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate max-w-[180px]">
                      {topic.pdfFileName || 'Ma’ruza PDF materiali'}
                    </div>
                    <span className="text-[11px] text-slate-400">{topic.pdfFileSize || '2.4 MB'}</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>

              <button
                onClick={() => handleDownloadMock(topic.wordFileName || 'maruza.docx', 'DOCX')}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
                    DOC
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate max-w-[180px]">
                      {topic.wordFileName || 'Ma’ruza Word matni'}
                    </div>
                    <span className="text-[11px] text-slate-400">{topic.wordFileSize || '850 KB'}</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>

          {/* Lecture Text Container */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Ma’ruza matni
              </h3>
              <span className="text-xs text-slate-400">Platformadagi to‘liq o‘quv matni</span>
            </div>

            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/70 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-sans">
              {topic.lectureText || 'Ushbu mavzu bo‘yicha ma’ruza matni tez orada to‘ldiriladi.'}
            </div>
          </div>

          {/* Additional reading materials */}
          {topic.additionalMaterials && topic.additionalMaterials.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Tavsiya etiladigan adabiyotlar
              </h4>
              <ul className="space-y-1.5">
                {topic.additionalMaterials.map((mat, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    {mat}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer / Test CTA */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" />
              O‘tish bali: <strong>{topic.passingScore || 60}%</strong>
            </span>
            <span>•</span>
            <span>Jami savollar: <strong>{topic.questions.length} ta</strong></span>
          </div>

          {attempt ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Test topshirilgan
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Yopish
              </button>
            </div>
          ) : !isSubscriptionActive ? (
            <button
              onClick={onOpenSubscription}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Obunani faollashtiring (Test topshirish uchun)
            </button>
          ) : (
            <button
              onClick={() => onStartTest(topic)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-200 transition-colors cursor-pointer"
            >
              <span>Testni boshlash</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

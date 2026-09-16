import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  ShieldAlert,
  Send
} from 'lucide-react';
import { Topic, TestAttempt, User } from '../types';

interface TestTakerModalProps {
  topic: Topic;
  currentUser: User;
  onClose: () => void;
  onSubmitTest: (topicId: string, answers: Record<string, 'A' | 'B' | 'C' | 'D'>) => Promise<TestAttempt>;
}

export const TestTakerModal: React.FC<TestTakerModalProps> = ({
  topic,
  currentUser,
  onClose,
  onSubmitTest
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(topic.questions.length * 60); // 1 min per question
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedAttempt, setCompletedAttempt] = useState<TestAttempt | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (completedAttempt) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [completedAttempt]);

  const handleSelectOption = (questionId: string, option: 'A' | 'B' | 'C' | 'D') => {
    if (completedAttempt) return;
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleAutoSubmit = async () => {
    await performSubmit();
  };

  const performSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await onSubmitTest(topic.id, answers);
      setCompletedAttempt(result);
      setShowConfirmSubmit(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Testni topshirishda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = topic.questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const totalQ = topic.questions.length;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // If no questions in topic
  if (!currentQ && !completedAttempt) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Ushbu mavzuda test savollari yo‘q</h3>
          <p className="text-xs text-slate-600 mt-2">
            O‘qituvchi yoki administrator ushbu mavzuga hali savollar kiritmagan.
          </p>
          <button
            onClick={onClose}
            className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Top Header */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/30 text-indigo-200 text-xs font-semibold border border-indigo-400/20">
              {topic.topicNumber}-Mavzu Testi
            </span>
            <h2 className="text-sm sm:text-base font-bold truncate max-w-md">
              {topic.title}
            </h2>
          </div>

          {!completedAttempt && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-amber-300 text-xs font-mono font-bold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{timeFormatted}</span>
              </div>
              <button
                onClick={() => {
                  if (confirm("Testni bekor qilmoqchimisiz? Agar javob bermay yopsangiz ham urinish saqlanmasligi mumkin, lekin xavfsizlik uchun yakunlash tavsiya etiladi.")) {
                    onClose();
                  }
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Single attempt strict warning header */}
        {!completedAttempt && (
          <div className="px-6 py-2 bg-rose-50 border-b border-rose-200/80 text-rose-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Yagona urinish qoidasi:</strong> Ushbu testni faqat bir marta topshirish mumkin. Qayta topshirish taqiqlanadi!
              </span>
            </div>
            <span className="font-semibold text-rose-700">
              Javob berildi: {answeredCount} / {totalQ}
            </span>
          </div>
        )}

        {/* Modal Main Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{errorMsg}</p>
                <p className="mt-0.5 text-rose-700">
                  Ushbu mavzu bo‘yicha natijangiz avvalroq ro‘yxatga olingan.
                </p>
              </div>
            </div>
          )}

          {/* RESULTS MODE AFTER COMPLETION */}
          {completedAttempt ? (
            <div className="space-y-6 text-center py-4">
              <div className="inline-flex p-4 rounded-full bg-slate-50 border border-slate-200 mx-auto">
                {completedAttempt.status === 'PASSED' ? (
                  <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                ) : (
                  <XCircle className="w-16 h-16 text-rose-600" />
                )}
              </div>

              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                  completedAttempt.status === 'PASSED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {completedAttempt.status === 'PASSED' ? 'O‘TDI — Muvaffaqiyatli' : 'O‘TMADI — Chegaradan past'}
                </span>
                
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 font-mono">
                  {completedAttempt.scorePercentage}%
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
                  Siz <strong>{completedAttempt.totalQuestions}</strong> ta savoldan{' '}
                  <strong>{completedAttempt.correctAnswers}</strong> tasiga to‘g‘ri javob berdingiz.
                  O‘tish bali: <strong>{completedAttempt.passingScore}%</strong>.
                </p>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 max-w-md mx-auto">
                  🔒 Ushbu natija ma’lumotlar bazasida saqlandi. Bir martalik urinish qoidasiga asosan test qayta ochilmaydi.
                </div>
              </div>

              {/* Question Review Section */}
              <div className="text-left border-t border-slate-200 pt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  Savollar va javoblar tahlili
                </h4>

                <div className="space-y-4">
                  {topic.questions.map((q, idx) => {
                    const userAns = completedAttempt.userAnswers[q.id];
                    const isCorrect = userAns && userAns.toUpperCase() === q.correctOption.toUpperCase();

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isCorrect
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-bold text-slate-800">
                            <span className="text-slate-500 mr-1.5">{idx + 1}-savol:</span>
                            {q.questionText}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase shrink-0 ${
                            isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {isCorrect ? 'To‘g‘ri' : 'Xato'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                          {(['A', 'B', 'C', 'D'] as const).map(opt => {
                            const optText = q[`option${opt}` as keyof typeof q];
                            const isSelected = userAns === opt;
                            const isTheRightOne = q.correctOption === opt;

                            return (
                              <div
                                key={opt}
                                className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                                  isTheRightOne
                                    ? 'bg-emerald-100/70 border-emerald-300 font-semibold text-emerald-950'
                                    : isSelected
                                      ? 'bg-rose-100 border-rose-300 text-rose-950 font-semibold'
                                      : 'bg-white border-slate-200 text-slate-600'
                                }`}
                              >
                                <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-slate-100">
                                  {opt}
                                </span>
                                <span className="truncate">{optText}</span>
                                {isTheRightOne && <span className="ml-auto text-[10px] text-emerald-700 font-bold">✓ To‘g‘ri</span>}
                                {isSelected && !isTheRightOne && <span className="ml-auto text-[10px] text-rose-700 font-bold">✗ Sizning javob</span>}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                            <strong>Izoh:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE TEST TAKING VIEW */
            <div className="space-y-6">
              {/* Question Number Tabs */}
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200/70">
                {topic.questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs scale-105'
                          : isAnswered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Current Question Display */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                  {currentIdx + 1}-Savol (Jami {totalQ} tadan)
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                  {currentQ.questionText}
                </h3>
              </div>

              {/* Options A, B, C, D */}
              <div className="grid grid-cols-1 gap-3">
                {(['A', 'B', 'C', 'D'] as const).map(option => {
                  const text = currentQ[`option${option}` as keyof typeof currentQ];
                  const isSelected = answers[currentQ.id] === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, option)}
                      className={`w-full p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 shadow-xs text-indigo-950 font-medium'
                          : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50 text-slate-800'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {option}
                      </div>
                      <span className="text-sm leading-snug">{text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {completedAttempt ? (
            <button
              onClick={onClose}
              className="ml-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Kabinetga qaytish
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Oldingi
              </button>

              <div className="flex items-center gap-2">
                {currentIdx < totalQ - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx(prev => Math.min(totalQ - 1, prev + 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    Keyingi
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmit(true)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-200 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Testni yakunlash
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Confirmation Modal before Final Submit */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 text-center">
                Testni yakunlashni tasdiqlaysizmi?
              </h3>
              <p className="text-xs text-slate-600 mt-2 text-center leading-relaxed">
                Siz <strong>{totalQ}</strong> ta savoldan <strong>{answeredCount}</strong> tasiga javob berdingiz.
                Test topshirilgach, natijangiz avtomatik hisoblanadi va <strong>qayta topshirish taqiqlanadi</strong>.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Savollarga qaytish
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={performSubmit}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Hisoblanmoqda...' : 'Ha, yakunlayman'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

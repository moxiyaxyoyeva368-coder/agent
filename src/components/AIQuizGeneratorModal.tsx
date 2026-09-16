import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Cpu,
  Plus
} from 'lucide-react';
import { Question } from '../types';
import { api } from '../services/api';

interface AIQuizGeneratorModalProps {
  topicTitle: string;
  lectureText: string;
  onClose: () => void;
  onApplyQuestions: (questions: Question[]) => void;
}

export const AIQuizGeneratorModal: React.FC<AIQuizGeneratorModalProps> = ({
  topicTitle,
  lectureText,
  onClose,
  onApplyQuestions
}) => {
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const res = await api.generateQuiz(topicTitle, lectureText, count);
      setGeneratedQuestions(res.questions || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Generatsiya qilishda xatolik yuz berdi');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Test Savollari Generatori
              </h3>
              <p className="text-xs text-slate-500">
                Ma’ruza matni va mavzu asosida avtomatik 4 variantli testlar tuzish
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Tanlangan mavzu:</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">{topicTitle}</div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Savollar soni:
            </label>
            <select
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value={3}>3 ta savol</option>
              <option value={5}>5 ta savol</option>
              <option value={10}>10 ta savol</option>
            </select>
          </div>

          {generatedQuestions.length === 0 && (
            <div className="py-6 text-center">
              <Cpu className="w-12 h-12 text-indigo-400 mx-auto mb-2.5 animate-pulse" />
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Sun’iy intellekt ma’ruza matnini tahlil qiladi va talabaning bilish darajasini aniqlovchi A, B, C, D variantli test savollarini shakllantiradi.
              </p>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? 'Savollar tuzilmoqda...' : '✨ Savollarni yaratish'}
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {errorMsg}
            </div>
          )}

          {generatedQuestions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Yaratilgan savollar ({generatedQuestions.length} ta):
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  Qayta generatsiya qilish
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {generatedQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900">
                      {idx + 1}. {q.questionText}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                      <div>A) {q.optionA} {q.correctOption === 'A' && '✓'}</div>
                      <div>B) {q.optionB} {q.correctOption === 'B' && '✓'}</div>
                      <div>C) {q.optionC} {q.correctOption === 'C' && '✓'}</div>
                      <div>D) {q.optionD} {q.correctOption === 'D' && '✓'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {generatedQuestions.length > 0 && (
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              onClick={() => {
                onApplyQuestions(generatedQuestions);
                onClose();
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Testga qo‘shish ({generatedQuestions.length} ta savol)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

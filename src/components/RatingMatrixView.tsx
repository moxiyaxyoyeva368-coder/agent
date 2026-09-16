import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Printer,
  Search,
  Filter,
  Award,
  Users,
  BarChart3
} from 'lucide-react';
import { Subject, Topic, Group, User } from '../types';

interface RatingMatrixProps {
  subjects: Subject[];
  topics: Topic[];
  groups: Group[];
  matrixData: {
    topics: Topic[];
    matrix: Array<{
      studentId: string;
      studentName: string;
      groupName: string;
      groupId?: string;
      completedCount: number;
      passedCount: number;
      totalTopics: number;
      averageScore: number;
      topicResults: Record<string, { score: number; status: 'PASSED' | 'FAILED'; completedAt: string }>;
    }>;
  };
  selectedSubjectId: string;
  onSelectSubjectId: (id: string) => void;
}

export const RatingMatrixView: React.FC<RatingMatrixProps> = ({
  subjects = [],
  topics = [],
  groups = [],
  matrixData = { topics: [], matrix: [] },
  selectedSubjectId,
  onSelectSubjectId
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const safeSubjects = subjects || [];
  const safeGroups = groups || [];
  const safeMatrixTopics = matrixData?.topics || [];

  // Filter students based on group and search
  const filteredMatrix = useMemo(() => {
    let list = matrixData?.matrix || [];
    if (selectedGroupId !== 'ALL') {
      list = list.filter(item => item.groupId === selectedGroupId);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item => item.studentName.toLowerCase().includes(q));
    }
    return list;
  }, [matrixData, selectedGroupId, searchTerm]);

  // Export matrix to CSV (Excel compatible)
  const handleExportCSV = () => {
    const activeTopics = safeMatrixTopics;
    const headers = [
      '№',
      'Talaba F.I.Sh',
      'Guruh',
      ...activeTopics.map(t => `${t.topicNumber}-mavzu (${t.passingScore}% o'tish)`),
      "O'rtacha ball (%)",
      'Olingan mavzular soni'
    ];

    const rows = filteredMatrix.map((item, idx) => {
      const topicCols = activeTopics.map(t => {
        const res = item.topicResults[t.id];
        if (!res) return 'Bajarilmagan';
        return `${res.score}% (${res.status === 'PASSED' ? "O'tdi" : "O'tmadi"})`;
      });

      return [
        idx + 1,
        `"${item.studentName}"`,
        `"${item.groupName}"`,
        ...topicCols,
        `${item.averageScore}%`,
        `${item.completedCount}/${activeTopics.length}`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reyting_jadvali_${selectedSubjectId || 'barcha'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Top Banner & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>O‘zlashtirish monitoringi & Baholash</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Talabalar Reytingi Jadvali (Matritsa)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Har bir mavzu bo‘yicha talabalarning bir martalik test natijalari va umumiy o‘rtacha ko‘rsatkichi
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Excel / CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Chop etish (PDF)</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* Subject dropdown */}
        <div className="w-full sm:w-64">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Fan bo‘yicha filtr:
          </label>
          <select
            value={selectedSubjectId}
            onChange={e => onSelectSubjectId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Barcha mavzular</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Group dropdown */}
        <div className="w-full sm:w-56">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Guruh bo‘yicha:
          </label>
          <select
            value={selectedGroupId}
            onChange={e => setSelectedGroupId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Barcha guruhlar</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="w-full sm:flex-1 sm:mt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Talaba ism-familiyasi bo‘yicha izlash..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-indigo-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Matrix Table (Spec 16 Layout) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {currentSubject ? currentSubject.name : 'Umumiy reyting'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold">
              {filteredMatrix.length} nafar talaba
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              O‘tdi (≥60%)
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              O‘tmadi (&lt;60%)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              Bajarilmagan
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center font-bold">№</th>
                <th className="py-3 px-4 min-w-[180px] font-bold sticky left-0 bg-slate-100 shadow-xs">
                  Talaba F.I.Sh
                </th>
                <th className="py-3 px-3 min-w-[130px] font-bold">Guruh</th>
                {safeMatrixTopics.map(topic => (
                  <th
                    key={topic.id}
                    className="py-3 px-3 min-w-[100px] text-center font-bold border-l border-slate-200"
                    title={topic.title}
                  >
                    <div>{topic.topicNumber}-mavzu</div>
                    <div className="text-[9px] font-normal text-slate-400 lowercase">
                      o‘tish: {topic.passingScore}%
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 min-w-[110px] text-center font-extrabold bg-indigo-50/70 text-indigo-900 border-l border-indigo-100">
                  Umumiy O‘rtacha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMatrix.length === 0 ? (
                <tr>
                  <td colSpan={safeMatrixTopics.length + 4} className="py-8 text-center text-slate-400 text-xs">
                    Hech qanday natija topilmadi
                  </td>
                </tr>
              ) : (
                filteredMatrix.map((student, idx) => (
                  <tr key={student.studentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50">
                      {student.studentName}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                        {student.groupName}
                      </span>
                    </td>

                    {/* Topic result cells */}
                    {matrixData.topics.map(topic => {
                      const res = student.topicResults[topic.id];

                      if (!res) {
                        return (
                          <td key={topic.id} className="py-3 px-3 text-center border-l border-slate-100">
                            <span className="text-slate-300 font-mono">—</span>
                          </td>
                        );
                      }

                      const isPassed = res.status === 'PASSED';

                      return (
                        <td key={topic.id} className="py-2.5 px-2 text-center border-l border-slate-100">
                          <div className={`inline-block px-2 py-1 rounded-lg text-center font-mono font-bold ${
                            isPassed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            <div className="text-xs">{res.score}%</div>
                            <div className="text-[9px] font-sans font-semibold">
                              {isPassed ? 'O‘tdi' : 'O‘tmadi'}
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    {/* Average column */}
                    <td className="py-3 px-4 text-center font-mono border-l border-indigo-100 bg-indigo-50/30">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-black text-indigo-700 bg-indigo-100">
                        {student.averageScore}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

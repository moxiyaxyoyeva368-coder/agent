import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Users,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Trash2,
  Edit,
  Sparkles,
  Search,
  Eye,
  Send,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import {
  Subject,
  Topic,
  Group,
  ArticleOrder,
  User,
  Question,
  ArticleStatus
} from '../types';
import { AIQuizGeneratorModal } from './AIQuizGeneratorModal';

interface TeacherCabinetProps {
  currentUser: User;
  subjects: Subject[];
  topics: Topic[];
  groups: Group[];
  students: User[];
  articles: ArticleOrder[];
  onCreateTopic: (topicData: Partial<Topic>) => Promise<void>;
  onUpdateTopic: (id: string, topicData: Partial<Topic>) => Promise<void>;
  onDeleteTopic: (id: string) => Promise<void>;
  onCreateGroup: (groupData: Partial<Group>) => Promise<void>;
  onUpdateArticle: (id: string, updates: Partial<ArticleOrder>) => Promise<void>;
  onOpenRatings: (subjectId?: string, groupId?: string) => void;
}

export const TeacherCabinet: React.FC<TeacherCabinetProps> = ({
  currentUser,
  subjects = [],
  topics = [],
  groups = [],
  students = [],
  articles = [],
  onCreateTopic,
  onUpdateTopic,
  onDeleteTopic,
  onCreateGroup,
  onUpdateArticle,
  onOpenRatings
}) => {
  const [activeTab, setActiveTab] = useState<'TOPICS' | 'GROUPS' | 'ARTICLES'>('TOPICS');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');

  const safeSubjects = subjects || [];
  const safeTopics = topics || [];
  const safeGroups = groups || [];
  const safeStudents = students || [];
  const safeArticles = articles || [];

  // Topic creation / edit modal state
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicNum, setTopicNum] = useState<number>(1);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [lectureText, setLectureText] = useState('');
  const [passingScore, setPassingScore] = useState(60);
  const [pdfFileName, setPdfFileName] = useState('');
  const [wordFileName, setWordFileName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  // Single question input state
  const [newQText, setNewQText] = useState('');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newCorrectOpt, setNewCorrectOpt] = useState<'A'|'B'|'C'|'D'>('A');

  // AI Quiz Modal state
  const [showAiModal, setShowAiModal] = useState(false);

  // Group creation modal state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupFaculty, setNewGroupFaculty] = useState('');
  const [newGroupCourse, setNewGroupCourse] = useState(1);

  // Article upload state
  const [uploadingArticleId, setUploadingArticleId] = useState<string | null>(null);
  const [uploadedDocName, setUploadedDocName] = useState('');
  const [uploadedDocFormat, setUploadedDocFormat] = useState<'DOCX' | 'PDF'>('DOCX');

  const currentSubject = safeSubjects.find(s => s.id === selectedSubjectId) || safeSubjects[0];
  const subjectTopics = safeTopics
    .filter(t => t.subjectId === currentSubject?.id)
    .sort((a, b) => a.topicNumber - b.topicNumber);

  // Open Topic Modal for creating
  const handleOpenNewTopic = () => {
    setEditingTopic(null);
    const nextNum = subjectTopics.length + 1;
    setTopicNum(nextNum);
    setTopicTitle('');
    setTopicDesc('');
    setLectureText('');
    setPassingScore(60);
    setPdfFileName(`${nextNum}-mavzu_maruza_materiali.pdf`);
    setWordFileName(`${nextNum}-mavzu_maruza_matni.docx`);
    setQuestions([]);
    setShowTopicModal(true);
  };

  // Open Topic Modal for editing
  const handleEditTopic = (t: Topic) => {
    setEditingTopic(t);
    setTopicNum(t.topicNumber);
    setTopicTitle(t.title);
    setTopicDesc(t.description);
    setLectureText(t.lectureText);
    setPassingScore(t.passingScore || 60);
    setPdfFileName(t.pdfFileName || '');
    setWordFileName(t.wordFileName || '');
    setQuestions(t.questions || []);
    setShowTopicModal(true);
  };

  // Add question to current topic editor
  const handleAddQuestion = () => {
    if (!newQText.trim() || !newOptA.trim() || !newOptB.trim()) {
      alert("Iltimos, savol matni va kamida A va B variantlarini kiriting!");
      return;
    }
    const q: Question = {
      id: `q-${Date.now()}-${questions.length}`,
      questionText: newQText,
      optionA: newOptA,
      optionB: newOptB,
      optionC: newOptC || 'C varianti',
      optionD: newOptD || 'D varianti',
      correctOption: newCorrectOpt
    };
    setQuestions(prev => [...prev, q]);
    setNewQText('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
    setNewCorrectOpt('A');
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) {
      alert("Mavzu nomini kiriting!");
      return;
    }

    const payload: Partial<Topic> = {
      subjectId: currentSubject.id,
      topicNumber: Number(topicNum),
      title: topicTitle,
      description: topicDesc,
      lectureText,
      passingScore: Number(passingScore) || 60,
      pdfFileName: pdfFileName || `${topicNum}-mavzu_maruza.pdf`,
      wordFileName: wordFileName || `${topicNum}-mavzu_maruza.docx`,
      questions
    };

    if (editingTopic) {
      await onUpdateTopic(editingTopic.id, payload);
    } else {
      await onCreateTopic(payload);
    }
    setShowTopicModal(false);
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    await onCreateGroup({
      name: newGroupName,
      faculty: newGroupFaculty || 'Umumiy fakultet',
      course: Number(newGroupCourse),
      teacherId: currentUser.id
    });
    setNewGroupName('');
    setNewGroupFaculty('');
    setShowGroupModal(false);
  };

  const handleSaveArticleFile = async (articleId: string) => {
    if (!uploadedDocName.trim()) {
      alert("Fayl nomini kiriting!");
      return;
    }
    await onUpdateArticle(articleId, {
      status: 'READY',
      uploadedFile: {
        name: uploadedDocName.endsWith('.docx') || uploadedDocName.endsWith('.pdf')
          ? uploadedDocName
          : `${uploadedDocName}.${uploadedDocFormat.toLowerCase()}`,
        size: '520 KB',
        format: uploadedDocFormat,
        url: `#article-${articleId}`,
        uploadedAt: new Date().toISOString()
      }
    });
    setUploadingArticleId(null);
    setUploadedDocName('');
  };

  const pendingArticlesCount = safeArticles.filter(a => a.status !== 'READY' && a.status !== 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>O‘qituvchi va Ilmiy Ekspert Kabineti</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.specialty || 'Kafedra professori'} • {currentUser.institution}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleOpenNewTopic}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi mavzu qo‘shish</span>
          </button>

          <button
            onClick={() => onOpenRatings(selectedSubjectId)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Reyting jadvalini ko‘rish</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('TOPICS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'TOPICS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Mavzular, Ma’ruzalar va Testlar</span>
        </button>

        <button
          onClick={() => setActiveTab('GROUPS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'GROUPS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Guruhlar va Talabalar ({groups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ARTICLES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'ARTICLES'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Maqola buyurtmalari ({articles.length})</span>
          {pendingArticlesCount > 0 && (
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
              {pendingArticlesCount} yangi
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MAVZULAR, MA'RUZALAR VA TESTLAR */}
      {activeTab === 'TOPICS' && (
        <div className="space-y-4">
          {/* Subject selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Fanni tanlang:
              </label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-indigo-500"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Ushbu fanda jami: <strong>{subjectTopics.length} ta mavzu</strong> (Cheklovlarsiz qo‘shish mumkin)
            </div>
          </div>

          {/* Topics cards */}
          <div className="space-y-3">
            {subjectTopics.map(topic => (
              <div
                key={topic.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100">
                    {topic.topicNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {topic.description || 'Ma’ruza va test materiallari joylangan'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100">
                        O‘tish bali: <strong>{topic.passingScore}%</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">
                        Test savollari: <strong>{topic.questions.length} ta</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">
                        PDF: {topic.pdfFileName || 'Mavjud'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">
                        DOCX: {topic.wordFileName || 'Mavjud'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEditTopic(topic)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tahrirlash / Testlar</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${topic.title}" mavzusini o‘chirmoqchimisiz?`)) {
                        onDeleteTopic(topic.id);
                      }
                    }}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GURUHLAR VA TALABALAR (SPEC SECTION 15) */}
      {activeTab === 'GROUPS' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Guruhlar va Talabalar Nazorati
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Talabalarni guruhlarga ajratish va umumiy monitoring
              </p>
            </div>
            <button
              onClick={() => setShowGroupModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yangi guruh ochish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {safeGroups.map(group => {
              const groupStudents = safeStudents.filter(s => s.groupId === group.id);

              return (
                <div key={group.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 font-mono">
                      {group.course}-kurs
                    </span>
                    <button
                      onClick={() => onOpenRatings(selectedSubjectId, group.id)}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Reyting matritsasi →
                    </button>
                  </div>

                  <h4 className="font-bold text-base text-slate-900">{group.name}</h4>
                  <p className="text-xs text-slate-500">{group.faculty}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Talabalar soni:</span>
                    <strong className="font-mono">{groupStudents.length || group.studentCount || 0} nafar</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MAQOLA BUYURTMALARI (SPEC SECTIONS 22, 23, 24, 25) */}
      {activeTab === 'ARTICLES' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">
              Ilmiy Maqola Buyurtmalari (O‘qituvchi / Muallif Kabineti)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Talabalar tomonidan alohida to‘langan ilmiy maqolalar, talablari va tayyor fayllarni yuklash
            </p>
          </div>

          <div className="space-y-4">
            {articles.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                Hozircha maqola buyurtmalari kelib tushmagan.
              </div>
            ) : (
              articles.map(art => (
                <div
                  key={art.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
                >
                  {/* Spec 24 Notification Header representation */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🔔</span>
                      <div>
                        <div className="font-bold text-xs text-amber-950">
                          BUYURTMA №{art.orderNumber}
                        </div>
                        <span className="text-[11px] text-amber-800">
                          Holati: <strong>To‘lov amalga oshirilgan ({art.amount.toLocaleString()} UZS)</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-600">Statusni o‘zgartirish:</label>
                      <select
                        value={art.status}
                        onChange={e => onUpdateArticle(art.id, { status: e.target.value as ArticleStatus })}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                      >
                        <option value="NEW_ORDER">1. Yangi buyurtma</option>
                        <option value="ACCEPTED">2. Qabul qilindi</option>
                        <option value="IN_PROGRESS">3. Tayyorlanmoqda</option>
                        <option value="UNDER_REVIEW">4. Tekshiruvda</option>
                        <option value="READY">5. Tayyor</option>
                        <option value="COMPLETED">6. Yakunlandi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900">
                      "{art.title}"
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100">Talaba: {art.studentName}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Tel: {art.studentPhone}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Turi: {art.articleType}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Hajm: {art.volumePages}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Tili: {art.language}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Muddat: {art.deadline}</span>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-200">
                      <strong>Talablar:</strong> {art.requirements || 'Standart IMRAD formati'}
                      {art.notes && <div className="mt-1 text-slate-500"><strong>Izoh:</strong> {art.notes}</div>}
                    </div>
                  </div>

                  {/* File Uploader / Delivery Section (Spec Section 25) */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {art.uploadedFile ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Tayyor fayl: <strong>{art.uploadedFile.name}</strong> ({art.uploadedFile.format}) yuklangan va talabaga yuborilgan.
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">
                        Maqola tayyor bo‘lgach, DOCX yoki PDF formatida yuklang.
                      </div>
                    )}

                    <button
                      onClick={() => setUploadingArticleId(art.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{art.uploadedFile ? 'Faylni qayta yuklash' : 'Tayyor maqolani yuklash (DOCX/PDF)'}</span>
                    </button>
                  </div>

                  {/* Inline Upload Form */}
                  {uploadingArticleId === art.id && (
                    <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 space-y-3">
                      <h5 className="text-xs font-bold text-slate-800 uppercase">
                        Tayyor ilmiy maqola faylini yuklash
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Fayl nomi (masalan: Ibn_Xaldun_maqola_tayyor.docx)"
                            value={uploadedDocName}
                            onChange={e => setUploadedDocName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <select
                            value={uploadedDocFormat}
                            onChange={e => setUploadedDocFormat(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                          >
                            <option value="DOCX">DOCX (Word formati)</option>
                            <option value="PDF">PDF (Hujjat formati)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveArticleFile(art.id)}
                          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                        >
                          Yuklash va Talabaga yuborish
                        </button>
                        <button
                          onClick={() => setUploadingArticleId(null)}
                          className="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs cursor-pointer"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TOPIC CREATION / EDIT MODAL */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-900">
                {editingTopic ? 'Mavzuni tahrirlash' : '+ Yangi mavzu qo‘shish'}
              </h3>
              <button onClick={() => setShowTopicModal(false)} className="text-slate-400 hover:text-slate-600">
                <Trash2 className="w-5 h-5 hidden" />
                <span>✕</span>
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mavzu №
                  </label>
                  <input
                    type="number"
                    value={topicNum}
                    onChange={e => setTopicNum(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mavzu nomi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Falsafaning predmeti va vazifalari..."
                    value={topicTitle}
                    onChange={e => setTopicTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Qisqacha tavsif
                </label>
                <input
                  type="text"
                  value={topicDesc}
                  onChange={e => setTopicDesc(e.target.value)}
                  placeholder="Mavzu mazmuni haqida 1-2 jumla..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ma’ruza matni (Platformadagi to‘liq matn)
                </label>
                <textarea
                  rows={5}
                  value={lectureText}
                  onChange={e => setLectureText(e.target.value)}
                  placeholder="Ma’ruza rejalari, asosiy tushunchalar, adabiyotlar..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">O‘tish bali (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={passingScore}
                    onChange={e => setPassingScore(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">PDF Fayl nomi</label>
                  <input
                    type="text"
                    value={pdfFileName}
                    onChange={e => setPdfFileName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Word Fayl nomi</label>
                  <input
                    type="text"
                    value={wordFileName}
                    onChange={e => setWordFileName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Test Savollari Boshqaruvi & AI Assistant */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Test Savollari ({questions.length} ta savol)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      4 ta variantli (A, B, C, D)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAiModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold shadow-xs hover:from-indigo-700 hover:to-indigo-800 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI orqali savollar generatsiya qilish</span>
                  </button>
                </div>

                {/* List of existing questions in topic */}
                {questions.length > 0 && (
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/40">
                    {questions.map((q, idx) => (
                      <div key={q.id || idx} className="p-3 text-xs flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-800">{idx + 1}. {q.questionText}</span>
                          <div className="text-[11px] text-slate-500 mt-1 flex gap-3">
                            <span>A: {q.optionA}</span>
                            <span>B: {q.optionB}</span>
                            <span>C: {q.optionC}</span>
                            <span>D: {q.optionD}</span>
                            <strong className="text-emerald-700">To‘g‘ri: {q.correctOption}</strong>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setQuestions(prev => prev.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Add Question Box */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5">
                  <span className="font-bold text-slate-700">+ Yangi savol kiritish (Qo‘lda):</span>
                  <input
                    type="text"
                    placeholder="Savol matnini kiriting..."
                    value={newQText}
                    onChange={e => setNewQText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="A varianti"
                      value={newOptA}
                      onChange={e => setNewOptA(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="B varianti"
                      value={newOptB}
                      onChange={e => setNewOptB(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="C varianti"
                      value={newOptC}
                      onChange={e => setNewOptC(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="D varianti"
                      value={newOptD}
                      onChange={e => setNewOptD(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <label className="font-bold text-slate-600">To‘g‘ri javob:</label>
                      <select
                        value={newCorrectOpt}
                        onChange={e => setNewCorrectOpt(e.target.value as any)}
                        className="px-2 py-1 rounded border border-slate-300 bg-white font-bold text-indigo-600"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
                    >
                      Savolni qo‘shish
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  {editingTopic ? 'O‘zgarishlarni saqlash' : 'Mavzuni yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI QUIZ MODAL */}
      {showAiModal && (
        <AIQuizGeneratorModal
          topicTitle={topicTitle || 'Yangi mavzu'}
          lectureText={lectureText}
          onClose={() => setShowAiModal(false)}
          onApplyQuestions={(newGenerated) => {
            setQuestions(prev => [...prev, ...newGenerated]);
          }}
        />
      )}

      {/* GROUP CREATION MODAL */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              + Yangi akademik guruh ochish
            </h3>
            <form onSubmit={handleCreateGroupSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Guruh nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Pedagogika 101-guruh"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Fakultet</label>
                <input
                  type="text"
                  placeholder="Pedagogika va psixologiya fakulteti"
                  value={newGroupFaculty}
                  onChange={e => setNewGroupFaculty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Kurs</label>
                <select
                  value={newGroupCourse}
                  onChange={e => setNewGroupCourse(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value={1}>1-kurs</option>
                  <option value={2}>2-kurs</option>
                  <option value={3}>3-kurs</option>
                  <option value={4}>4-kurs</option>
                </select>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Guruhni yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StudentCabinet } from './components/StudentCabinet';
import { TeacherCabinet } from './components/TeacherCabinet';
import { AdminCabinet } from './components/AdminCabinet';
import { RatingMatrixView } from './components/RatingMatrixView';
import { TopicDetailModal } from './components/TopicDetailModal';
import { TestTakerModal } from './components/TestTakerModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { ArticleOrderModal } from './components/ArticleOrderModal';
import { api } from './services/api';
import { LoginPage } from './components/LoginPage';
import {
  User,
  Subject,
  Topic,
  Group,
  TestAttempt,
  Subscription,
  ArticleOrder,
  PaymentTransaction,
  AdminSettings,
  UserRole,
  NotificationItem
} from './types';
import {
  BookOpen,
  CheckCircle2,
  Calendar,
  FileText,
  BarChart3,
  Award,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // Session & User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeRoleView, setActiveRoleView] = useState<UserRole>('STUDENT');

  // Core Data State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [articles, setArticles] = useState<ArticleOrder[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [settings, setSettings] = useState<AdminSettings>({
    defaultPassingScore: 60,
    subscriptionDurationMonths: 6,
    subscriptionPrice6Months: 250000,
    articleBasePriceOAK: 350000,
    articleBasePriceScopus: 1800000,
    articleBasePriceConference: 200000,
    articleBasePriceThesis: 120000,
    allowSingleAttemptOnly: true
  });

  const [stats, setStats] = useState({
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
  });

  // Matrix view state
  const [matrixData, setMatrixData] = useState<{
    topics: Topic[];
    matrix: any[];
  }>({ topics: [], matrix: [] });
  const [matrixSubjectId, setMatrixSubjectId] = useState<string>('');

  // Modals & Navigation
  const [selectedTopicForLecture, setSelectedTopicForLecture] = useState<Topic | null>(null);
  const [selectedTopicForTest, setSelectedTopicForTest] = useState<Topic | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showArticleOrderModal, setShowArticleOrderModal] = useState(false);
  const [showRatingMatrixView, setShowRatingMatrixView] = useState(false);

  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [authChecked, setAuthChecked] = useState(false);

  // Loading & notification states
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleMarkNotificationRead = async (id?: string) => {
    try {
      await api.markNotificationRead(id, currentUser?.id);
      if (currentUser) {
        const notifs = await api.getNotifications(currentUser.id);
        setNotifications(notifs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle login success
  const handleLoginSuccess = (token: string, user: any) => {
    setAuthToken(token);
    setAuthChecked(true);
    setCurrentUser(user);
    setActiveRoleView(user.role);
    loadPlatformData();
  };

  // Handle logout
  const handleLogout = () => {
    api.logout();
    setAuthToken(null);
    setCurrentUser(null);
    setAuthChecked(false);
  };

  // Load all initial data
  const loadPlatformData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        sessionRes,
        usersRes,
        subjRes,
        topRes,
        grpRes,
        attRes,
        subRes,
        artRes,
        payRes,
        setRes,
        statRes
      ] = await Promise.all([
        api.getCurrentSession(),
        api.getUsers(),
        api.getSubjects(),
        api.getTopics(),
        api.getGroups(),
        api.getAttempts(),
        api.getSubscriptions(),
        api.getArticles(),
        api.getPayments(),
        api.getAdminSettings(),
        api.getAdminStats()
      ]);

      setCurrentUser(sessionRes.user);
      setAllUsers(usersRes || []);
      setActiveRoleView(sessionRes.user.role);
      setSubjects(subjRes || []);
      setTopics(topRes || []);
      setGroups(grpRes || []);
      setAttempts(attRes || []);
      setSubscriptions(subRes || []);
      setArticles(artRes || []);
      setPayments(payRes || []);
      if (setRes) setSettings(setRes);
      if (statRes) setStats(statRes);

      // Load notifications for the current user
      if (sessionRes?.user?.id) {
        try {
          const notifs = await api.getNotifications(sessionRes.user.id);
          setNotifications(notifs || []);
        } catch (e) {
          console.error(e);
        }
      }

      // Load matrix data for initial subject
      const initialSubjId = subjRes[0]?.id || '';
      setMatrixSubjectId(initialSubjId);
      if (initialSubjId) {
        const mat = await api.getRatings(initialSubjId);
        setMatrixData(mat);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount: check if we have a valid token
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setAuthChecked(true);
      setIsLoading(false);
      return;
    }
    setAuthToken(token);
    loadPlatformData().finally(() => setAuthChecked(true));
  }, []);

  // Handle switching subject for Rating Matrix
  const handleMatrixSubjectChange = async (subjId: string) => {
    setMatrixSubjectId(subjId);
    try {
      const mat = await api.getRatings(subjId);
      setMatrixData(mat);
    } catch (err) {
      console.error(err);
    }
  };

  // Switch role session handler
  const handleSwitchUserRole = async (userId: string) => {
    try {
      const res = await api.switchUser(userId);
      setCurrentUser(res.user);
      setActiveRoleView(res.user.role);
      showToast(`Foydalanuvchi almashtirildi: ${res.user.name} (${res.user.role})`, 'info');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Test Submission
  const handleTestSubmit = async (answers: Record<string, string>) => {
    if (!currentUser || !selectedTopicForTest) return;
    try {
      const result = await api.submitTest(
        currentUser.id,
        selectedTopicForTest.id,
        answers as Record<string, 'A' | 'B' | 'C' | 'D'>
      );

      // Reload attempts and stats
      const [newAtt, newStats] = await Promise.all([
        api.getAttempts(),
        api.getAdminStats()
      ]);
      setAttempts(newAtt);
      setStats(newStats);

      // Refresh matrix
      if (matrixSubjectId) {
        const mat = await api.getRatings(matrixSubjectId);
        setMatrixData(mat);
      }

      showToast(
        `Test yakunlandi! Natija: ${result.scorePercentage}% — ${result.status === 'PASSED' ? "O'TDI" : "O'TMADI"}`
      );
      return result;
    } catch (err: any) {
      throw err;
    }
  };

  // 6-Month Subscription Purchase
  const handlePurchaseSubscription = async (paymentMethod: string) => {
    if (!currentUser) return;
    try {
      await api.purchaseSubscription(currentUser.id, paymentMethod);
      const [newSubs, newPays, newStats] = await Promise.all([
        api.getSubscriptions(),
        api.getPayments(),
        api.getAdminStats()
      ]);
      setSubscriptions(newSubs);
      setPayments(newPays);
      setStats(newStats);
      showToast(`6 oylik ta'lim obunasi muvaffaqiyatli faollashtirildi! (${paymentMethod})`);
    } catch (err: any) {
      throw err;
    }
  };

  // Scientific Article Order
  const handleOrderArticle = async (orderPayload: Partial<ArticleOrder>) => {
    try {
      const created = await api.createArticleOrder(orderPayload);
      const [newArts, newPays, newStats] = await Promise.all([
        api.getArticles(),
        api.getPayments(),
        api.getAdminStats()
      ]);
      setArticles(newArts);
      setPayments(newPays);
      setStats(newStats);
      showToast(`Maqola buyurtmasi qabul qilindi va to'lov tasdiqlandi! (№${created.orderNumber})`);
    } catch (err: any) {
      throw err;
    }
  };

  // Topic CRUD (Teacher / Admin)
  const handleCreateTopic = async (topicData: Partial<Topic>) => {
    try {
      await api.createTopic(topicData);
      const [newTop, newStats] = await Promise.all([api.getTopics(), api.getAdminStats()]);
      setTopics(newTop);
      setStats(newStats);
      showToast("Yangi mavzu va testlar muvaffaqiyatli qo'shildi!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateTopic = async (id: string, topicData: Partial<Topic>) => {
    try {
      await api.updateTopic(id, topicData);
      const newTop = await api.getTopics();
      setTopics(newTop);
      showToast("Mavzu muvaffaqiyatli yangilandi!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      await api.deleteTopic(id);
      const [newTop, newStats] = await Promise.all([api.getTopics(), api.getAdminStats()]);
      setTopics(newTop);
      setStats(newStats);
      showToast("Mavzu o'chirildi", 'info');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Subject CRUD (Admin / Teacher)
  const handleCreateSubject = async (subjectData: Partial<Subject>) => {
    try {
      await api.createSubject(subjectData);
      const [newSub, newStats] = await Promise.all([api.getSubjects(), api.getAdminStats()]);
      setSubjects(newSub);
      setStats(newStats);
      showToast("Yangi fan muvaffaqiyatli yaratildi!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateSubject = async (id: string, subjectData: Partial<Subject>) => {
    try {
      await api.updateSubject(id, subjectData);
      const newSub = await api.getSubjects();
      setSubjects(newSub);
      showToast("Fan ma'lumotlari yangilandi!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await api.deleteSubject(id);
      const [newSub, newTop, newStats] = await Promise.all([
        api.getSubjects(),
        api.getTopics(),
        api.getAdminStats()
      ]);
      setSubjects(newSub);
      setTopics(newTop);
      setStats(newStats);
      showToast("Fan o'chirildi", 'info');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Group Creation
  const handleCreateGroup = async (groupData: Partial<Group>) => {
    try {
      await api.createGroup(groupData);
      const newGrp = await api.getGroups();
      setGroups(newGrp);
      showToast("Yangi akademik guruh muvaffaqiyatli ochildi!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Article Updates (Teacher/Author uploading completed file or updating status)
  const handleUpdateArticle = async (id: string, updates: Partial<ArticleOrder>) => {
    try {
      await api.updateArticleOrder(id, updates);
      const [newArts, newStats] = await Promise.all([api.getArticles(), api.getAdminStats()]);
      setArticles(newArts);
      setStats(newStats);
      showToast("Maqola buyurtmasi yangilandi va talabaga yuborildi!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Admin Settings
  const handleUpdateSettings = async (newSettings: Partial<AdminSettings>) => {
    try {
      const saved = await api.updateAdminSettings(newSettings);
      setSettings(saved);
    } catch (err: any) {
      throw err;
    }
  };

  const activeSubscription = subscriptions.find(s => s.studentId === currentUser?.id);

  // Not yet checked
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated → Login sahifasi
  if (!authToken || !currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Loading data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Platforma yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-5 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : notification.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Navbar */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        activeSubscription={activeSubscription}
        activeRoleView={activeRoleView}
        activeView={showRatingMatrixView ? 'RATINGS' : (activeRoleView as any)}
        setActiveView={(v) => {
          if (v === 'RATINGS') {
            setShowRatingMatrixView(true);
            if (subjects[0]) handleMatrixSubjectChange(subjects[0].id);
          } else {
            setShowRatingMatrixView(false);
            setActiveRoleView(v);
          }
        }}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onSwitchRole={handleSwitchUserRole}
        onSwitchUser={handleSwitchUserRole}
        onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
        onOpenSubscription={() => setShowSubscriptionModal(true)}
        onOpenArticleModal={() => setShowArticleOrderModal(true)}
        onOpenArticleOrder={() => setShowArticleOrderModal(true)}
        onOpenRatings={() => {
          setShowRatingMatrixView(true);
          if (subjects[0]) handleMatrixSubjectChange(subjects[0].id);
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Toggle between Main Role View and Rating Matrix Table */}
        {showRatingMatrixView ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowRatingMatrixView(false)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                ← Asosiy kabinetga qaytish
              </button>
            </div>
            <RatingMatrixView
              subjects={subjects}
              topics={topics}
              groups={groups}
              matrixData={matrixData}
              selectedSubjectId={matrixSubjectId}
              onSelectSubjectId={handleMatrixSubjectChange}
            />
          </div>
        ) : (
          <>
            {/* 1. STUDENT VIEW */}
            {currentUser.role === 'STUDENT' && (
              <StudentCabinet
                currentUser={currentUser}
                subjects={subjects}
                topics={topics}
                attempts={attempts}
                activeSubscription={activeSubscription}
                articles={articles}
                onSelectTopic={(t) => setSelectedTopicForLecture(t)}
                onOpenTest={(t) => setSelectedTopicForTest(t)}
                onOpenSubscription={() => setShowSubscriptionModal(true)}
                onOpenArticleOrder={() => setShowArticleOrderModal(true)}
              />
            )}

            {/* 2. TEACHER / AUTHOR VIEW */}
            {(currentUser.role === 'TEACHER' || currentUser.role === 'AUTHOR') && (
              <TeacherCabinet
                currentUser={currentUser}
                subjects={subjects}
                topics={topics}
                groups={groups}
                students={(allUsers || []).filter(u => u.role === 'STUDENT')}
                articles={articles}
                onCreateTopic={handleCreateTopic}
                onUpdateTopic={handleUpdateTopic}
                onDeleteTopic={handleDeleteTopic}
                onCreateGroup={handleCreateGroup}
                onUpdateArticle={handleUpdateArticle}
                onOpenRatings={(subjId) => {
                  setShowRatingMatrixView(true);
                  if (subjId) handleMatrixSubjectChange(subjId);
                }}
              />
            )}

            {/* 3. SUPER ADMIN VIEW */}
            {currentUser.role === 'ADMIN' && (
              <AdminCabinet
                currentUser={currentUser}
                subjects={subjects}
                topics={topics}
                groups={groups}
                users={allUsers}
                articles={articles}
                subscriptions={subscriptions}
                payments={payments}
                settings={settings}
                stats={stats}
                onCreateSubject={handleCreateSubject}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={handleDeleteSubject}
                onUpdateSettings={handleUpdateSettings}
                onCreateUser={async () => {}}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              Talabalar Bilimini Baholash & Ilmiy Maqola Xizmatlari
            </span>
            <span>•</span>
            <span>O'zbekiston Respublikasi Oliy Ta'lim Standartlari</span>
          </div>
          <div className="flex items-center gap-4">
            <span>6 Oylik Ta'lim Obunasi</span>
            <span>Mustaqil Ilmiy Maqolalar</span>
            <span>Bir martalik test tizimi (60% o'tish)</span>
          </div>
        </div>
      </footer>

      {/* LECTURE DETAIL MODAL */}
      {selectedTopicForLecture && (
        <TopicDetailModal
          topic={selectedTopicForLecture}
          attempt={attempts.find(a => a.studentId === currentUser.id && a.topicId === selectedTopicForLecture.id)}
          onClose={() => setSelectedTopicForLecture(null)}
          onStartTest={() => {
            const topic = selectedTopicForLecture;
            setSelectedTopicForLecture(null);
            setSelectedTopicForTest(topic);
          }}
        />
      )}

      {/* TEST TAKER MODAL */}
      {selectedTopicForTest && (
        <TestTakerModal
          topic={selectedTopicForTest}
          existingAttempt={attempts.find(a => a.studentId === currentUser.id && a.topicId === selectedTopicForTest.id)}
          onClose={() => setSelectedTopicForTest(null)}
          onSubmitTest={handleTestSubmit}
        />
      )}

      {/* 6-MONTH SUBSCRIPTION MODAL */}
      {showSubscriptionModal && (
        <SubscriptionModal
          currentUser={currentUser}
          currentSubscription={activeSubscription}
          settings={settings}
          onClose={() => setShowSubscriptionModal(false)}
          onPurchase={handlePurchaseSubscription}
        />
      )}

      {/* SCIENTIFIC ARTICLE ORDER MODAL (INDEPENDENT SERVICE) */}
      {showArticleOrderModal && (
        <ArticleOrderModal
          currentUser={currentUser}
          settings={settings}
          onClose={() => setShowArticleOrderModal(false)}
          onSuccessOrder={handleOrderArticle}
        />
      )}
    </div>
  );
}

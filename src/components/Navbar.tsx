import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Bell,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  CreditCard,
  X
} from 'lucide-react';
import { User, Subscription, NotificationItem, UserRole } from '../types';

interface NavbarProps {
  currentUser: User | null;
  allUsers?: User[];
  onSwitchUser?: (userId: string) => void;
  onSwitchRole?: (userId: string) => void;
  activeSubscription?: Subscription;
  notifications?: NotificationItem[];
  onMarkNotificationRead?: (id?: string) => void;
  onOpenArticleOrder?: () => void;
  onOpenArticleModal?: () => void;
  onOpenSubscription?: () => void;
  onOpenSubscriptionModal?: () => void;
  activeView?: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'RATINGS';
  setActiveView?: (view: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'RATINGS') => void;
  activeRoleView?: UserRole;
  onOpenRatings?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers = [],
  onSwitchUser,
  onSwitchRole,
  activeSubscription,
  notifications = [],
  onMarkNotificationRead = (_id?: string) => {},
  onOpenArticleOrder,
  onOpenArticleModal,
  onOpenSubscription,
  onOpenSubscriptionModal,
  activeView,
  setActiveView,
  activeRoleView,
  onOpenRatings,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const safeNotifications = notifications || [];
  const safeAllUsers = allUsers || [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  const handleSwitchUser = onSwitchRole || onSwitchUser || (() => {});
  const handleOpenSubscription = onOpenSubscription || onOpenSubscriptionModal || (() => {});
  const handleOpenArticle = onOpenArticleOrder || onOpenArticleModal || (() => {});
  const handleLogout = onLogout || (() => { localStorage.removeItem('auth_token'); window.location.reload(); });

  const currentActiveView = activeView || (activeRoleView as any) || 'STUDENT';

  // Calculate remaining days for subscription
  const getSubscriptionInfo = () => {
    if (!activeSubscription || activeSubscription.status !== 'ACTIVE') {
      return { isExpired: true, daysLeft: 0, text: 'Obuna faol emas' };
    }
    const end = new Date(activeSubscription.endDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return {
      isExpired: diffDays <= 0,
      daysLeft: Math.max(0, diffDays),
      text: `${diffDays} kun qoldi`
    };
  };

  const subInfo = getSubscriptionInfo();

  if (!currentUser) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top utility notification bar if subscription is expiring soon or expired */}
      {currentUser.role === 'STUDENT' && (
        <div className={`px-4 py-1.5 text-xs font-medium flex items-center justify-between transition-colors ${
          subInfo.isExpired 
            ? 'bg-rose-50 border-b border-rose-200 text-rose-800' 
            : subInfo.daysLeft <= 15 
              ? 'bg-amber-50 border-b border-amber-200 text-amber-900'
              : 'bg-emerald-50/60 border-b border-emerald-100 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>
              {subInfo.isExpired ? (
                <><strong>Obunangiz muddati tugagan.</strong> Platforma fanlari va testlaridan to‘liq foydalanish uchun obunani uzaytiring.</>
              ) : (
                <><strong>6 Oylik Ta’lim Obunasi:</strong> Holati: FAOL ({subInfo.text} • Tugash sanasi: {activeSubscription ? new Date(activeSubscription.endDate).toLocaleDateString() : ''})</>
              )}
            </span>
            <button
              onClick={handleOpenSubscription}
              className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer underline transition-colors ${
                subInfo.isExpired
                  ? 'bg-rose-600 text-white no-underline hover:bg-rose-700'
                  : 'text-emerald-900 hover:text-emerald-950'
              }`}
            >
              {subInfo.isExpired ? 'Obunani faollashtirish' : 'Obunani uzaytirish'}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">EduPlatform</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold tracking-wide border border-indigo-100">
                OTM BAHOLASH & MAQOLA
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-500 font-normal">
              Talabalar bilimini baholash va ilmiy maqola xizmatlari
            </p>
          </div>
        </div>

        {/* Center navigation tabs (role aware) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => {
              if (setActiveView) setActiveView('STUDENT');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentActiveView === 'STUDENT'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Talaba Kabineti
            </span>
          </button>
          
          <button
            onClick={() => {
              if (setActiveView) setActiveView('TEACHER');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentActiveView === 'TEACHER'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              O‘qituvchi Kabineti
            </span>
          </button>

          <button
            onClick={() => {
              if (onOpenRatings) onOpenRatings();
              if (setActiveView) setActiveView('RATINGS');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentActiveView === 'RATINGS'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Reyting Jadvali
            </span>
          </button>

          <button
            onClick={() => {
              if (setActiveView) setActiveView('ADMIN');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentActiveView === 'ADMIN'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin
            </span>
          </button>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Scientific Article Ordering Fast Button (Spec requirement: Maqola xizmati alohida mustaqil) */}
          <button
            onClick={handleOpenArticle}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Maqola yozdirish</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-amber-700/60 text-[10px] uppercase font-bold tracking-wider">
              Alohida xizmat
            </span>
          </button>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Bildirishnomalar"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">Bildirishnomalar</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
                        {unreadCount} yangi
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onMarkNotificationRead();
                      setShowNotifications(false);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Barchasini o‘qilgan qilish
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {safeNotifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Hozircha yangi bildirishnomalar mavjud emas
                    </div>
                  ) : (
                    safeNotifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                          !n.read ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <div className="font-semibold text-slate-800 flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer text-left"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                  currentUser.role === 'ADMIN' ? 'text-purple-600' :
                  currentUser.role === 'TEACHER' ? 'text-blue-600' :
                  currentUser.role === 'AUTHOR' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {currentUser.role === 'ADMIN' ? 'Super Admin' :
                   currentUser.role === 'TEACHER' ? 'O‘qituvchi' :
                   currentUser.role === 'AUTHOR' ? 'Maqola Muallifi' : 'Talaba'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Quick Switch Role Drawer / Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Foydalanuvchi va Rolni almashtirish
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Platformani har xil rollarda tekshirish uchun bosing:
                  </p>
                </div>
                <div className="py-1">
                  {safeAllUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        handleSwitchUser(u.id);
                        setShowUserDropdown(false);
                        if (setActiveView) {
                          if (u.role === 'ADMIN') setActiveView('ADMIN');
                          else if (u.role === 'TEACHER' || u.role === 'AUTHOR') setActiveView('TEACHER');
                          else setActiveView('STUDENT');
                        }
                      }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                        u.id === currentUser.id ? 'bg-indigo-50/60 font-semibold' : ''
                      }`}
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-800 truncate font-medium">{u.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                            u.role === 'ADMIN' ? 'bg-purple-500' :
                            u.role === 'TEACHER' ? 'bg-blue-500' :
                            u.role === 'AUTHOR' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          {u.role === 'ADMIN' ? 'Super Admin' :
                           u.role === 'TEACHER' ? 'O‘qituvchi' :
                           u.role === 'AUTHOR' ? 'Maqola muallifi' : 'Talaba'}
                        </div>
                      </div>
                      {u.id === currentUser.id && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-1 pb-1 px-2">
                  <button
                    onClick={() => { setShowUserDropdown(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Tizimdan chiqish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

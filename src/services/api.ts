import {
  User,
  Group,
  Subject,
  Topic,
  TestAttempt,
  Subscription,
  ArticleOrder,
  PaymentTransaction,
  NotificationItem,
  AdminSettings,
  Question
} from '../types';

// Token helper
function authHeaders(extra?: Record<string, string>) {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
    ...(extra || {}),
  };
}

export const api = {
  // Token getter (App.tsx uchun)
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Logout
  logout() {
    localStorage.removeItem('auth_token');
  },

  // Current session (token bilan)
  async getCurrentSession(): Promise<{ user: User; activeSubscription?: Subscription }> {
    const res = await fetch('/api/auth/me', { headers: authHeaders() });
    if (!res.ok) {
      // Fallback: legacy endpoint
      const res2 = await fetch('/api/auth/current', { headers: authHeaders() });
      if (!res2.ok) throw new Error('Tizimga kirish talab etiladi');
      return res2.json();
    }
    return res.json();
  },

  async switchUser(userId: string): Promise<{ user: User; activeSubscription?: Subscription }> {
    const res = await fetch('/api/auth/switch-user', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Foydalanuvchini almashtirishda xatolik');
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users', { headers: authHeaders() });
    return res.json();
  },

  async createUser(userData: Partial<User>): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  // Groups
  async getGroups(): Promise<Group[]> {
    const res = await fetch('/api/groups');
    return res.json();
  },

  async createGroup(group: Partial<Group>): Promise<Group> {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(group),
    });
    return res.json();
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const res = await fetch('/api/subjects');
    return res.json();
  },

  async createSubject(subject: Partial<Subject>): Promise<Subject> {
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subject),
    });
    return res.json();
  },

  async updateSubject(id: string, subject: Partial<Subject>): Promise<Subject> {
    const res = await fetch(`/api/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subject),
    });
    return res.json();
  },

  async deleteSubject(id: string): Promise<void> {
    await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
  },

  // Topics
  async getTopics(subjectId?: string): Promise<Topic[]> {
    const url = subjectId ? `/api/topics?subjectId=${encodeURIComponent(subjectId)}` : '/api/topics';
    const res = await fetch(url);
    return res.json();
  },

  async createTopic(topic: Partial<Topic>): Promise<Topic> {
    const res = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic),
    });
    return res.json();
  },

  async updateTopic(id: string, topic: Partial<Topic>): Promise<Topic> {
    const res = await fetch(`/api/topics/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic),
    });
    return res.json();
  },

  async deleteTopic(id: string): Promise<void> {
    await fetch(`/api/topics/${id}`, { method: 'DELETE' });
  },

  // Tests (Strict single attempt)
  async getAttempts(params?: { studentId?: string; topicId?: string; subjectId?: string }): Promise<TestAttempt[]> {
    const q = new URLSearchParams();
    if (params?.studentId) q.append('studentId', params.studentId);
    if (params?.topicId) q.append('topicId', params.topicId);
    if (params?.subjectId) q.append('subjectId', params.subjectId);
    const res = await fetch(`/api/tests/attempts?${q.toString()}`);
    return res.json();
  },

  async submitTest(studentId: string, topicId: string, userAnswers: Record<string, 'A'|'B'|'C'|'D'>): Promise<TestAttempt> {
    const res = await fetch('/api/tests/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, topicId, userAnswers }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Test topshirishda xatolik yuz berdi');
    }
    return data;
  },

  // Ratings
  async getRatings(subjectId?: string, groupId?: string): Promise<{
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
  }> {
    const q = new URLSearchParams();
    if (subjectId) q.append('subjectId', subjectId);
    if (groupId) q.append('groupId', groupId);
    const res = await fetch(`/api/ratings?${q.toString()}`);
    return res.json();
  },

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    const res = await fetch('/api/subscriptions');
    return res.json();
  },

  async purchaseSubscription(studentId: string, paymentMethod: string): Promise<Subscription> {
    const res = await fetch('/api/subscriptions/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, paymentMethod }),
    });
    if (!res.ok) throw new Error('Obunani faollashtirishda xatolik');
    return res.json();
  },

  // Articles
  async getArticles(params?: { studentId?: string; assignedTo?: string }): Promise<ArticleOrder[]> {
    const q = new URLSearchParams();
    if (params?.studentId) q.append('studentId', params.studentId);
    if (params?.assignedTo) q.append('assignedTo', params.assignedTo);
    const res = await fetch(`/api/articles?${q.toString()}`);
    return res.json();
  },

  async createArticleOrder(orderData: Partial<ArticleOrder>): Promise<ArticleOrder> {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Maqola buyurtmasini yaratishda xatolik');
    return res.json();
  },

  async updateArticleOrder(id: string, updates: Partial<ArticleOrder>): Promise<ArticleOrder> {
    const res = await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Maqola buyurtmasini yangilashda xatolik');
    return res.json();
  },

  // Payments
  async getPayments(): Promise<PaymentTransaction[]> {
    const res = await fetch('/api/payments');
    return res.json();
  },

  // Admin Stats & Settings
  async getAdminStats(): Promise<{
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
    subscriptionRevenue: number;
    articleRevenue: number;
    totalRevenue: number;
  }> {
    const res = await fetch('/api/admin/stats');
    return res.json();
  },

  async getAdminSettings(): Promise<AdminSettings> {
    const res = await fetch('/api/admin/settings');
    return res.json();
  },

  async updateAdminSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Notifications
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`/api/notifications${q}`);
    return res.json();
  },

  async markNotificationRead(id?: string, userId?: string): Promise<void> {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, userId }),
    });
  },

  // AI Quiz Generator
  async generateQuiz(topicTitle: string, lectureText: string, count: number = 5): Promise<{ questions: Question[] }> {
    const res = await fetch('/api/ai/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicTitle, lectureText, count }),
    });
    if (!res.ok) throw new Error('AI test generatsiya qilishda xatolik');
    return res.json();
  }
};

// ─── TO'LOV TIZIMI ────────────────────────────────────────────────────────────
export const paymentApi = {

  // To'lov yaratish (redirect yoki inline)
  async create(opts: {
    type: 'SUBSCRIPTION' | 'ARTICLE';
    userId: string;
    amount: number;
    provider: 'Click' | 'Payme' | 'Uzum' | 'Stripe';
    mode: 'redirect' | 'inline';
    orderId?: string;
    description: string;
    returnUrl?: string;
    token?: string;
  }) {
    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(opts.token ? { Authorization: 'Bearer ' + opts.token } : {}),
      },
      body: JSON.stringify(opts),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).error || "To'lov yaratishda xatolik");
    }
    return res.json() as Promise<{
      paymentId: string;
      status: 'PENDING';
      mode: 'redirect' | 'inline';
      redirectUrl?: string;
      inlineToken?: string;
      inlineData?: { merchantId: string; amount: number; currency: string; orderId: string; description: string };
    }>;
  },

  // To'lov holatini so'rash (polling uchun)
  async getStatus(paymentId: string, token?: string) {
    const res = await fetch('/api/payments/status/' + paymentId, {
      headers: token ? { Authorization: 'Bearer ' + token } : {},
    });
    if (!res.ok) throw new Error("To'lov holati topilmadi");
    return res.json() as Promise<{
      paymentId: string;
      status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
      provider: string;
      amount: number;
      paidAt?: string;
    }>;
  },

  // Redirect to'lovini boshlash — to'lov sahifasiga yo'naltiradi
  async startRedirect(opts: { type: 'SUBSCRIPTION' | 'ARTICLE'; userId: string; amount: number; provider: 'Click' | 'Payme' | 'Uzum' | 'Stripe'; orderId?: string; description: string; token?: string; returnUrl?: string }) {
    const data = await paymentApi.create({ ...opts, mode: 'redirect' });
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
    return data;
  },

  // Inline to'lov uchun ma'lumot olish
  async getInlineData(opts: { type: 'SUBSCRIPTION' | 'ARTICLE'; userId: string; amount: number; provider: 'Click' | 'Payme' | 'Uzum' | 'Stripe'; orderId?: string; description: string; token?: string }) {
    return paymentApi.create({ ...opts, mode: 'inline' });
  },

  // To'lov muvaffaqiyatli bo'lgunga qadar tekshirish (max 60 soniya)
  async waitForSuccess(paymentId: string, token?: string, timeoutMs = 60000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const s = await paymentApi.getStatus(paymentId, token);
        if (s.status === 'SUCCESS') return true;
        if (s.status === 'FAILED' || s.status === 'CANCELLED') return false;
      } catch {}
    }
    return false;
  },
};

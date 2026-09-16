import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  initialSettings, initialUsers, initialGroups, initialSubjects,
  initialTopics, initialAttempts, initialSubscriptions,
  initialArticleOrders, initialPayments, initialNotifications
} from './src/data/initialData.ts';
import {
  User, Group, Subject, Topic, TestAttempt, Subscription,
  ArticleOrder, PaymentTransaction, NotificationItem, AdminSettings
} from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET        = process.env.JWT_SECRET        || 'dev-jwt-secret-change-in-prod';
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@eduplatform.uz';
const SUPER_ADMIN_PASS  = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!';

// ─── In-memory state ──────────────────────────────────────────────────────────
let settings: AdminSettings           = { ...initialSettings };
let users: User[]                     = [...initialUsers];
let groups: Group[]                   = [...initialGroups];
let subjects: Subject[]               = [...initialSubjects];
let topics: Topic[]                   = [...initialTopics];
let attempts: TestAttempt[]           = [...initialAttempts];
let subscriptions: Subscription[]     = [...initialSubscriptions];
let articleOrders: ArticleOrder[]     = [...initialArticleOrders];
let payments: PaymentTransaction[]    = [...initialPayments];
let notifications: NotificationItem[] = [...initialNotifications];

// Pending payments (RAM, server restart bo'lgunga saqlanadi)
interface PendingPay {
  paymentId: string; provider: string; mode: string;
  type: string; userId: string; amount: number;
  orderId?: string; description: string; createdAt: string;
}
const pendingPayments = new Map<string, PendingPay>();

// ─── JWT helpers ──────────────────────────────────────────────────────────────
function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

// ─── Auth middleware ──────────────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Tizimga kirish talab etiladi' });
  try {
    const p = verifyToken(h.slice(7)) as any;
    (req as any).userId   = p.id;
    (req as any).userRole = p.role;
    next();
  } catch { return res.status(401).json({ error: 'Token yaroqsiz yoki muddati tugagan' }); }
}
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if ((req as any).userRole !== 'ADMIN')
      return res.status(403).json({ error: 'Faqat Super Admin uchun ruxsat' });
    next();
  });
}
function safeUser(u: User) {
  const { passwordHash, ...rest } = u as any;
  return rest;
}

// ─── Payment finalize helper ──────────────────────────────────────────────────
async function finalizePayment(paymentId: string, externalId: string, provider: string) {
  const pending = pendingPayments.get(paymentId);
  if (!pending) return { ok: false, error: 'Pending payment not found' };
  const paidAt = new Date().toISOString();
  const user = users.find(u => u.id === pending.userId);
  const txn: PaymentTransaction = {
    id: paymentId,
    type: pending.type as any,
    userId: pending.userId,
    userName: user?.name || 'Foydalanuvchi',
    amount: pending.amount,
    currency: 'UZS',
    status: 'SUCCESS',
    paymentMethod: provider as any,
    referenceId: paymentId,
    description: pending.description,
    createdAt: pending.createdAt,
    paidAt,
  };
  payments.unshift(txn);

  if (pending.type === 'SUBSCRIPTION') {
    const startDate = new Date();
    const endDate   = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (settings.subscriptionDurationMonths || 6));
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      studentId: pending.userId,
      studentName: user?.name || 'Talaba',
      planName: "6 oylik to'liq ta'lim obunasi",
      durationMonths: settings.subscriptionDurationMonths || 6,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'ACTIVE',
      amount: pending.amount,
      paymentMethod: provider,
      paymentReference: paymentId,
    };
    subscriptions = subscriptions.map(s =>
      s.studentId === pending.userId ? { ...s, status: 'EXPIRED' as const } : s
    );
    subscriptions.unshift(newSub);
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: pending.userId,
      role: 'STUDENT',
      title: "Obuna faollashtirildi!",
      message: `${provider} orqali to'lov qabul qilindi. Obunangiz ${endDate.toLocaleDateString('uz-Latn')} gacha faol.`,
      type: 'SUBSCRIPTION',
      read: false,
      createdAt: paidAt,
    });
  } else if (pending.type === 'ARTICLE' && pending.orderId) {
    const idx = articleOrders.findIndex(a => a.id === pending.orderId);
    if (idx !== -1) {
      articleOrders[idx] = { ...articleOrders[idx], paymentStatus: 'PAID', status: 'NEW_ORDER', updatedAt: paidAt };
      notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: pending.userId,
        role: 'STUDENT',
        title: "To'lov qabul qilindi",
        message: `Maqola buyurtmangiz uchun to'lov ${provider} orqali amalga oshirildi.`,
        type: 'ARTICLE',
        read: false,
        createdAt: paidAt,
      });
    }
  }
  pendingPayments.delete(paymentId);
  return { ok: true, txn };
}

// ─── Lazy Gemini ─────────────────────────────────────────────────────────────
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try { aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); } catch {}
  }
  return aiClient;
}

// ═════════════════════════════════════════════════════════════════════════════
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.use(express.json({ limit: '15mb' }));

  // ── Health ─────────────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // ══════════════════════════════════════════════════════════════════════════
  // AUTH
  // ══════════════════════════════════════════════════════════════════════════

  // Super Admin login
  app.post('/api/auth/admin-login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email va parol kiritilishi shart' });
    if (email.toLowerCase().trim() !== SUPER_ADMIN_EMAIL.toLowerCase() || password !== SUPER_ADMIN_PASS)
      return res.status(401).json({ error: "Email yoki parol noto'g'ri" });
    let admin = users.find(u => u.role === 'ADMIN');
    if (!admin) {
      admin = { id: 'user-admin-1', name: 'Super Admin', email: SUPER_ADMIN_EMAIL, role: 'ADMIN', createdAt: new Date().toISOString(), authProvider: 'local' };
      users.unshift(admin);
    }
    res.json({ token: signToken({ id: admin.id, role: admin.role }), user: safeUser(admin) });
  });

  // Register
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, phone, specialty, institution, groupId } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Ism, email va parol kiritilishi shart' });
    if (password.length < 8) return res.status(400).json({ error: "Parol kamida 8 ta belgi bo'lishi kerak" });
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(409).json({ error: "Bu email allaqachon ro'yxatdan o'tgan" });
    const allowedRoles = ['STUDENT', 'TEACHER'];
    const passwordHash = await bcrypt.hash(password, 12);
    const newUser: User = {
      id: `user-${Date.now()}`, name,
      email: email.toLowerCase().trim(),
      role: allowedRoles.includes(role) ? role : 'STUDENT',
      phone, specialty,
      institution: institution || "Oliy Ta'lim Muassasasi",
      groupId, createdAt: new Date().toISOString(),
      authProvider: 'local', passwordHash,
    };
    users.push(newUser);
    res.status(201).json({ token: signToken({ id: newUser.id, role: newUser.role }), user: safeUser(newUser) });
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email va parol kiritilishi shart' });
    if (email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase())
      return res.status(403).json({ error: 'Admin uchun admin-login sahifasidan foydalaning' });
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) return res.status(401).json({ error: "Email yoki parol noto'g'ri" });
    if (user.authProvider === 'google') return res.status(400).json({ error: 'Bu akkaunt Google orqali ulangan.' });
    if (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: "Email yoki parol noto'g'ri" });
    res.json({ token: signToken({ id: user.id, role: user.role }), user: safeUser(user) });
  });

  // Google OAuth
  app.post('/api/auth/google', async (req, res) => {
    const { googleId, email, name, avatar } = req.body;
    if (!googleId || !email) return res.status(400).json({ error: "Google ma'lumotlari yetishmayapti" });
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())
      return res.status(403).json({ error: 'Admin akkauntiga Google orqali kirish taqiqlanadi' });
    let user = users.find(u => u.googleId === googleId || u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = { id: `user-${Date.now()}`, name, email: email.toLowerCase(), role: 'STUDENT', avatar, createdAt: new Date().toISOString(), authProvider: 'google', googleId };
      users.push(user);
    } else {
      user.googleId = googleId;
      if (avatar && !user.avatar) user.avatar = avatar;
    }
    res.json({ token: signToken({ id: user.id, role: user.role }), user: safeUser(user) });
  });

  // /me
  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = users.find(u => u.id === (req as any).userId);
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    const sub = subscriptions.find(s => s.studentId === user.id && s.status === 'ACTIVE');
    res.json({ user: safeUser(user), activeSubscription: sub });
  });

  // Legacy current
  app.get('/api/auth/current', (req, res) => {
    const h = req.headers.authorization;
    if (h?.startsWith('Bearer ')) {
      try {
        const p = verifyToken(h.slice(7)) as any;
        const user = users.find(u => u.id === p.id);
        if (user) {
          const sub = subscriptions.find(s => s.studentId === user.id && s.status === 'ACTIVE');
          return res.json({ user: safeUser(user), activeSubscription: sub });
        }
      } catch {}
    }
    const user = users.find(u => u.role === 'STUDENT') || users[0];
    const sub  = subscriptions.find(s => s.studentId === user.id && s.status === 'ACTIVE');
    res.json({ user: safeUser(user), activeSubscription: sub });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TO'LOV TIZIMI — Click, Payme, Uzum, Stripe
  // ══════════════════════════════════════════════════════════════════════════

  // To'lov yaratish
  app.post('/api/payments/create', requireAuth, (req, res) => {
    const { type, userId, amount, provider, mode, orderId, returnUrl, description } = req.body;
    if (!type || !userId || !amount || !provider || !mode)
      return res.status(400).json({ error: 'Kerakli maydonlar yetishmayapti' });
    const valid = ['Click', 'Payme', 'Uzum', 'Stripe'];
    if (!valid.includes(provider))
      return res.status(400).json({ error: "Noto'g'ri to'lov tizimi" });

    const paymentId = 'pay-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const appUrl    = process.env.APP_URL || 'http://localhost:3000';
    const successUrl = returnUrl || (appUrl + '/?payment=success&id=' + paymentId);
    const failUrl    = appUrl + '/?payment=failed&id=' + paymentId;

    pendingPayments.set(paymentId, {
      paymentId, provider, mode, type, userId,
      amount: Number(amount), orderId, description,
      createdAt: new Date().toISOString(),
    });

    // ── REDIRECT ──────────────────────────────────────────────────────────
    if (mode === 'redirect') {
      let redirectUrl = '';
      const clickMerchantId = process.env.CLICK_MERCHANT_ID || 'DEMO';
      const clickServiceId  = process.env.CLICK_SERVICE_ID  || 'DEMO';
      const paymeMerchantId = process.env.PAYME_MERCHANT_ID || 'DEMO';
      const uzumMerchantId  = process.env.UZUM_MERCHANT_ID  || 'DEMO';

      if (provider === 'Click') {
        const p = new URLSearchParams({ service_id: clickServiceId, merchant_id: clickMerchantId, amount: String(amount), transaction_param: paymentId, return_url: successUrl });
        redirectUrl = 'https://my.click.uz/services/pay?' + p.toString();
      } else if (provider === 'Payme') {
        const encoded = Buffer.from(JSON.stringify({ m: paymeMerchantId, ac: { order_id: paymentId }, a: amount * 100, c: successUrl })).toString('base64');
        redirectUrl = 'https://checkout.paycom.uz/' + encoded;
      } else if (provider === 'Uzum') {
        const p = new URLSearchParams({ merchant_id: uzumMerchantId, amount: String(amount), order_id: paymentId, return_url: successUrl, cancel_url: failUrl });
        redirectUrl = 'https://checkout.uzumbank.uz/pay?' + p.toString();
      } else if (provider === 'Stripe') {
        const stripeKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
        redirectUrl = stripeKey
          ? appUrl + '/api/payments/stripe-session?paymentId=' + paymentId
          : appUrl + '/api/payments/stripe-demo?paymentId=' + paymentId + '&amount=' + amount + '&successUrl=' + encodeURIComponent(successUrl);
      }
      return res.json({ paymentId, status: 'PENDING', mode: 'redirect', redirectUrl });
    }

    // ── INLINE ────────────────────────────────────────────────────────────
    const inlineData = {
      merchantId:  process.env[provider.toUpperCase() + '_MERCHANT_ID'] || 'DEMO_' + provider.toUpperCase(),
      amount: Number(amount),
      currency: 'UZS',
      orderId: paymentId,
      description,
    };
    let inlineToken: string | undefined;
    if (provider === 'Click')  inlineToken = process.env.CLICK_SECRET_KEY || 'DEMO_CLICK_TOKEN';
    if (provider === 'Payme')  inlineToken = process.env.PAYME_SECRET_KEY || 'DEMO_PAYME_TOKEN';
    if (provider === 'Uzum')   inlineToken = process.env.UZUM_SECRET_KEY  || 'DEMO_UZUM_TOKEN';
    if (provider === 'Stripe') inlineToken = process.env.STRIPE_PUBLISHABLE_KEY || 'DEMO_STRIPE_PK';

    res.json({ paymentId, status: 'PENDING', mode: 'inline', inlineToken, inlineData });
  });

  // To'lov holati
  app.get('/api/payments/status/:paymentId', requireAuth, (req, res) => {
    const { paymentId } = req.params;
    const done = payments.find(p => p.referenceId === paymentId || p.id === paymentId);
    if (done) return res.json({ paymentId, status: done.status, provider: done.paymentMethod, amount: done.amount, paidAt: done.paidAt || done.createdAt });
    const pending = pendingPayments.get(paymentId);
    if (pending) return res.json({ paymentId, status: 'PENDING', provider: pending.provider, amount: pending.amount });
    return res.status(404).json({ error: "To'lov topilmadi" });
  });

  // ── WEBHOOKS / CALLBACKS ──────────────────────────────────────────────────

  // Click callback
  app.post('/api/payments/callback/click', async (req, res) => {
    const { click_trans_id, merchant_trans_id, status } = req.body;
    if (Number(status) === 2) await finalizePayment(merchant_trans_id, String(click_trans_id), 'Click');
    res.json({ error: 0, error_note: 'Success' });
  });

  // Payme callback (JSON-RPC)
  app.post('/api/payments/callback/payme', async (req, res) => {
    const { method, params, id } = req.body;
    if (method === 'PerformTransaction') {
      const orderId  = params?.account?.order_id;
      const transId  = params?.id;
      await finalizePayment(orderId, String(transId), 'Payme');
      res.json({ jsonrpc: '2.0', id, result: { transaction: transId, perform_time: Date.now(), state: 2 } });
    } else {
      res.json({ jsonrpc: '2.0', id, result: {} });
    }
  });

  // Uzum callback
  app.post('/api/payments/callback/uzum', async (req, res) => {
    const { order_id, transaction_id, status } = req.body;
    if (status === 'SUCCESS') await finalizePayment(order_id, String(transaction_id), 'Uzum');
    res.json({ status: 'ok' });
  });

  // Stripe webhook
  app.post('/api/payments/callback/stripe', async (req, res) => {
    const { type, data } = req.body;
    if (type === 'checkout.session.completed') {
      const session = data?.object;
      await finalizePayment(session?.metadata?.paymentId, session?.id, 'Stripe');
    }
    res.json({ received: true });
  });

  // Demo: to'lovni muvaffaqiyatli tugallash (faqat dev)
  app.get('/api/payments/demo-success/:paymentId', async (req, res) => {
    if (process.env.NODE_ENV === 'production') return res.status(404).send('Not found');
    const result = await finalizePayment(req.params.paymentId, 'DEMO-' + Date.now(), 'Demo');
    if (result.ok) res.redirect('/?payment=success&id=' + req.params.paymentId);
    else res.status(400).json({ error: result.error });
  });

  // Stripe demo to'lov sahifasi
  app.get('/api/payments/stripe-demo', (req, res) => {
    const pid = String((req.query as any).paymentId || '');
    const rawAmt = parseFloat(String((req.query as any).amount || '0'));
    const amt = rawAmt.toLocaleString('uz-Latn') + ' UZS';
    const href = '/api/payments/demo-success/' + pid;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(
      '<!DOCTYPE html><html lang="uz"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>Stripe Demo</title><style>' +
      'body{font-family:system-ui,sans-serif;background:#f0f4ff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}' +
      '.c{background:#fff;border-radius:16px;padding:32px;max-width:400px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.12);text-align:center}' +
      'h2{color:#1e293b;margin:0 0 6px}p{color:#64748b;font-size:14px}' +
      '.amt{font-size:28px;font-weight:800;color:#4f46e5;margin:16px 0 20px}' +
      'input{display:block;width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;margin-bottom:10px}' +
      '.row{display:flex;gap:8px;margin-bottom:20px}' +
      '.row input{margin:0;flex:1}' +
      '.btn{display:block;width:100%;padding:13px;border-radius:10px;border:none;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:10px}' +
      '.pay{background:#4f46e5;color:#fff}.cancel{background:#f1f5f9;color:#475569}' +
      '.note{font-size:11px;color:#94a3b8;margin-top:8px}' +
      '</style></head><body><div class="c">' +
      '<div style="font-size:40px">&#128179;</div>' +
      '<h2>Stripe To\'lov (Demo)</h2>' +
      '<p>Demo rejim — haqiqiy pullar yechilmaydi</p>' +
      '<div class="amt">' + amt + '</div>' +
      '<input placeholder="Karta raqami: 4242 4242 4242 4242">' +
      '<div class="row"><input placeholder="MM/YY"><input placeholder="CVC"></div>' +
      '<button class="btn pay" onclick="window.location.href=\'' + href + '\'">To\'lovni tasdiqlash &#10003;</button>' +
      '<button class="btn cancel" onclick="history.back()">Bekor qilish</button>' +
      '<p class="note">&#128274; Demo Stripe Checkout &bull; Sinov uchun</p>' +
      '</div></body></html>'
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // USERS
  // ══════════════════════════════════════════════════════════════════════════
  app.get('/api/users', requireAuth, (_req, res) => res.json(users.map(safeUser)));

  app.post('/api/users', requireAdmin, async (req, res) => {
    const { name, email, role, phone, specialty, institution, groupId, password } = req.body;
    if (users.find(u => u.email.toLowerCase() === email?.toLowerCase()))
      return res.status(409).json({ error: 'Bu email allaqachon mavjud' });
    const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;
    const newUser: User = {
      id: `user-${Date.now()}`, name, email: email.toLowerCase(),
      role: role || 'STUDENT', groupId, phone, specialty,
      institution: institution || "Oliy Ta'lim Muassasasi",
      createdAt: new Date().toISOString(), authProvider: 'local', passwordHash,
    };
    users.push(newUser);
    res.status(201).json(safeUser(newUser));
  });

  // ══════════════════════════════════════════════════════════════════════════
  // GROUPS
  // ══════════════════════════════════════════════════════════════════════════
  app.get('/api/groups', requireAuth, (_req, res) => res.json(groups));
  app.post('/api/groups', requireAuth, (req, res) => {
    const g: Group = { id: `group-${Date.now()}`, name: req.body.name, faculty: req.body.faculty || 'Umumiy', course: Number(req.body.course) || 1, studentCount: 0, teacherId: req.body.teacherId };
    groups.push(g);
    res.status(201).json(g);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SUBJECTS
  // ══════════════════════════════════════════════════════════════════════════
  app.get('/api/subjects', requireAuth, (_req, res) => {
    res.json(subjects.map(s => ({ ...s, topicCount: topics.filter(t => t.subjectId === s.id).length })));
  });
  app.post('/api/subjects', requireAuth, (req, res) => {
    const s: Subject = {
      id: `subj-${Date.now()}`, name: req.body.name,
      code: req.body.code || ('FAN-' + Math.floor(100 + Math.random() * 900)),
      description: req.body.description || '', iconName: req.body.iconName || 'BookOpen',
      category: req.body.category || 'Asosiy fanlar',
      teacherId: req.body.teacherId || 'user-teacher-1',
      teacherName: req.body.teacherName || 'Muallim', topicCount: 0,
      createdAt: new Date().toISOString(),
    };
    subjects.push(s);
    res.status(201).json(s);
  });
  app.put('/api/subjects/:id', requireAuth, (req, res) => {
    const i = subjects.findIndex(s => s.id === req.params.id);
    if (i === -1) return res.status(404).json({ error: 'Fan topilmadi' });
    subjects[i] = { ...subjects[i], ...req.body };
    res.json(subjects[i]);
  });
  app.delete('/api/subjects/:id', requireAuth, (req, res) => {
    subjects = subjects.filter(s => s.id !== req.params.id);
    topics   = topics.filter(t => t.subjectId !== req.params.id);
    res.json({ success: true });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TOPICS
  // ══════════════════════════════════════════════════════════════════════════
  app.get('/api/topics', requireAuth, (req, res) => {
    const { subjectId } = req.query;
    res.json(subjectId ? topics.filter(t => t.subjectId === subjectId) : topics);
  });
  app.post('/api/topics', requireAuth, (req, res) => {
    const nextNum = req.body.topicNumber || (topics.filter(t => t.subjectId === req.body.subjectId).length + 1);
    const t: Topic = {
      id: `top-${Date.now()}`, subjectId: req.body.subjectId, topicNumber: Number(nextNum),
      title: req.body.title, description: req.body.description || '',
      lectureText: req.body.lectureText || '',
      pdfFileName: req.body.pdfFileName || (nextNum + '-mavzu_maruza.pdf'),
      pdfFileSize: req.body.pdfFileSize || '2.2 MB',
      wordFileName: req.body.wordFileName || (nextNum + '-mavzu_maruza.docx'),
      wordFileSize: req.body.wordFileSize || '750 KB',
      additionalMaterials: req.body.additionalMaterials || [],
      passingScore: Number(req.body.passingScore) || settings.defaultPassingScore,
      questions: req.body.questions || [], createdAt: new Date().toISOString(),
    };
    topics.push(t);
    notifications.unshift({ id: `notif-${Date.now()}`, userId: 'user-student-1', role: 'STUDENT', title: "Yangi mavzu qo'shildi", message: '"' + t.title + '" mavzusi joylandi.', type: 'SYSTEM', read: false, createdAt: new Date().toISOString() });
    res.status(201).json(t);
  });
  app.put('/api/topics/:id', requireAuth, (req, res) => {
    const i = topics.findIndex(t => t.id === req.params.id);
    if (i === -1) return res.status(404).json({ error: 'Mavzu topilmadi' });
    topics[i] = { ...topics[i], ...req.body };
    res.json(topics[i]);
  });
  app.delete('/api/topics/:id', requireAuth, (req, res) => {
    topics   = topics.filter(t => t.id !== req.params.id);
    attempts = attempts.filter(a => a.topicId !== req.params.id);
    res.json({ success: true });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TESTS
  // ══════════════════════════════════════════════════════════════════════════
  app.get('/api/tests/attempts', requireAuth, (req, res) => {
    const { studentId, topicId, subjectId } = req.query;
    let list = [...attempts];
    if (studentId) list = list.filter(a => a.studentId === studentId);
    if (topicId)   list = list.filter(a => a.topicId   === topicId);
    if (subjectId) list = list.filter(a => a.subjectId === subjectId);
    res.json(list);
  });
  app.post('/api/tests/submit', requireAuth, (req, res) => {
    const { studentId, topicId, userAnswers } = req.body;
    if (!studentId || !topicId || !userAnswers) return res.status(400).json({ error: 'Kerakli parametrlar yetishmaydi' });
    const existing = attempts.find(a => a.studentId === studentId && a.topicId === topicId);
    if (existing) return res.status(403).json({ error: "Ushbu mavzu bo'yicha test avval topshirilgan.", attempt: existing });
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return res.status(404).json({ error: 'Mavzu topilmadi' });
    const student = users.find(u => u.id === studentId);
    const total = topic.questions.length;
    let correct = 0;
    topic.questions.forEach(q => { if (userAnswers[q.id]?.toUpperCase() === q.correctOption.toUpperCase()) correct++; });
    const scorePercentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passingScore    = topic.passingScore || settings.defaultPassingScore;
    const status          = scorePercentage >= passingScore ? 'PASSED' : 'FAILED';
    const att: TestAttempt = {
      id: `att-${Date.now()}`, studentId, studentName: student?.name || 'Talaba',
      groupId: student?.groupId || '', topicId, subjectId: topic.subjectId,
      totalQuestions: total, correctAnswers: correct, scorePercentage, passingScore,
      status, completedAt: new Date().toISOString(), userAnswers,
    };
    attempts.push(att);
    notifications.unshift({ id: `notif-${Date.now()}`, userId: studentId, role: 'STUDENT', title: status === 'PASSED' ? "Testdan o'tdingiz!" : "Test natijasi", message: '"' + topic.title + '" bo\'yicha: ' + scorePercentage + '%.', type: 'TEST', read: false, createdAt: new Date().toISOString() });
    res.status(201).json(att);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // RATINGS
  // ══════════════════════════════════════════════════════════════════════════
  app.get('/api/ratings', requireAuth, (req, res) => {
    const { subjectId, groupId } = req.query;
    let students = users.filter(u => u.role === 'STUDENT');
    if (groupId) students = students.filter(u => u.groupId === groupId);
    let tpcs = [...topics];
    if (subjectId) tpcs = tpcs.filter(t => t.subjectId === subjectId);
    tpcs.sort((a, b) => a.topicNumber - b.topicNumber);
    const matrix = students.map(student => {
      const sa = attempts.filter(a => a.studentId === student.id);
      const g  = groups.find(gr => gr.id === student.groupId);
      const topicResults: Record<string, { score: number; status: 'PASSED' | 'FAILED'; completedAt: string }> = {};
      let total = 0, done = 0, passed = 0;
      tpcs.forEach(t => {
        const a = sa.find(x => x.topicId === t.id);
        if (a) { topicResults[t.id] = { score: a.scorePercentage, status: a.status, completedAt: a.completedAt }; total += a.scorePercentage; done++; if (a.status === 'PASSED') passed++; }
      });
      return { studentId: student.id, studentName: student.name, groupName: g?.name || 'Guruhsiz', groupId: student.groupId, completedCount: done, passedCount: passed, totalTopics: tpcs.length, averageScore: done > 0 ? Math.round(total / done) : 0, topicResults };
    });
    matrix.sort((a, b) => b.averageScore - a.averageScore);
    res.json({ topics: tpcs, matrix });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS (legacy — yangi obunalar /payments/create orqali)
  // ══════════════════════════════════════════════════════════════════════════
  app.get('/api/subscriptions', requireAuth, (_req, res) => res.json(subscriptions));
  app.post('/api/subscriptions/purchase', requireAuth, async (req, res) => {
    const { studentId, paymentMethod } = req.body;
    const student = users.find(u => u.id === studentId);
    if (!student) return res.status(404).json({ error: 'Talaba topilmadi' });
    // Yangi to'lov orqali obuna yaratish
    const paymentId = 'pay-' + Date.now();
    const startDate = new Date();
    const endDate   = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (settings.subscriptionDurationMonths || 6));
    const newSub: Subscription = {
      id: `sub-${Date.now()}`, studentId, studentName: student.name,
      planName: "6 oylik to'liq ta'lim obunasi",
      durationMonths: settings.subscriptionDurationMonths || 6,
      startDate: startDate.toISOString(), endDate: endDate.toISOString(),
      status: 'ACTIVE', amount: settings.subscriptionPrice6Months,
      paymentMethod: paymentMethod || 'Click', paymentReference: paymentId,
    };
    subscriptions = subscriptions.map(s => s.studentId === studentId ? { ...s, status: 'EXPIRED' as const } : s);
    subscriptions.unshift(newSub);
    payments.unshift({
      id: paymentId, type: 'SUBSCRIPTION', userId: studentId, userName: student.name,
      amount: settings.subscriptionPrice6Months, currency: 'UZS', status: 'SUCCESS',
      paymentMethod: (paymentMethod || 'Click') as any, referenceId: paymentId,
      description: "6 oylik obuna", createdAt: new Date().toISOString(),
    });
    res.status(201).json(newSub);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ARTICLES
  // ══════════════════════════════════════════════════════════════════════════
  app.get('/api/articles', requireAuth, (req, res) => {
    const { studentId, assignedTo } = req.query;
    let list = [...articleOrders];
    if (studentId)  list = list.filter(a => a.studentId  === studentId);
    if (assignedTo) list = list.filter(a => a.assignedTo === assignedTo);
    res.json(list);
  });
  app.post('/api/articles', requireAuth, (req, res) => {
    const { studentId, title, articleType, volumePages, language, subjectArea, requirements, deadline, notes, amount, paymentMethod } = req.body;
    const student   = users.find(u => u.id === studentId);
    const orderNum  = 1000 + articleOrders.length + 1;
    const teacher   = users.find(u => u.role === 'TEACHER') || users.find(u => u.role === 'AUTHOR');
    const newOrder: ArticleOrder = {
      id: `art-${orderNum}`, orderNumber: orderNum, studentId,
      studentName: student?.name || 'Talaba', studentEmail: student?.email, studentPhone: student?.phone,
      title, articleType: articleType || 'OAK', volumePages: volumePages || '5-8 bet',
      language: language || "O'zbek", subjectArea: subjectArea || 'Umumiy soha',
      requirements: requirements || '', deadline: deadline || '7 kun', notes,
      amount: Number(amount) || settings.articleBasePriceOAK,
      paymentStatus: 'PAID', paymentMethod: paymentMethod || 'Click',
      status: 'NEW_ORDER', assignedTo: teacher?.id, assignedToName: teacher?.name,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    articleOrders.unshift(newOrder);
    payments.unshift({ id: `pay-${Date.now()}`, type: 'ARTICLE', userId: studentId, userName: student?.name || 'Talaba', amount: newOrder.amount, currency: 'UZS', status: 'SUCCESS', paymentMethod: (paymentMethod || 'Click') as any, referenceId: 'ART-' + orderNum, description: 'Maqola buyurtmasi #' + orderNum, createdAt: new Date().toISOString() });
    if (teacher) notifications.unshift({ id: `notif-${Date.now()}`, userId: teacher.id, role: 'TEACHER', title: 'YANGI BUYURTMA', message: 'Buyurtma #' + orderNum + ': "' + title + '"', type: 'ARTICLE', read: false, createdAt: new Date().toISOString() });
    res.status(201).json(newOrder);
  });
  app.put('/api/articles/:id', requireAuth, (req, res) => {
    const i = articleOrders.findIndex(a => a.id === req.params.id);
    if (i === -1) return res.status(404).json({ error: 'Buyurtma topilmadi' });
    const prev = articleOrders[i];
    articleOrders[i] = { ...prev, ...req.body, updatedAt: new Date().toISOString() };
    if (req.body.uploadedFile || req.body.status === 'READY') {
      notifications.unshift({ id: `notif-${Date.now()}`, userId: prev.studentId, role: 'STUDENT', title: 'Maqolangiz tayyor!', message: '"' + prev.title + '" maqolasi tayyorlandi.', type: 'ARTICLE', read: false, createdAt: new Date().toISOString() });
    }
    res.json(articleOrders[i]);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PAYMENTS LIST
  // ══════════════════════════════════════════════════════════════════════════
  app.get('/api/payments', requireAuth, (_req, res) => res.json(payments));

  // ══════════════════════════════════════════════════════════════════════════
  // ADMIN STATS & SETTINGS
  // ══════════════════════════════════════════════════════════════════════════
  app.get('/api/admin/stats', requireAuth, (_req, res) => {
    const subRev  = payments.filter(p => p.type === 'SUBSCRIPTION' && p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
    const artRev  = payments.filter(p => p.type === 'ARTICLE'      && p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
    const today   = new Date().toISOString().slice(0, 10);
    const todayRev = payments.filter(p => p.createdAt.startsWith(today) && p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
    res.json({
      totalUsers: users.length, activeUsers: users.filter(u => u.role === 'STUDENT').length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'ACTIVE').length,
      expiredSubscriptions: subscriptions.filter(s => s.status === 'EXPIRED').length,
      totalSubjects: subjects.length, totalTopics: topics.length,
      totalTests: topics.reduce((s, t) => s + (t.questions?.length || 0), 0),
      totalArticleOrders: articleOrders.length,
      completedArticles: articleOrders.filter(a => ['READY','COMPLETED','SENT_TO_USER'].includes(a.status)).length,
      pendingArticles:   articleOrders.filter(a => !['READY','COMPLETED','SENT_TO_USER'].includes(a.status)).length,
      todayRevenue: todayRev, monthlyRevenue: subRev + artRev,
      subscriptionRevenue: subRev, articleRevenue: artRev, totalRevenue: subRev + artRev,
    });
  });
  app.get('/api/admin/settings', requireAuth,  (_req, res) => res.json(settings));
  app.put('/api/admin/settings', requireAdmin, (req, res)  => { settings = { ...settings, ...req.body }; res.json(settings); });

  // ══════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ══════════════════════════════════════════════════════════════════════════
  app.get('/api/notifications', requireAuth, (req, res) => {
    const { userId } = req.query;
    res.json(userId ? notifications.filter(n => n.userId === userId) : notifications);
  });
  app.post('/api/notifications/mark-read', requireAuth, (req, res) => {
    const { id, userId } = req.body;
    if (id)     notifications = notifications.map(n => n.id     === id     ? { ...n, read: true } : n);
    if (userId) notifications = notifications.map(n => n.userId === userId ? { ...n, read: true } : n);
    res.json({ success: true });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // AI QUIZ
  // ══════════════════════════════════════════════════════════════════════════
  app.post('/api/ai/generate-quiz', requireAuth, async (req, res) => {
    const { topicTitle, lectureText, count = 5 } = req.body;
    const ai = getAI();
    if (ai) {
      try {
        const prompt = 'Siz oliy ta\'lim tizimi bo\'yicha professional test tuzuvchi ekspertsiz.\n' +
          'Mavzu: "' + topicTitle + '"\n' +
          'Ma\'ruza: ' + (lectureText ? lectureText.slice(0, 3000) : 'Mavzu nomiga qarab ilmiy savollar tuzing.') + '\n' +
          count + ' ta 4 variantli test savoli tuzing. Faqat JSON array:\n' +
          '[{"questionText":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correctOption":"A","explanation":"..."}]';
        const r = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
        const parsed = JSON.parse(r.text || '[]');
        return res.json({ questions: parsed.map((q: any, i: number) => ({ id: 'q-ai-' + Date.now() + '-' + i, ...q })) });
      } catch (err) { console.error('Gemini error:', err); }
    }
    res.json({ questions: [{
      id: 'q-gen-' + Date.now(),
      questionText: '"' + topicTitle + '" mavzusining asosiy vazifasi nimadan iborat?',
      optionA: "Mavzuning nazariy va amaliy metodologiyasini tizimli tadqiq etish",
      optionB: "Faqatgina tarixiy ma'lumotlarni yod olish",
      optionC: "Texnik vositalardan cheklangan foydalanish",
      optionD: "Boshqa fanlar bilan aloqani uzish",
      correctOption: 'A',
      explanation: "Har bir akademik fanning tub vazifasi uning metodologiyasini yoritishdir."
    }]});
  });

  // ══════════════════════════════════════════════════════════════════════════
  // VITE / STATIC
  // ══════════════════════════════════════════════════════════════════════════
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), 'dist');
    app.use(express.static(dist));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('Server: http://localhost:' + PORT);
    console.log('Super Admin email: ' + SUPER_ADMIN_EMAIL);
  });
}

startServer();

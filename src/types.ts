export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'AUTHOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  groupId?: string;
  phone?: string;
  specialty?: string;
  institution?: string;
  createdAt: string;
  passwordHash?: string; // only on server side
  googleId?: string;     // for Google OAuth users
  authProvider?: 'local' | 'google';
}

export interface Group {
  id: string;
  name: string; // e.g. "Pedagogika 101-guruh"
  faculty: string;
  course: number;
  studentCount?: number;
  teacherId?: string;
}

export interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  topicNumber: number;
  title: string;
  description: string;
  lectureText: string;
  pdfFileName?: string;
  pdfFileSize?: string;
  wordFileName?: string;
  wordFileSize?: string;
  additionalMaterials?: string[];
  passingScore: number; // percentage, e.g. 60
  questions: Question[];
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName: string;
  category: string;
  teacherId?: string;
  teacherName?: string;
  topicCount?: number;
  createdAt: string;
}

export interface TestAttempt {
  id: string;
  studentId: string;
  studentName: string;
  groupId?: string;
  topicId: string;
  subjectId: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number; // e.g. 80
  passingScore: number; // e.g. 60
  status: 'PASSED' | 'FAILED'; // O'tdi / O'tmadi
  completedAt: string;
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
}

export interface Subscription {
  id: string;
  studentId: string;
  studentName: string;
  planName: string; // "6 oylik to'liq obuna"
  durationMonths: number; // 6
  startDate: string; // ISO date
  endDate: string; // ISO date (exactly 6 months later)
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  amount: number; // in UZS (e.g. 250,000)
  paymentMethod: string;
  paymentReference?: string;
}

export type ArticleType = 
  | 'OAK' 
  | 'SCOPUS_WOS' 
  | 'RESPUBLIKA_KONFERENSIYA' 
  | 'XALQARO_KONFERENSIYA' 
  | 'TEZIS';

export type ArticleStatus = 
  | 'PAYMENT_PENDING'       // 1. To'lov kutilmoqda
  | 'PAYMENT_COMPLETED'     // 2. To'lov amalga oshirildi
  | 'NEW_ORDER'             // 3. Yangi buyurtma
  | 'ACCEPTED'              // 4. Qabul qilindi
  | 'IN_PROGRESS'           // 5. Tayyorlanmoqda
  | 'UNDER_REVIEW'          // 6. Tekshiruvda
  | 'READY'                 // 7. Tayyor
  | 'SENT_TO_USER'          // 8. Foydalanuvchiga yuborildi
  | 'COMPLETED';            // 9. Yakunlandi

export interface ArticleOrder {
  id: string;
  orderNumber: number; // e.g. 1025
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  title: string;
  articleType: ArticleType;
  volumePages: string; // e.g. "5-8 bet"
  language: 'O\'zbek' | 'Rus' | 'Ingliz';
  subjectArea: string;
  requirements: string;
  deadline: string; // e.g. "7 kun" or date
  notes?: string;
  amount: number; // UZS
  paymentStatus: 'PAID' | 'PENDING';
  paymentMethod?: string;
  status: ArticleStatus;
  assignedTo?: string; // teacher / author id
  assignedToName?: string;
  uploadedFile?: {
    name: string;
    size: string;
    format: 'DOCX' | 'PDF';
    url: string;
    uploadedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type PaymentProvider = 'Click' | 'Payme' | 'Uzum' | 'Stripe';
export type PaymentMode = 'redirect' | 'inline';

export interface PaymentTransaction {
  id: string;
  type: 'SUBSCRIPTION' | 'ARTICLE';
  userId: string;
  userName: string;
  amount: number; // UZS
  currency: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'CANCELLED';
  paymentMethod: PaymentProvider;
  paymentMode?: PaymentMode;
  referenceId: string;
  externalId?: string;
  description: string;
  createdAt: string;
  paidAt?: string;
}

export interface CreatePaymentRequest {
  type: 'SUBSCRIPTION' | 'ARTICLE';
  userId: string;
  amount: number;
  provider: PaymentProvider;
  mode: PaymentMode;
  orderId?: string;
  returnUrl?: string;
  description: string;
}

export interface CreatePaymentResponse {
  paymentId: string;
  status: 'PENDING';
  mode: PaymentMode;
  redirectUrl?: string;
  inlineToken?: string;
  inlineData?: {
    merchantId: string;
    amount: number;
    currency: string;
    orderId: string;
    description: string;
  };
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  provider: PaymentProvider;
  amount: number;
  paidAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  role?: UserRole;
  title: string;
  message: string;
  type: 'TEST' | 'ARTICLE' | 'SUBSCRIPTION' | 'SYSTEM';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AdminSettings {
  defaultPassingScore: number; // e.g. 60%
  subscriptionDurationMonths: number; // e.g. 6
  subscriptionPrice6Months: number; // e.g. 250,000 UZS
  articleBasePriceOAK: number;
  articleBasePriceScopus: number;
  articleBasePriceConference: number;
  articleBasePriceThesis: number;
  platformName?: string;
  platformPhone?: string;
  platformEmail?: string;
  allowAiGeneration?: boolean;
  allowSingleAttemptOnly?: boolean;
}

export interface StudentProgressSummary {
  studentId: string;
  studentName: string;
  groupName: string;
  subjectId: string;
  subjectName: string;
  completedTopics: number;
  totalTopics: number;
  passedTopics: number;
  failedTopics: number;
  averageScore: number;
  topicScores: Record<string, { score: number; status: 'PASSED' | 'FAILED'; completedAt: string }>;
}

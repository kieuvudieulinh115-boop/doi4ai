export type GradeLevel = 'lop-6' | 'lop-7' | 'lop-8' | 'lop-9';

export interface StudentProfile {
  name: string;
  className: string;
}

export interface VocabItem {
  id: string;
  word: string;
  contextMeaning: string;
  originalSentence: string;
  partOfSpeech?: string;
}

export type QuestionLevel = 'nhan-biet' | 'thong-hieu' | 'van-dung';

export interface AnswerFeedback {
  isGrounded: boolean;
  citationQuotes: string[];
  feedbackComment: string;
  guidedHint: string;
  canRefine: boolean;
}

export interface ComprehensionQuestion {
  id: string;
  level: QuestionLevel;
  levelLabel: string;
  question: string;
  hintLevel1: string; // Gợi ý định hướng suy nghĩ
  hintLevel2: string; // Manh mối kèm trích dẫn văn bản
  citationQuote: string; // Đoạn trích dẫn chuẩn trong văn bản
  studentAnswer: string;
  feedback?: AnswerFeedback;
  revealedHints: number; // 0: none, 1: level 1, 2: level 2
}

export interface PassageAnalysis {
  title: string;
  grade: GradeLevel;
  gradeLabel: string;
  passage: string;
  summary: string;
  mainTheme: string;
  vocabulary: VocabItem[];
  questions: ComprehensionQuestion[];
  initialStudentNotes?: string;
  createdAt?: string;
}

export interface SamplePassage {
  id: string;
  title: string;
  grade: GradeLevel;
  gradeLabel: string;
  source: string;
  passage: string;
  initialNotes?: string;
}

export type AuthState = 'loading' | 'unauthenticated' | 'authenticated';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  className: string;
  role: 'student' | 'teacher';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  className?: string;
  role?: 'student' | 'teacher';
  remember?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  message?: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  model?: string;
  isStreaming?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  contextPassageTitle?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotification {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  fontSize: 'normal' | 'large' | 'larger';
  soundEnabled: boolean;
  autoAnalyze: boolean;
  reducedMotion: boolean;
}


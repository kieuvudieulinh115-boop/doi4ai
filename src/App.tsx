import React, { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { GradeLevel, VocabItem, ComprehensionQuestion, StudentProfile, ChatConversation, AppSettings } from './types';
import { SAMPLE_PASSAGES } from './data/samplePassages';
import { Header } from './components/Header';
import { PassageViewer } from './components/PassageViewer';
import { PassageEditorModal } from './components/PassageEditorModal';
import { VocabularySection } from './components/VocabularySection';
import { SummaryCard } from './components/SummaryCard';
import { QuestionList } from './components/QuestionList';
import { ApiKeyModal } from './components/ApiKeyModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { AppSidebar } from './components/AppSidebar';
import { AiChatPane } from './components/AiChatPane';
import { ExportExamModal } from './components/ExportExamModal';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AuthScreen } from './auth/AuthScreen';
import { AuthLoadingSplash } from './auth/AuthLoadingSplash';
import { ToastProvider, useToast } from './context/ToastContext';
import { 
  BookMarked, 
  HelpCircle, 
  Compass, 
  Sparkles, 
  AlertCircle, 
  Layers, 
  Cpu, 
  Terminal, 
  ShieldCheck,
  Target
} from 'lucide-react';

function StudyWorkspace({
  themeMode,
  setThemeMode,
}: {
  themeMode: 'dark' | 'light';
  setThemeMode: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
}) {
  const { authState, user, logout, updateProfile } = useAuth();
  const { showToast } = useToast();

  // App Shell View: 'workspace' (Reading & comprehension verification) or 'chat' (AI multi-turn assistant)
  const [activeView, setActiveView] = useState<'workspace' | 'chat'>('workspace');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  });

  // Settings State with localStorage persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('ai_reading_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      theme: 'dark',
      fontSize: 'normal',
      soundEnabled: true,
      autoAnalyze: true,
      reducedMotion: false,
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Student Profile state with localStorage persistence
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('thcs_student_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return { name: 'Nguyễn Văn A', className: 'Lớp 7A1' };
  });

  // Client Gemini API Key state with localStorage persistence
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  // Modal control states
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Current Passage State: choose passage matching student profile if possible
  const [passageTitle, setPassageTitle] = useState(() => {
    const match = studentProfile.className.match(/(?:lớp\s*)?([6789])/i);
    const targetGrade = match && match[1] ? `lop-${match[1]}` : null;
    const found = targetGrade ? SAMPLE_PASSAGES.find(s => s.grade === targetGrade) : null;
    return found ? found.title : SAMPLE_PASSAGES[0].title;
  });

  const [passageText, setPassageText] = useState(() => {
    const match = studentProfile.className.match(/(?:lớp\s*)?([6789])/i);
    const targetGrade = match && match[1] ? `lop-${match[1]}` : null;
    const found = targetGrade ? SAMPLE_PASSAGES.find(s => s.grade === targetGrade) : null;
    return found ? found.passage : SAMPLE_PASSAGES[0].passage;
  });

  const [grade, setGrade] = useState<GradeLevel>(() => {
    const match = studentProfile.className.match(/(?:lớp\s*)?([6789])/i);
    const targetGrade = match && match[1] ? (`lop-${match[1]}` as GradeLevel) : null;
    return targetGrade || SAMPLE_PASSAGES[0].grade;
  });

  const [initialNotes, setInitialNotes] = useState(() => {
    const match = studentProfile.className.match(/(?:lớp\s*)?([6789])/i);
    const targetGrade = match && match[1] ? `lop-${match[1]}` : null;
    const found = targetGrade ? SAMPLE_PASSAGES.find(s => s.grade === targetGrade) : null;
    return (found && found.initialNotes) || SAMPLE_PASSAGES[0].initialNotes || '';
  });

  // AI Analysis Results
  const [summary, setSummary] = useState('');
  const [mainTheme, setMainTheme] = useState('');
  const [vocabulary, setVocabulary] = useState<VocabItem[]>([]);
  const [questions, setQuestions] = useState<ComprehensionQuestion[]>([]);

  // AI Conversations State with persistence
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem('ai_chat_conversations');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const initialId = `conv-${Date.now()}`;
    return [
      {
        id: initialId,
        title: 'Phân tích văn bản ban đầu',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        contextPassageTitle: passageTitle
      }
    ];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return conversations[0]?.id || `conv-${Date.now()}`;
  });

  // Save conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_chat_conversations', JSON.stringify(conversations));
    } catch {
      // ignore
    }
  }, [conversations]);

  // Handle new conversation
  const handleNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: ChatConversation = {
      id: newId,
      title: `Đối thoại mới #${conversations.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      contextPassageTitle: passageTitle
    };
    setConversations([newConv, ...conversations]);
    setActiveConversationId(newId);
    setActiveView('chat');
    showToast('Đã bắt đầu hội thoại AI mới', 'info');
  };

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0] || {
    id: 'fallback-conv',
    title: 'Hội thoại',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };

  const handleUpdateActiveConversation = (updated: ChatConversation) => {
    setConversations(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  // Keyboard shortcut Alt+S for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);
  const [selectedVocab, setSelectedVocab] = useState<VocabItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'questions' | 'vocab' | 'summary'>('all');
  const [checkingQuestionId, setCheckingQuestionId] = useState<string | null>(null);

  const isDark = themeMode === 'dark';

  // Grade labels helper
  const gradeLabelMap: Record<GradeLevel, string> = {
    'lop-6': 'Lớp 6 (Ngữ văn)',
    'lop-7': 'Lớp 7 (Ngữ văn)',
    'lop-8': 'Lớp 8 (Ngữ văn)',
    'lop-9': 'Lớp 9 (Ngữ văn)',
  };

  // Perform AI Passage Analysis via Backend Server
  const analyzePassage = useCallback(async (text: string, currentGrade: GradeLevel, notes: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedCitation(null);
    setSelectedVocab(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['x-gemini-api-key'] = apiKey;
      }

      const response = await fetch('/api/analyze-passage', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          passage: text,
          grade: currentGrade,
          initialNotes: notes,
          apiKey: apiKey || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Không thể phân tích văn bản. Vui lòng thử lại.');
      }

      const data = await response.json();
      setSummary(data.summary || '');
      setMainTheme(data.mainTheme || '');
      setVocabulary(data.vocabulary || []);
      setQuestions(data.questions || []);
    } catch (err: any) {
      console.error('Error analyzing passage:', err);
      setError(err.message || 'Đã có lỗi xảy ra khi gọi AI phân tích văn bản.');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  // Initial load
  useEffect(() => {
    analyzePassage(passageText, grade, initialNotes);
  }, []);

  // Handle Passage Submission from Editor Modal
  const handlePassageSubmit = (newTitle: string, newPassage: string, newGrade: GradeLevel, newNotes: string) => {
    setPassageTitle(newTitle);
    setPassageText(newPassage);
    setGrade(newGrade);
    setInitialNotes(newNotes);
    setIsEditorOpen(false);
    analyzePassage(newPassage, newGrade, newNotes);
  };

  // Handle student updating their answer for a question
  const handleUpdateAnswer = (questionId: string, answer: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, studentAnswer: answer } : q))
    );
  };

  // Handle revealing multi-level hints
  const handleRevealHint = (questionId: string, level: number) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, revealedHints: level } : q))
    );
  };

  // Handle AI checking student answer against passage
  const handleCheckAnswer = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.studentAnswer.trim()) return;

    setCheckingQuestionId(questionId);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['x-gemini-api-key'] = apiKey;
      }

      const response = await fetch('/api/check-answer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          passage: passageText,
          question: question.question,
          studentAnswer: question.studentAnswer,
          citationQuote: question.citationQuote,
          hintLevel1: question.hintLevel1,
          hintLevel2: question.hintLevel2,
          apiKey: apiKey || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi kiểm tra câu trả lời.');
      }

      const feedbackData = await response.json();

      setQuestions(prev =>
        prev.map(q =>
          q.id === questionId
            ? {
                ...q,
                feedback: feedbackData
              }
            : q
        )
      );

      // Auto-highlight first citation quote if available
      if (feedbackData.citationQuotes && feedbackData.citationQuotes.length > 0) {
        setSelectedCitation(feedbackData.citationQuotes[0]);
      }
    } catch (err: any) {
      console.error('Check answer error:', err);
    } finally {
      setCheckingQuestionId(null);
    }
  };

  // Handle highlighting a specific citation quote in passage
  const handleSelectCitation = (quote: string) => {
    setSelectedCitation(quote);
    setSelectedVocab(null);
  };

  // Handle clicking a vocab item
  const handleSelectVocab = (vocab: VocabItem) => {
    setSelectedVocab(vocab);
    setSelectedCitation(null);
  };

  // Handle saving student profile
  const handleSaveProfile = (newProfile: StudentProfile) => {
    setStudentProfile(newProfile);
    localStorage.setItem('thcs_student_profile', JSON.stringify(newProfile));

    // Detect grade level from student class string (e.g., '7A1', 'Lớp 7', '8B')
    const match = newProfile.className.match(/(?:lớp\s*)?([6789])/i);
    if (match && match[1]) {
      const targetGrade: GradeLevel = `lop-${match[1]}` as GradeLevel;
      // If the current passage grade doesn't match the new student grade, find matching sample
      if (grade !== targetGrade) {
        const matchingSample = SAMPLE_PASSAGES.find(s => s.grade === targetGrade);
        if (matchingSample) {
          setPassageTitle(matchingSample.title);
          setPassageText(matchingSample.passage);
          setGrade(matchingSample.grade);
          setInitialNotes(matchingSample.initialNotes || '');
          analyzePassage(matchingSample.passage, matchingSample.grade, matchingSample.initialNotes || '');
        } else {
          setGrade(targetGrade);
          analyzePassage(passageText, targetGrade, initialNotes);
        }
      }
    }
  };

  // Synchronize authenticated user info into profile
  useEffect(() => {
    if (user) {
      setStudentProfile({
        name: user.name,
        className: user.className || 'Lớp 7A1',
      });
    }
  }, [user]);

  // Handle saving API key
  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem('gemini_api_key', newKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  // Loading state when checking initial authentication token
  if (authState === 'loading') {
    return <AuthLoadingSplash themeMode={themeMode} />;
  }

  // Unauthenticated screen: user MUST login/register before accessing the study center
  if (authState === 'unauthenticated' || !user) {
    return (
      <AuthScreen
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />
    );
  }

  const answeredCount = questions.filter(q => q.studentAnswer.trim().length > 0).length;

  return (
    <div
      className={`min-h-screen flex font-sans transition-colors duration-300 relative selection:bg-cyan-500/30 selection:text-cyan-200 ${
        isDark
          ? 'bg-[#0a0f1d] text-slate-100 bg-tech-grid'
          : 'bg-[#f8fafc] text-slate-900 bg-tech-grid-light'
      }`}
    >
      {/* App Sidebar (Grok/Claude style collapsible workspace dock) */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        activeView={activeView}
        onSelectView={(view) => setActiveView(view)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewConversation={handleNewConversation}
        passageTitle={passageTitle}
        onOpenPassageEditor={() => setIsEditorOpen(true)}
        user={user}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenApiKey={() => setIsApiKeyModalOpen(true)}
        onLogout={logout}
        themeMode={themeMode}
        totalQuestions={questions.length}
        completedQuestions={answeredCount}
        onOpenExportExam={() => setIsExportModalOpen(true)}
      />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Futuristic Header */}
        <Header
          grade={grade}
          onEditPassage={() => setIsEditorOpen(true)}
          onReset={() => analyzePassage(passageText, grade, initialNotes)}
          isLoading={isLoading}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          totalQuestions={questions.length}
          completedQuestions={answeredCount}
          studentProfile={studentProfile}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenApiKey={() => setIsApiKeyModalOpen(true)}
          hasCustomApiKey={Boolean(apiKey)}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenExportExam={() => setIsExportModalOpen(true)}
        />

        {/* View Switch: Workspace Studio vs Full AI Chat Mode */}
        {activeView === 'chat' ? (
          <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col h-[calc(100vh-80px)]">
            <AiChatPane
              passageTitle={passageTitle}
              passageText={passageText}
              grade={grade}
              customApiKey={apiKey}
              themeMode={themeMode}
              activeConversation={activeConv}
              onUpdateConversation={handleUpdateActiveConversation}
            />
          </main>
        ) : (
          /* Main Reading & Verification Studio */
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Error notification */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 shadow-lg shadow-rose-500/5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono font-bold text-rose-400 uppercase tracking-wider">// LỖI KẾT NỐI HỆ THỐNG:</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* AI Neural Processing Scanner Banner */}
            {isLoading && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-indigo-950/80 to-purple-950/80 border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm flex items-center justify-between shadow-xl shadow-cyan-500/10 backdrop-blur-xl animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <p className="font-tech font-bold text-white flex items-center gap-2">
                      <span>AI Đang Phân Tích Cấu Trúc Ngữ Liệu...</span>
                    </p>
                    <p className="text-xs text-cyan-300/80 font-mono">
                      Trích xuất từ khó ngữ cảnh, đối chiếu luận điểm và sinh câu hỏi đọc hiểu chuẩn GDPT 2018
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 font-mono text-xs px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>GEMINI 3.8 FLASH</span>
                </div>
              </div>
            )}

            {/* 2-Column Split Studio Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Reading Pane (5 cols) */}
              <div className="lg:col-span-5 xl:col-span-5 h-[540px] lg:h-[calc(100vh-140px)] sticky lg:top-20">
                <PassageViewer
                  title={passageTitle}
                  passage={passageText}
                  gradeLabel={gradeLabelMap[grade]}
                  selectedCitation={selectedCitation}
                  selectedVocab={selectedVocab}
                  onClearCitation={() => setSelectedCitation(null)}
                  vocabulary={vocabulary}
                  onSelectVocab={handleSelectVocab}
                  themeMode={themeMode}
                />
              </div>

              {/* Right: Interactive Learning & Verification Center (7 cols) */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-5">
                {/* Tech HUD Navigation Tabs */}
                <div
                  className={`flex items-center gap-1.5 p-1.5 rounded-2xl border backdrop-blur-xl overflow-x-auto text-xs sm:text-sm font-mono ${
                    isDark
                      ? 'bg-slate-900/80 border-slate-800 text-slate-400 shadow-md shadow-black/20'
                      : 'bg-slate-200/80 border-slate-300/80 text-slate-600'
                  }`}
                >
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'all'
                        ? isDark
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Tất cả bảng học</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'questions'
                        ? isDark
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'hover:text-slate-200'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Câu hỏi đọc hiểu ({questions.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('vocab')}
                    className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'vocab'
                        ? isDark
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'hover:text-slate-200'
                    }`}
                  >
                    <BookMarked className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Từ khó ngữ cảnh ({vocabulary.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'summary'
                        ? isDark
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'hover:text-slate-200'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tóm tắt ý chính</span>
                  </button>
                </div>

                {/* Dynamic Tab Panes */}
                {(activeTab === 'all' || activeTab === 'summary') && (
                  <SummaryCard
                    summary={summary}
                    mainTheme={mainTheme}
                    initialNotes={initialNotes}
                    themeMode={themeMode}
                  />
                )}

                {(activeTab === 'all' || activeTab === 'vocab') && (
                  <VocabularySection
                    vocabulary={vocabulary}
                    selectedVocab={selectedVocab}
                    onSelectVocab={handleSelectVocab}
                    themeMode={themeMode}
                  />
                )}

                {(activeTab === 'all' || activeTab === 'questions') && (
                  <QuestionList
                    questions={questions}
                    onUpdateAnswer={handleUpdateAnswer}
                    onCheckAnswer={handleCheckAnswer}
                    onRevealHint={handleRevealHint}
                    onSelectCitation={handleSelectCitation}
                    checkingQuestionId={checkingQuestionId}
                    themeMode={themeMode}
                  />
                )}
              </div>
            </div>
          </main>
        )}

        {/* Tech Telemetry Footer */}
        <footer
          className={`border-t py-4 px-6 text-center text-xs font-mono mt-auto transition-colors ${
            isDark
              ? 'bg-[#080c18] border-slate-800 text-slate-500'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>HỆ THỐNG TRỢ GIẢNG NGỮ VĂN • GDPT 2018</span>
            </span>
            <span className="text-slate-500">
              Powered by Google Gemini 3.8 Flash • Strict Grounded Citation Engine
            </span>
          </div>
        </footer>
      </div>

      {/* Passage & Preset Configuration Modal */}
      <PassageEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSubmit={handlePassageSubmit}
        initialTitle={passageTitle}
        initialPassage={passageText}
        initialGrade={grade}
        initialNotes={initialNotes}
        isLoading={isLoading}
        themeMode={themeMode}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        themeMode={themeMode}
      />

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={studentProfile}
        onSaveProfile={handleSaveProfile}
        themeMode={themeMode}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          try {
            localStorage.setItem('ai_reading_settings', JSON.stringify(newSettings));
          } catch {
            // ignore
          }
          showToast('Đã lưu cài đặt hệ thống', 'success');
        }}
        themeMode={themeMode}
        onToggleTheme={(t) => setThemeMode(t)}
      />

      {/* Export Exam to Word/PDF Modal */}
      <ExportExamModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={passageTitle}
        passage={passageText}
        grade={grade}
        gradeLabel={gradeLabelMap[grade]}
        vocabulary={vocabulary}
        questions={questions}
        studentProfile={studentProfile}
        themeMode={themeMode}
      />
    </div>
  );
}

export default function App() {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  return (
    <AuthProvider>
      <ToastProvider>
        <StudyWorkspace themeMode={themeMode} setThemeMode={setThemeMode} />
      </ToastProvider>
    </AuthProvider>
  );
}

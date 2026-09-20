import { 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Edit3, 
  Cpu, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Activity, 
  Key, 
  User, 
  FileCode,
  FileDown
} from 'lucide-react';
import { GradeLevel, StudentProfile } from '../types';
import { UserMenu } from './UserMenu';
import { ExamTimerWidget } from './ExamTimerWidget';

interface HeaderProps {
  grade: GradeLevel;
  onEditPassage: () => void;
  onReset: () => void;
  isLoading: boolean;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
  totalQuestions: number;
  completedQuestions: number;
  studentProfile: StudentProfile;
  onOpenProfile: () => void;
  onOpenApiKey: () => void;
  hasCustomApiKey: boolean;
  onToggleSidebar?: () => void;
  onOpenSettings?: () => void;
  onOpenExportExam?: () => void;
}

export const Header = ({
  grade,
  onEditPassage,
  onReset,
  isLoading,
  themeMode,
  onToggleTheme,
  totalQuestions,
  completedQuestions,
  studentProfile,
  onOpenProfile,
  onOpenApiKey,
  hasCustomApiKey,
  onToggleSidebar,
  onOpenSettings,
  onOpenExportExam
}: HeaderProps) => {
  const gradeNames: Record<GradeLevel, string> = {
    'lop-6': 'Lớp 6',
    'lop-7': 'Lớp 7',
    'lop-8': 'Lớp 8',
    'lop-9': 'Lớp 9',
  };

  const isDark = themeMode === 'dark';

  return (
    <header
      className={`border-b sticky top-0 z-30 transition-colors backdrop-blur-xl ${
        isDark
          ? 'bg-[#0b1120]/90 border-slate-800/80 text-slate-100 shadow-lg shadow-black/20'
          : 'bg-white/90 border-slate-200/90 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Futuristic Brand, Student Profile & Telemetry */}
        <div className="flex items-center gap-2.5">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              title="Mở/Đóng Menu (Alt+S)"
              className="p-2 rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            {/* Pulsing indicator dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight font-tech flex items-center gap-2">
                <span>Luyện Đọc Hiểu</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  AI Studio
                </span>
              </h1>

              {/* Student Profile interactive pill */}
              <button
                onClick={onOpenProfile}
                className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
                  isDark
                    ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30 hover:bg-cyan-900/50 hover:border-cyan-400'
                    : 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100'
                }`}
                title="Hồ sơ học sinh: Nhấn để đổi tên và lớp"
              >
                <User className="w-3 h-3 text-cyan-400" />
                <span>Học sinh: {studentProfile.name} ({studentProfile.className})</span>
              </button>

              {/* Passage Grade Chip - clickable to change passage grade */}
              <button
                onClick={onEditPassage}
                className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border hidden sm:inline-flex items-center gap-1.5 transition-all ${
                  isDark
                    ? 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60 hover:bg-indigo-900/70 hover:border-indigo-400'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
                title="Ngữ liệu bài đọc: Nhấn để đổi bài đọc hoặc khối lớp"
              >
                <BookOpen className="w-3 h-3 text-indigo-400" />
                <span>Bài đọc: {gradeNames[grade]}</span>
              </button>
            </div>

            <p className={`text-[11px] hidden sm:flex items-center gap-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Đối chiếu dẫn chứng văn bản gốc</span>
              <span className="text-slate-600 dark:text-slate-500">•</span>
              <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Chuẩn GDPT 2018
              </span>
            </p>
          </div>
        </div>

        {/* Right: Progress Bar, API Key, Standalone HTML & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Progress Radar Chip */}
          {totalQuestions > 0 && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
              title={`Số câu đã hoàn thành: ${completedQuestions}/${totalQuestions}`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Tiến độ:</span>
              <span className="font-bold text-cyan-500 dark:text-cyan-400">
                {completedQuestions}/{totalQuestions}
              </span>
              <div className="w-12 sm:w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${(completedQuestions / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Exam Mode Timer Widget */}
          <ExamTimerWidget themeMode={themeMode} />

          {/* Export Exam to Word/PDF */}
          {onOpenExportExam && (
            <button
              type="button"
              onClick={onOpenExportExam}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                isDark
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border-slate-700 hover:border-cyan-500/50'
                  : 'bg-white hover:bg-slate-50 text-cyan-700 border-slate-200 shadow-xs'
              }`}
              title="Xuất đề thi ra Word hoặc in ấn PDF theo chuẩn GDPT 2018"
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Xuất đề Word/PDF</span>
              <span className="lg:hidden">Xuất đề</span>
            </button>
          )}

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKey}
            className={`px-2.5 py-1.5 rounded-xl border transition-all text-xs font-mono flex items-center gap-1.5 ${
              hasCustomApiKey
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-400/30'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Cài đặt Google Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{hasCustomApiKey ? 'Khóa riêng ✓' : 'Cài đặt API'}</span>
          </button>

          {/* Standalone Vanilla JS SPA Link */}
          <a
            href="/standalone.html"
            target="_blank"
            rel="noreferrer"
            className={`hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
              isDark
                ? 'bg-purple-950/40 text-purple-300 border-purple-800/60 hover:bg-purple-900/50'
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
            }`}
            title="Mở bản độc lập Vanilla JS + CDN HTML"
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span>Bản Vanilla JS</span>
          </a>

          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Công nghệ Tối'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Edit/Change Passage Modal trigger */}
          <button
            id="btn-edit-passage"
            onClick={onEditPassage}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition-all border disabled:opacity-50 ${
              isDark
                ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-cyan-500/50'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
            }`}
            title="Đổi bài đọc hoặc nhập câu văn của học sinh"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span className="hidden sm:inline">Đổi bài đọc</span>
            <span className="sm:hidden">Bài</span>
          </button>

          {/* Re-analyze AI button */}
          <button
            id="btn-reload-sample"
            onClick={onReset}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-indigo-500/20 transition-all border border-indigo-400/30 disabled:opacity-50"
            title="Kích hoạt AI quét và phân tích lại văn bản"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Phân tích AI</span>
          </button>

          {/* User Account Menu with Avatar & Actions */}
          <UserMenu
            themeMode={themeMode}
            onOpenProfile={onOpenProfile}
            onOpenApiKey={onOpenApiKey}
            onEditPassage={onEditPassage}
            onOpenExportExam={onOpenExportExam}
          />
        </div>
      </div>
    </header>
  );
};


import { useState, useEffect, type FormEvent } from 'react';
import { GradeLevel, SamplePassage } from '../types';
import { SAMPLE_PASSAGES } from '../data/samplePassages';
import { X, Check, BookOpen, AlertCircle, FileText, UserCheck, Cpu, Sparkles } from 'lucide-react';

interface PassageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, passage: string, grade: GradeLevel, initialNotes: string) => void;
  initialTitle: string;
  initialPassage: string;
  initialGrade: GradeLevel;
  initialNotes: string;
  isLoading: boolean;
  themeMode?: 'dark' | 'light';
}

export const PassageEditorModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialTitle,
  initialPassage,
  initialGrade,
  initialNotes,
  isLoading,
  themeMode = 'dark'
}: PassageEditorModalProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [grade, setGrade] = useState<GradeLevel>(initialGrade);
  const [passage, setPassage] = useState(initialPassage);
  const [studentNotes, setStudentNotes] = useState(initialNotes);
  const [error, setError] = useState<string | null>(null);

  // Sync internal state with props whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setGrade(initialGrade);
      setPassage(initialPassage);
      setStudentNotes(initialNotes);
      setError(null);
    }
  }, [isOpen, initialTitle, initialGrade, initialPassage, initialNotes]);

  const isDark = themeMode === 'dark';

  if (!isOpen) return null;

  const handleSelectSample = (sample: SamplePassage) => {
    setTitle(sample.title);
    setGrade(sample.grade);
    setPassage(sample.passage);
    setStudentNotes(sample.initialNotes || '');
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!passage.trim() || passage.trim().length < 30) {
      setError('Đoạn văn quá ngắn. Vui lòng nhập hoặc chọn một đoạn văn có ít nhất 30 ký tự để AI có đủ dữ liệu phân tích.');
      return;
    }
    setError(null);
    onSubmit(title || 'Văn bản đọc hiểu', passage.trim(), grade, studentNotes.trim());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div
        className={`relative rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border animate-in fade-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#0f172a] border-slate-700/80 text-slate-100 shadow-cyan-500/10'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header HUD */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between rounded-t-3xl ${
            isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-tech flex items-center gap-2">
                <span>Thiết lập dữ liệu đọc hiểu</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  CONFIG
                </span>
              </h2>
              <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Nhập hoặc chọn bài đọc để AI Gemini phân tích và sinh hệ thống câu hỏi có căn cứ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2 text-cyan-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              CHỌN NHANH VĂN BẢN MẪU CHUẨN SGK (GDPT 2018):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_PASSAGES.map((sample) => (
                <button
                  type="button"
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-3 text-left rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                    passage === sample.passage
                      ? isDark
                        ? 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'border-cyan-500 bg-cyan-50/80 ring-1 ring-cyan-400'
                      : isDark
                      ? 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 bg-slate-900/50 text-slate-300'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-700'
                  }`}
                >
                  <span className="font-bold font-tech line-clamp-1 text-sm">{sample.title}</span>
                  <div className="flex items-center justify-between text-[11px] font-mono mt-1.5 text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-slate-700">
                      {sample.gradeLabel}
                    </span>
                    <span className="italic truncate ml-2 opacity-80">{sample.source}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Title */}
            <div className="sm:col-span-2">
              <label htmlFor="passage-title" className={`block text-xs font-mono mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Tên bài đọc / Nhan đề văn bản:
              </label>
              <input
                id="passage-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Bài học đường đời đầu tiên"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 font-sans ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:ring-cyan-500/30 focus:border-cyan-500'
                    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500/30 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Grade Select */}
            <div>
              <label htmlFor="grade-select" className={`block text-xs font-mono mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Khối lớp:
              </label>
              <select
                id="grade-select"
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className={`w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 font-mono font-medium ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-700 text-slate-100 focus:ring-cyan-500/30 focus:border-cyan-500'
                    : 'bg-white border-slate-300 text-slate-800 focus:ring-indigo-500/30 focus:border-indigo-500'
                }`}
              >
                <option value="lop-6">Lớp 6</option>
                <option value="lop-7">Lớp 7</option>
                <option value="lop-8">Lớp 8</option>
                <option value="lop-9">Lớp 9</option>
              </select>
            </div>
          </div>

          {/* Passage Text */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs font-mono">
              <label htmlFor="passage-content" className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                Nội dung văn bản đọc hiểu <span className="text-rose-400">*</span>:
              </label>
              <span className="text-cyan-400">{passage.trim().length} ký tự</span>
            </div>
            <textarea
              id="passage-content"
              rows={8}
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              placeholder="Dán hoặc nhập đoạn văn đọc hiểu tại đây..."
              className={`w-full p-4 text-sm rounded-xl border leading-relaxed font-serif-reading focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-950/80 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:ring-cyan-500/30 focus:border-cyan-500'
                  : 'bg-slate-50/50 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500/30 focus:border-indigo-500'
              }`}
              required
            />
          </div>

          {/* Student Initial Answers / Notes */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs font-mono">
              <label htmlFor="student-notes" className="flex items-center gap-1.5 text-amber-400">
                <UserCheck className="w-3.5 h-3.5" />
                Câu trả lời ban đầu hoặc suy nghĩ ban đầu của học sinh (Tùy chọn):
              </label>
              <span className="text-slate-500">Hỗ trợ cá nhân hóa</span>
            </div>
            <textarea
              id="student-notes"
              rows={2}
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="Ví dụ: Em thấy đoạn văn thể hiện sự ân hận sâu sắc của nhân vật Dế Mèn..."
              className={`w-full p-3 text-sm rounded-xl border focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-950/80 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:ring-amber-500/30 focus:border-amber-500'
                  : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:ring-amber-500/30 focus:border-amber-500'
              }`}
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3 font-mono">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs rounded-xl transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading || !passage.trim()}
              className="px-5 py-2.5 text-xs font-tech font-bold rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{isLoading ? 'AI đang phân tích văn bản...' : 'Gửi văn bản & Phân tích AI ngay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

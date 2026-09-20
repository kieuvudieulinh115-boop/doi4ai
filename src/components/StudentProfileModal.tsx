import { useState, useEffect, type FormEvent } from 'react';
import { User, GraduationCap, Check, X, Sparkles, BookOpen } from 'lucide-react';
import { StudentProfile } from '../types';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => void;
  themeMode: 'dark' | 'light';
}

export const StudentProfileModal = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  themeMode
}: StudentProfileModalProps) => {
  const [name, setName] = useState(profile.name);
  const [className, setClassName] = useState(profile.className);
  const isDark = themeMode === 'dark';

  // Always sync internal inputs when the modal opens
  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setClassName(profile.className);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim() || 'Học sinh',
      className: className.trim() || 'Lớp 7A1'
    });
    onClose();
  };

  const quickClasses = ['Lớp 6A1', 'Lớp 6A2', 'Lớp 7A1', 'Lớp 7A2', 'Lớp 8A1', 'Lớp 8A2', 'Lớp 9A1', 'Lớp 9A2'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`relative rounded-3xl max-w-md w-full flex flex-col shadow-2xl border animate-in fade-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#0f172a] border-slate-700/80 text-slate-100 shadow-cyan-500/10'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div
          className={`px-6 py-4 border-b flex items-center justify-between rounded-t-3xl ${
            isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-tech">Hồ sơ học sinh</h3>
              <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Cá nhân hóa tiến trình luyện tập đọc hiểu
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label htmlFor="student-name" className={`block text-xs font-mono font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Họ và tên học sinh:
            </label>
            <input
              id="student-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-950/80 border-slate-700 text-slate-100 focus:ring-cyan-500/30 focus:border-cyan-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-500'
              }`}
              required
            />
          </div>

          <div>
            <label htmlFor="student-class" className={`block text-xs font-mono font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Lớp học của em:
            </label>
            <input
              id="student-class"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Ví dụ: Lớp 7A1 hoặc 7A"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-950/80 border-slate-700 text-slate-100 focus:ring-cyan-500/30 focus:border-cyan-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-500'
              }`}
              required
            />
            {/* Quick class pickers */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickClasses.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setClassName(c)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
                    className === c
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2 font-mono">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-2 text-xs rounded-xl transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold font-tech rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Lưu thông tin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

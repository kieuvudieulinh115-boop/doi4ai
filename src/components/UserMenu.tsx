import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  LogOut, 
  ShieldCheck, 
  Key, 
  BookOpen, 
  Edit3, 
  ChevronDown, 
  GraduationCap,
  Sparkles,
  Loader2,
  FileDown
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface UserMenuProps {
  themeMode: 'dark' | 'light';
  onOpenProfile: () => void;
  onOpenApiKey: () => void;
  onEditPassage: () => void;
  onOpenExportExam?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  themeMode,
  onOpenProfile,
  onOpenApiKey,
  onEditPassage,
  onOpenExportExam,
}) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDark = themeMode === 'dark';

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  // Get initials from user name
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'HS';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl border transition-all text-xs font-mono select-none ${
          isOpen
            ? isDark
              ? 'bg-slate-800 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
              : 'bg-slate-100 border-cyan-600/50 shadow-xs'
            : isDark
            ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-200'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
        }`}
      >
        {/* Avatar circle with initials */}
        <div className="relative">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {initials}
          </div>
          {/* Active indicator badge */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
        </div>

        {/* User basic info */}
        <div className="text-left hidden sm:block max-w-[120px] lg:max-w-[150px]">
          <div className="font-semibold text-xs truncate leading-tight">
            {user.name}
          </div>
          <div className={`text-[10px] truncate leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {user.className}
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border p-2 shadow-2xl z-50 backdrop-blur-xl transition-all ${
            isDark
              ? 'bg-[#0f172a]/95 border-slate-800 text-slate-100 shadow-black/60'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
          }`}
        >
          {/* User Card Header */}
          <div
            className={`p-3 rounded-xl border mb-2 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate font-tech">{user.name}</div>
                <div className="text-xs text-slate-400 truncate">{user.email}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {user.className}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    {user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Items */}
          <div className="space-y-1 text-xs font-mono">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onOpenProfile();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-left ${
                isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span>Cập nhật hồ sơ & khối lớp</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onEditPassage();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-left ${
                isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Chọn hoặc đổi văn bản đọc</span>
            </button>

            {onOpenExportExam && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  onOpenExportExam();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-left ${
                  isDark ? 'hover:bg-slate-800 text-cyan-300' : 'hover:bg-slate-100 text-cyan-700'
                }`}
              >
                <FileDown className="w-4 h-4 text-cyan-400" />
                <span>Xuất đề kiểm tra (Word/PDF)</span>
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onOpenApiKey();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-left ${
                isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>Cài đặt Google Gemini API</span>
            </button>
          </div>

          {/* Divider */}
          <div className={`my-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />

          {/* Logout Action */}
          <button
            type="button"
            role="menuitem"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-xs font-mono text-left ${
              isDark
                ? 'hover:bg-rose-500/15 text-rose-400 hover:text-rose-300'
                : 'hover:bg-rose-50 text-rose-600 hover:text-rose-700'
            }`}
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
            ) : (
              <LogOut className="w-4 h-4 text-rose-400" />
            )}
            <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất khỏi hệ thống'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

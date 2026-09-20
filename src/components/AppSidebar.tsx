import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  BookOpen, 
  HelpCircle, 
  FileEdit, 
  Sparkles, 
  Settings as SettingsIcon, 
  User, 
  Key, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  Layers,
  CheckCircle2,
  Sliders,
  FileDown
} from 'lucide-react';
import { AuthUser, ChatConversation } from '../types';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeView: 'workspace' | 'chat';
  onSelectView: (view: 'workspace' | 'chat') => void;
  conversations: ChatConversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  passageTitle: string;
  onOpenPassageEditor: () => void;
  user: AuthUser;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenApiKey: () => void;
  onLogout: () => void;
  themeMode: 'dark' | 'light';
  totalQuestions: number;
  completedQuestions: number;
  onOpenExportExam?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeView,
  onSelectView,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  passageTitle,
  onOpenPassageEditor,
  user,
  onOpenSettings,
  onOpenProfile,
  onOpenApiKey,
  onLogout,
  themeMode,
  totalQuestions,
  completedQuestions,
  onOpenExportExam
}) => {
  const isDark = themeMode === 'dark';

  return (
    <aside
      aria-label="Sidebar điều hướng chính"
      className={`h-screen sticky top-0 z-30 transition-all duration-300 flex flex-col border-r backdrop-blur-2xl select-none ${
        isCollapsed ? 'w-16 sm:w-20' : 'w-72'
      } ${
        isDark
          ? 'bg-[#080d1a]/95 border-slate-800 text-slate-200'
          : 'bg-white/95 border-slate-200 text-slate-800'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-inherit">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-tech font-bold text-sm text-white tracking-wide truncate">
                AI STUDIO
              </h1>
              <p className="text-[10px] font-mono text-cyan-400 truncate">
                Đọc hiểu THCS • GDPT 2018
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Mở rộng menu (Alt+S)' : 'Thu gọn menu (Alt+S)'}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Chat / New Session Quick Action */}
      <div className="p-3">
        <button
          type="button"
          onClick={onNewConversation}
          className={`w-full py-2.5 px-3 rounded-2xl font-tech font-bold text-xs transition-all flex items-center gap-2.5 ${
            isCollapsed ? 'justify-center' : 'justify-start'
          } ${
            isDark
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md'
          }`}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Hội thoại AI Mới</span>}
        </button>
      </div>

      {/* Primary Navigation Views */}
      <div className="px-3 py-2 space-y-1">
        <button
          type="button"
          onClick={() => onSelectView('workspace')}
          className={`w-full p-2.5 rounded-2xl text-xs font-mono font-semibold transition-all flex items-center gap-3 ${
            isCollapsed ? 'justify-center' : 'justify-start'
          } ${
            activeView === 'workspace'
              ? isDark
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold'
                : 'bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between text-left">
              <span>Phòng Luyện Đọc</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {completedQuestions}/{totalQuestions}
              </span>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectView('chat')}
          className={`w-full p-2.5 rounded-2xl text-xs font-mono font-semibold transition-all flex items-center gap-3 ${
            isCollapsed ? 'justify-center' : 'justify-start'
          } ${
            activeView === 'chat'
              ? isDark
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold'
                : 'bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
          {!isCollapsed && <span>Trợ lý Đối Thoại AI</span>}
        </button>

        <button
          type="button"
          onClick={onOpenPassageEditor}
          className={`w-full p-2.5 rounded-2xl text-xs font-mono font-semibold transition-all flex items-center gap-3 ${
            isCollapsed ? 'justify-center' : 'justify-start'
          } text-slate-400 hover:text-slate-100 hover:bg-slate-800/50`}
        >
          <FileEdit className="w-4 h-4 text-emerald-400 shrink-0" />
          {!isCollapsed && <span className="truncate">Đổi bài đọc / Tải tệp</span>}
        </button>

        {onOpenExportExam && (
          <button
            type="button"
            onClick={onOpenExportExam}
            className={`w-full p-2.5 rounded-2xl text-xs font-mono font-semibold transition-all flex items-center gap-3 ${
              isCollapsed ? 'justify-center' : 'justify-start'
            } text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50`}
            title="Xuất đề thi ra Word hoặc in ấn PDF"
          >
            <FileDown className="w-4 h-4 text-cyan-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Xuất đề Word / PDF</span>}
          </button>
        )}
      </div>

      {/* Conversation History List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Lịch sử đối thoại ({conversations.length})
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
              Chưa có phiên đối thoại nào. Bấm nút '+' để bắt đầu!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId && activeView === 'chat';
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onSelectView('chat');
                  }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-mono transition-all flex items-center gap-2.5 ${
                    isActive
                      ? 'bg-slate-800/90 text-cyan-300 border border-slate-700 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{conv.title || 'Đối thoại mới'}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {conv.messages.length} tin nhắn
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {isCollapsed && <div className="flex-1" />}

      {/* User Card & Settings Dock at Bottom */}
      <div className="p-3 border-t border-inherit space-y-1.5">
        <button
          type="button"
          onClick={onOpenProfile}
          className={`w-full p-2 rounded-2xl flex items-center gap-3 transition-all ${
            isCollapsed ? 'justify-center' : 'justify-start'
          } ${
            isDark
              ? 'hover:bg-slate-800/70 text-slate-200'
              : 'hover:bg-slate-100 text-slate-800'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 text-left flex-1">
              <div className="text-xs font-semibold font-tech truncate">{user.name}</div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                {user.role === 'teacher' ? 'Giáo viên' : user.className || 'Học sinh'}
              </div>
            </div>
          )}
        </button>

        <div className={`flex items-center gap-1 ${isCollapsed ? 'flex-col' : 'justify-between'}`}>
          <button
            type="button"
            onClick={onOpenSettings}
            title="Cài đặt hệ thống"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenApiKey}
            title="Cấu hình Gemini API Key"
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <Key className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Đăng xuất khỏi hệ thống"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

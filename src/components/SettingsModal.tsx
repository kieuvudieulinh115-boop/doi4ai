import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Monitor, 
  Type, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Keyboard, 
  Zap,
  Save,
  Check
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  themeMode: 'dark' | 'light';
  onToggleTheme: (theme: 'dark' | 'light') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  themeMode,
  onToggleTheme
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'shortcuts' | 'privacy'>('appearance');
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  const handleSave = () => {
    onUpdateSettings(localSettings);
    if (localSettings.theme !== 'system') {
      onToggleTheme(localSettings.theme as 'dark' | 'light');
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className={`w-full max-w-xl rounded-3xl border shadow-2xl transition-all overflow-hidden flex flex-col max-h-[85vh] ${
          isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-title" className="text-lg font-bold font-tech tracking-tight">Cài đặt ứng dụng</h2>
              <p className="text-xs text-slate-400">Tùy chỉnh giao diện, phím tắt & trải nghiệm đọc</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cài đặt"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`px-6 pt-3 flex gap-2 border-b text-xs font-mono font-medium ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'appearance'
                ? 'border-cyan-500 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Giao diện & Đọc</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shortcuts')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'shortcuts'
                ? 'border-cyan-500 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Phím tắt</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'border-cyan-500 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Bảo mật & Phiên</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Theme choice */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                  Chế độ hiển thị
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLocalSettings({ ...localSettings, theme: 'dark' });
                      onToggleTheme('dark');
                    }}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-mono font-semibold transition-all ${
                      themeMode === 'dark'
                        ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400 shadow-md shadow-cyan-500/10'
                        : isDark
                        ? 'border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-400'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span>Tối (Grok Dark)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLocalSettings({ ...localSettings, theme: 'light' });
                      onToggleTheme('light');
                    }}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-mono font-semibold transition-all ${
                      themeMode === 'light'
                        ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400 shadow-md shadow-cyan-500/10'
                        : isDark
                        ? 'border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-400'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span>Sáng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalSettings({ ...localSettings, theme: 'system' })}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-mono font-semibold transition-all ${
                      localSettings.theme === 'system'
                        ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400 shadow-md shadow-cyan-500/10'
                        : isDark
                        ? 'border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-400'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Monitor className="w-5 h-5" />
                    <span>Theo máy (System)</span>
                  </button>
                </div>
              </div>

              {/* Font Scale */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                  Cỡ chữ văn bản đọc
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['normal', 'large', 'larger'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, fontSize: size })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-mono transition-all ${
                        localSettings.fontSize === size
                          ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300 font-bold'
                          : isDark
                          ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {size === 'normal' ? 'Mặc định (100%)' : size === 'large' ? 'Lớn (115%)' : 'Rất lớn (130%)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-semibold">Âm thanh phản hồi</div>
                      <div className="text-[11px] text-slate-400">Phát âm thanh nhẹ khi hoàn tất đối chiếu dẫn chứng</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.soundEnabled}
                    onChange={(e) => setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
                  />
                </div>

                <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-semibold">Tự động phân tích khi đổi ngữ liệu</div>
                      <div className="text-[11px] text-slate-400">Gọi AI phân tích ngay khi chọn bài đọc mẫu mới</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.autoAnalyze}
                    onChange={(e) => setLocalSettings({ ...localSettings, autoAnalyze: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-3 font-mono text-xs">
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-slate-300">Gửi tin nhắn / Đối chiếu</span>
                <kbd className="px-2 py-1 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700 font-bold">Enter</kbd>
              </div>
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-slate-300">Xuống dòng trong ô nhập</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">Shift</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">Enter</kbd>
                </div>
              </div>
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-slate-300">Mở / Đóng Sidebar</span>
                <kbd className="px-2 py-1 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700 font-bold">Alt + S</kbd>
              </div>
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-slate-300">Đóng cửa sổ Pop-up</span>
                <kbd className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">Esc</kbd>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              <div className={`p-4 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'} space-y-2`}>
                <div className="font-semibold text-cyan-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Mã hóa & Xác thực
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Tài khoản được bảo vệ bằng cơ chế băm mật khẩu PBKDF2 với muối ngẫu nhiên (Salt 512-bit). Phiên làm việc phân biệt rõ giữa token lưu tạm và lưu vĩnh viễn (Remember Me).
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'} space-y-2`}>
                <div className="font-semibold text-indigo-400">Bảo mật Khóa Gemini API</div>
                <p className="text-slate-400 leading-relaxed">
                  Khóa API của bạn được mã hóa proxy qua máy chủ Express backend và không bao giờ bị lộ trong console hay mã nguồn phía client.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-tech font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Đã lưu!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

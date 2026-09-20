import { useState, type FormEvent } from 'react';
import { Key, ShieldAlert, Check, X, Eye, EyeOff, Sparkles, ExternalLink, Trash2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  themeMode: 'dark' | 'light';
}

export const ApiKeyModal = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  themeMode
}: ApiKeyModalProps) => {
  const [inputValue, setInputValue] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onSaveApiKey(inputValue.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setInputValue('');
    onSaveApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`relative rounded-3xl max-w-lg w-full flex flex-col shadow-2xl border animate-in fade-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#0f172a] border-slate-700/80 text-slate-100 shadow-cyan-500/10'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between rounded-t-3xl ${
            isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-tech flex items-center gap-2">
                <span>Cấu hình Google Gemini API Key</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  BYOK
                </span>
              </h3>
              <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Lưu an toàn trong trình duyệt (localStorage)
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

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-sm">
          <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${
            isDark ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-900'
          }`}>
            <p className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Chế độ sử dụng API Key cá nhân:
            </p>
            <p className="opacity-90">
              Hệ thống đã có sẵn chìa khóa AI phía máy chủ. Tuy nhiên bạn có thể tùy chọn nhập Google Gemini API Key của mình để tăng tốc độ phản hồi và dùng tài nguyên riêng.
            </p>
          </div>

          <div>
            <label htmlFor="gemini-key-input" className={`block text-xs font-mono font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Google Gemini API Key:
            </label>
            <div className="relative">
              <input
                id="gemini-key-input"
                type={showKey ? 'text' : 'password'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="AIzaSy..."
                className={`w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:ring-cyan-500/30 focus:border-cyan-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/30 focus:border-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                title={showKey ? 'Ẩn khóa' : 'Hiện khóa'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center justify-between">
              <span>Khóa được lưu cục bộ trên máy bạn.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                Lấy khóa miễn phí <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between font-mono">
            {apiKey ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa khóa lưu
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-3.5 py-2 text-xs rounded-xl transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold font-tech rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Đã lưu!</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Lưu cài đặt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

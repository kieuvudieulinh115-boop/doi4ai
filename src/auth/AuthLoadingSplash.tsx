import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';

interface AuthLoadingSplashProps {
  themeMode?: 'dark' | 'light';
}

export const AuthLoadingSplash: React.FC<AuthLoadingSplashProps> = ({ themeMode = 'dark' }) => {
  const isDark = themeMode === 'dark';

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center relative p-6 transition-colors ${
        isDark ? 'bg-[#080c14] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Background glow */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none -translate-y-12"></div>

      <div className="relative flex flex-col items-center text-center space-y-5 max-w-sm">
        {/* Futuristic glyph with concentric rings */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-2xl bg-cyan-500/15 animate-ping opacity-75"></div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 ring-1 ring-white/25">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold font-tech tracking-tight flex items-center justify-center gap-2">
            <span>Luyện Đọc Hiểu</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              AI Studio
            </span>
          </h1>
          <p className={`text-xs mt-1.5 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Đang xác thực phiên học tập an toàn...
          </p>
        </div>

        {/* Subtle loading bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full animate-[techScan_1.5s_ease-in-out_infinite]"></div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-500/80">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Bảo mật tiêu chuẩn GDPT 2018</span>
        </div>
      </div>
    </div>
  );
};

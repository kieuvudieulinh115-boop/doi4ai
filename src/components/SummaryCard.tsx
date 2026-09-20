import { FileText, Lightbulb, Compass, Sparkles, Cpu, Target } from 'lucide-react';

interface SummaryCardProps {
  summary: string;
  mainTheme: string;
  initialNotes?: string;
  themeMode?: 'dark' | 'light';
}

export const SummaryCard = ({
  summary,
  mainTheme,
  initialNotes,
  themeMode = 'dark'
}: SummaryCardProps) => {
  const isDark = themeMode === 'dark';

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 space-y-4 ${
        isDark
          ? 'bg-slate-900/80 border-slate-800/90 text-slate-100 shadow-lg shadow-black/20'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Title & Theme Banner */}
      <div className="flex items-start justify-between gap-3 border-b pb-3.5 border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold font-tech flex items-center gap-2">
              <span>Tóm tắt ý chính & Trục tư tưởng văn bản</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                AI CORE
              </span>
            </h3>
            {mainTheme && (
              <p className="text-xs font-mono text-cyan-400 mt-0.5 flex items-center gap-1">
                <span>Chủ đề tư tưởng:</span>
                <span className="font-sans font-semibold text-slate-200">{mainTheme}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Content Body */}
      <div
        className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
          isDark
            ? 'bg-slate-950/60 border-slate-800 text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        <span className="font-mono text-[11px] text-emerald-400 block mb-1 uppercase tracking-wider">
          // BẢN TÓM LƯỢC SÚC TÍCH:
        </span>
        <p className="font-sans font-normal">{summary}</p>
      </div>

      {/* Initial Student Notes / Prompt Input */}
      {initialNotes && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
            isDark
              ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-mono font-semibold text-amber-400 block mb-0.5">
              Ghi chú ban đầu của học sinh:
            </span>
            <span className="italic font-serif-reading">"{initialNotes}"</span>
          </div>
        </div>
      )}
    </div>
  );
};

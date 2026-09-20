import { useState } from 'react';
import { ComprehensionQuestion } from '../types';
import { QuestionItem } from './QuestionItem';
import { HelpCircle, CheckCheck, Cpu, Terminal, ShieldCheck, Target, ArrowRight } from 'lucide-react';

interface QuestionListProps {
  questions: ComprehensionQuestion[];
  onUpdateAnswer: (questionId: string, answer: string) => void;
  onCheckAnswer: (questionId: string) => Promise<void>;
  onRevealHint: (questionId: string, level: number) => void;
  onSelectCitation: (quote: string) => void;
  checkingQuestionId: string | null;
  themeMode?: 'dark' | 'light';
}

export const QuestionList = ({
  questions,
  onUpdateAnswer,
  onCheckAnswer,
  onRevealHint,
  onSelectCitation,
  checkingQuestionId,
  themeMode = 'dark'
}: QuestionListProps) => {
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const isDark = themeMode === 'dark';

  const answeredCount = questions.filter(q => q.studentAnswer.trim().length > 0).length;
  const checkedCount = questions.filter(q => Boolean(q.feedback)).length;

  return (
    <div className="space-y-4">
      {/* HUD Header Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border backdrop-blur-xl transition-all ${
          isDark
            ? 'bg-slate-900/80 border-slate-800/90 text-slate-100 shadow-lg shadow-black/20'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-bold font-tech">
              Hệ thống câu hỏi đọc hiểu & Tư duy phản biện
            </h3>
          </div>
          <p className={`text-xs mt-0.5 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Tự suy nghĩ, diễn đạt theo ngôn từ của em và tìm dẫn chứng căn cứ từ văn bản
          </p>
        </div>

        {/* Live Progress Telemetry */}
        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Tiến độ: <strong className="text-cyan-400">{answeredCount}/{questions.length}</strong>
            </span>
            <div className="w-28 h-1.5 bg-slate-800/80 rounded-full overflow-hidden mt-1 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {checkedCount === questions.length && questions.length > 0 && (
            <button
              onClick={() => setShowCompletionSummary(!showCompletionSummary)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{showCompletionSummary ? 'Ẩn đối chiếu' : 'Xem báo cáo tổng kết'}</span>
            </button>
          )}
        </div>
      </div>

      {/* High-Tech Completion Summary HUD */}
      {showCompletionSummary && (
        <div
          className={`p-5 rounded-2xl border space-y-3 animate-in fade-in duration-300 ${
            isDark
              ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-100 shadow-xl shadow-emerald-500/5'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold font-tech uppercase tracking-wide text-emerald-400">
              Báo cáo đối chiếu căn cứ đọc hiểu hoàn tất
            </h4>
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            Học sinh đã hoàn thành các câu hỏi đọc hiểu và đối chiếu trích dẫn nguyên văn với bài đọc. Dưới đây là bảng tổng hợp dữ liệu học tập:
          </p>

          <div className="space-y-2 pt-1">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800'
                    : 'bg-white border-emerald-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2 font-mono">
                  <span className="font-bold text-cyan-400">
                    Câu {idx + 1}: {q.question}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                    ĐÃ KIỂM TRA
                  </span>
                </div>

                <div className="pl-3 border-l-2 border-cyan-500 text-xs">
                  <span className="font-mono text-slate-400">Câu trả lời của em: </span>
                  <p className="mt-0.5 font-sans">{q.studentAnswer}</p>
                </div>

                {q.citationQuote && (
                  <div
                    onClick={() => onSelectCitation(q.citationQuote)}
                    className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isDark
                        ? 'bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/40 text-cyan-200'
                        : 'bg-cyan-50/70 hover:bg-cyan-100/70 border border-cyan-200 text-cyan-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 italic font-serif-reading text-xs truncate">
                      <Target className="w-3.5 h-3.5 text-cyan-400 shrink-0 not-italic" />
                      <span className="truncate">"{q.citationQuote}"</span>
                    </div>
                    <span className="text-[10px] font-mono not-italic text-cyan-400 shrink-0 flex items-center gap-0.5">
                      <span>Soi văn bản</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List of Question Items */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <QuestionItem
            key={question.id}
            question={question}
            index={index}
            onUpdateAnswer={onUpdateAnswer}
            onCheckAnswer={onCheckAnswer}
            onRevealHint={onRevealHint}
            onSelectCitation={onSelectCitation}
            isChecking={checkingQuestionId === question.id}
            themeMode={themeMode}
          />
        ))}
      </div>
    </div>
  );
};

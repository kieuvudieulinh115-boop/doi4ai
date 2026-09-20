import { useState } from 'react';
import { ComprehensionQuestion } from '../types';
import { 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  Quote, 
  Send, 
  Edit2, 
  Sparkles, 
  Target, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  Cpu
} from 'lucide-react';

interface QuestionItemProps {
  key?: string;
  question: ComprehensionQuestion;
  index: number;
  onUpdateAnswer: (questionId: string, answer: string) => void;
  onCheckAnswer: (questionId: string) => Promise<void>;
  onRevealHint: (questionId: string, level: number) => void;
  onSelectCitation: (quote: string) => void;
  isChecking: boolean;
  themeMode?: 'dark' | 'light';
}

export const QuestionItem = ({
  question,
  index,
  onUpdateAnswer,
  onCheckAnswer,
  onRevealHint,
  onSelectCitation,
  isChecking,
  themeMode = 'dark'
}: QuestionItemProps) => {
  const [isEditing, setIsEditing] = useState(true);
  const isDark = themeMode === 'dark';

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'nhan-biet':
        return {
          tag: 'LV-1 • NHẬN BIẾT',
          classes: isDark
            ? 'bg-cyan-950/70 text-cyan-300 border-cyan-700/60 shadow-xs shadow-cyan-500/10'
            : 'bg-cyan-50 text-cyan-700 border-cyan-200'
        };
      case 'thong-hieu':
        return {
          tag: 'LV-2 • THÔNG HIỂU',
          classes: isDark
            ? 'bg-amber-950/70 text-amber-300 border-amber-700/60 shadow-xs shadow-amber-500/10'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'van-dung':
        return {
          tag: 'LV-3 • VẬN DỤNG',
          classes: isDark
            ? 'bg-purple-950/70 text-purple-300 border-purple-700/60 shadow-xs shadow-purple-500/10'
            : 'bg-purple-50 text-purple-700 border-purple-200'
        };
      default:
        return {
          tag: 'ĐỌC HIỂU',
          classes: isDark
            ? 'bg-slate-800 text-slate-300 border-slate-700'
            : 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const badge = getLevelBadge(question.level);

  const handleCheck = async () => {
    if (!question.studentAnswer.trim()) return;
    await onCheckAnswer(question.id);
    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 p-5 sm:p-6 space-y-4 relative overflow-hidden ${
        isDark
          ? 'bg-slate-900/80 border-slate-800/90 text-slate-100 shadow-lg shadow-black/30 backdrop-blur-xl hover:border-slate-700'
          : 'bg-white border-slate-200/90 text-slate-900 shadow-sm hover:border-slate-300'
      }`}
    >
      {/* Top Header: Question Index & Level Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-xs">
            #{String(index + 1).padStart(2, '0')}
          </span>
          <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${badge.classes}`}>
            {badge.tag}
          </span>
        </div>

        {question.feedback && (
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 border ${
              question.feedback.isGrounded
                ? isDark
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isDark
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {question.feedback.isGrounded ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ĐÃ ĐỐI CHIẾU</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>CẦN BỔ SUNG CĂN CỨ</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Question Text */}
      <h4 className="text-sm sm:text-base font-semibold leading-relaxed font-tech">
        {question.question}
      </h4>

      {/* Answer Workspace */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={`font-mono flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>▶ Câu trả lời của em:</span>
          </span>
          {!isEditing && question.feedback && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Chỉnh sửa câu trả lời</span>
            </button>
          )}
        </div>

        <div className="relative">
          <textarea
            id={`answer-${question.id}`}
            rows={3}
            value={question.studentAnswer}
            onChange={(e) => onUpdateAnswer(question.id, e.target.value)}
            placeholder="Ghi câu trả lời của em tại đây dựa trên chi tiết trong bài đọc..."
            disabled={!isEditing && Boolean(question.feedback) && isChecking}
            className={`w-full p-3.5 text-sm rounded-xl border font-sans leading-relaxed transition-all focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-slate-950/70 border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:ring-cyan-500/20 focus:border-cyan-500'
                : 'bg-slate-50/70 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-500'
            }`}
          />
        </div>
      </div>

      {/* Action Toolbar: Multi-Level Hints & AI Check Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Hints Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onRevealHint(question.id, question.revealedHints === 1 ? 0 : 1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1.5 transition-all ${
              question.revealedHints >= 1
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{question.revealedHints >= 1 ? 'Đóng gợi ý 1' : 'Gợi ý 1 (Định hướng)'}</span>
          </button>

          <button
            type="button"
            onClick={() => onRevealHint(question.id, question.revealedHints === 2 ? 1 : 2)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1.5 transition-all ${
              question.revealedHints >= 2
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                : isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Quote className="w-3.5 h-3.5 text-indigo-400" />
            <span>{question.revealedHints >= 2 ? 'Đóng gợi ý 2' : 'Gợi ý 2 (Dẫn chứng)'}</span>
          </button>
        </div>

        {/* AI Grounded Check Button */}
        <button
          type="button"
          onClick={handleCheck}
          disabled={!question.studentAnswer.trim() || isChecking}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-tech font-bold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
        >
          {isChecking ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Đang quét dẫn chứng...</span>
            </>
          ) : (
            <>
              <Cpu className="w-3.5 h-3.5 text-cyan-300" />
              <span>Đối chiếu với văn bản</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Hint 1 Box */}
      {question.revealedHints >= 1 && (
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-1 animate-in fade-in duration-200 ${
            isDark
              ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="font-mono font-semibold flex items-center gap-1.5 text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GỢI Ý MỨC 1 (ĐỊNH HƯỚNG SUY NGHĨ):</span>
          </div>
          <p className="leading-relaxed pl-5 font-sans">{question.hintLevel1}</p>
        </div>
      )}

      {/* Hint 2 Box */}
      {question.revealedHints >= 2 && (
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
            isDark
              ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          <div className="font-mono font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Quote className="w-3.5 h-3.5" />
              <span>GỢI Ý MỨC 2 (MANH MỐI TRÍCH DẪN):</span>
            </span>
            <button
              onClick={() => onSelectCitation(question.citationQuote)}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 flex items-center gap-1 transition-colors"
            >
              <Target className="w-3 h-3" />
              <span>Soi vị trí bài đọc</span>
            </button>
          </div>
          <p className="leading-relaxed pl-5 font-sans">{question.hintLevel2}</p>
          {question.citationQuote && (
            <div className="pl-5 italic font-serif-reading border-l-2 border-indigo-500 py-0.5 opacity-90">
              "{question.citationQuote}"
            </div>
          )}
        </div>
      )}

      {/* AI Grounded Feedback HUD */}
      {question.feedback && (
        <div
          className={`pt-4 border-t space-y-3 animate-in fade-in duration-300 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          {/* Grounded Status Banner */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {question.feedback.isGrounded ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CĂN CỨ VĂN BẢN: ĐẠT TIÊU CHUẨN</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>CẦN DẪN CHỨNG RÕ HƠN</span>
                </div>
              )}
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              GEMINI NLP CHECK
            </span>
          </div>

          {/* Feedback Commentary */}
          <div
            className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
              isDark
                ? 'bg-slate-950/60 border-slate-800 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <span className="font-mono text-xs font-semibold text-cyan-400 block mb-1">
              // NHẬN XÉT SƯ PHẠM:
            </span>
            <p className="font-sans">{question.feedback.feedbackComment}</p>
          </div>

          {/* Citation Evidence Radar Cards */}
          {question.feedback.citationQuotes && question.feedback.citationQuotes.length > 0 && (
            <div
              className={`p-3.5 rounded-xl border space-y-2 ${
                isDark
                  ? 'bg-cyan-950/20 border-cyan-800/40'
                  : 'bg-cyan-50/50 border-cyan-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  DẪN CHỨNG TRÍCH XUẤT TỪ VĂN BẢN GỐC:
                </span>
              </div>
              <div className="space-y-1.5">
                {question.feedback.citationQuotes.map((quote, qIdx) => (
                  <div
                    key={qIdx}
                    onClick={() => onSelectCitation(quote)}
                    className={`p-2.5 rounded-lg border text-xs font-serif-reading italic cursor-pointer flex items-center justify-between gap-3 group transition-all ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-700/80 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 text-slate-200'
                        : 'bg-white border-slate-200 hover:border-cyan-500 hover:shadow-xs text-slate-800'
                    }`}
                    title="Bấm để kích hoạt radar laser soi chiếu trên bài đọc"
                  >
                    <span>"{quote}"</span>
                    <span className="text-[10px] font-mono not-italic px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0 flex items-center gap-1">
                      <span>Soi bài</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guided Hint for Self-Refining */}
          {question.feedback.guidedHint && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                isDark
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : 'bg-slate-100/80 border-slate-200 text-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-semibold text-purple-400">Gợi ý tự hoàn thiện: </span>
                <span className="font-sans">{question.feedback.guidedHint}</span>
              </div>
            </div>
          )}

          {/* Self-Refine Edit Button */}
          {!isEditing && (
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-mono px-3 py-1.5 rounded-lg border text-cyan-400 hover:text-cyan-300 border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-500/10 transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3 h-3" />
                <span>Hoàn thiện lại câu trả lời theo dẫn chứng</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Copy, 
  Check, 
  RotateCcw, 
  BookOpen, 
  HelpCircle, 
  Lightbulb, 
  Zap,
  CornerDownLeft,
  ChevronDown
} from 'lucide-react';
import { ChatMessage, ChatConversation } from '../types';
import { useToast } from '../context/ToastContext';

interface AiChatPaneProps {
  passageTitle: string;
  passageText: string;
  grade: string;
  customApiKey?: string;
  themeMode: 'dark' | 'light';
  onInsertQuoteToAnswer?: (quote: string) => void;
  activeConversation: ChatConversation;
  onUpdateConversation: (updated: ChatConversation) => void;
}

export const AiChatPane: React.FC<AiChatPaneProps> = ({
  passageTitle,
  passageText,
  grade,
  customApiKey,
  themeMode,
  activeConversation,
  onUpdateConversation
}) => {
  const { showToast } = useToast();
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDark = themeMode === 'dark';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation.messages, isGenerating]);

  // Adjust textarea height dynamically
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast('Đã sao chép phản hồi vào clipboard', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Không thể sao chép văn bản.', 'error');
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputPrompt).trim();
    if (!textToSend || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...activeConversation.messages, userMessage];
    const updatedConv: ChatConversation = {
      ...activeConversation,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
      // Auto-title conversation from first user query if still generic
      title: activeConversation.messages.length === 0 ? textToSend.slice(0, 32) + '...' : activeConversation.title
    };

    onUpdateConversation(updatedConv);
    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey ? { 'x-gemini-api-key': customApiKey } : {})
        },
        body: JSON.stringify({
          messages: updatedMessages,
          contextPassage: passageText,
          contextTitle: passageTitle,
          grade,
          customApiKey
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Lỗi khi nhận phản hồi từ AI.');
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.content || 'Không có phản hồi từ máy chủ.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        model: data.model || 'Gemini 3.8 Flash'
      };

      onUpdateConversation({
        ...updatedConv,
        messages: [...updatedMessages, assistantMessage],
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      showToast(err.message || 'Lỗi xử lý AI.', 'error', 'AI Assistant');
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `⚠️ **Không thể hoàn tất phân tích:** ${err.message || 'Lỗi kết nối mạng hoặc phiên làm việc tạm gián đoạn.'}\n\n*Vui lòng bấm nút 'Thử lại' hoặc kiểm tra cấu hình Gemini API Key.*`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      onUpdateConversation({
        ...updatedConv,
        messages: [...updatedMessages, errorMessage]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    {
      label: 'Phân tích thông điệp',
      prompt: 'Hãy phân tích thông điệp nhân văn sâu sắc nhất của đoạn văn này và dẫn chứng cụ thể.'
    },
    {
      label: 'Giải mã từ khó',
      prompt: 'Tìm các từ ngữ mang hàm ý nghệ thuật cao trong bài và giải thích dụng ý của tác giả.'
    },
    {
      label: 'Gợi ý cách viết đoạn văn',
      prompt: 'Hướng dẫn em dàn ý viết đoạn văn nghị luận 200 chữ cảm nhận về chi tiết nổi bật nhất.'
    },
    {
      label: 'Tập phản biện ý kiến',
      prompt: 'Đặt cho em một câu hỏi phản biện mở về quan điểm của tác giả trong văn bản này.'
    }
  ];

  return (
    <div className={`flex flex-col h-full rounded-2xl border backdrop-blur-xl transition-all ${
      isDark ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-white/95 border-slate-200'
    }`}>
      {/* Chat Pane Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold font-tech text-white tracking-wide">
                Trợ lý AI Đọc Hiểu Sâu
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                GEMINI 3.8 FLASH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[280px]">
              Ngữ liệu: {passageTitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onUpdateConversation({
              ...activeConversation,
              messages: [],
              updatedAt: new Date().toISOString()
            });
            showToast('Đã bắt đầu phiên đối thoại mới', 'info');
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 font-mono"
          title="Làm mới cuộc trò chuyện"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
        {activeConversation.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
              <Bot className="w-7 h-7" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h4 className="text-sm sm:text-base font-bold font-tech text-white">
                Hỏi đáp phân tích văn bản cùng AI
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đặt bất kỳ câu hỏi nào về từ ngữ, nghệ thuật trần thuật, dụng ý tác giả, hoặc nhờ AI phân tích cấu trúc luận điểm.
              </p>
            </div>

            {/* Quick Prompt Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md pt-2">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(item.prompt)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all flex items-start gap-2 ${
                    isDark
                      ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          activeConversation.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 shadow-sm transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-none'
                      : isDark
                      ? 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none'
                      : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {/* Message Meta Info */}
                  <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-mono opacity-75">
                    <span className="font-semibold">{isUser ? 'Bạn' : 'Trợ lý AI'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Content with line breaks */}
                  <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-sans space-y-2">
                    {msg.content}
                  </div>

                  {/* Action Bar for AI response */}
                  {!isUser && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="text-[10px] text-cyan-400/80">{msg.model || 'Gemini 3.8'}</span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="p-1 rounded hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                          title="Sao chép nội dung"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px]">{copiedId === msg.id ? 'Đã chép' : 'Chép'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isGenerating && (
          <div className="flex gap-3 items-start justify-start animate-in fade-in duration-300">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className={`p-3.5 rounded-2xl rounded-bl-none border flex items-center gap-2 text-xs font-mono ${
              isDark ? 'bg-slate-900/90 border-slate-800 text-cyan-300' : 'bg-slate-100 border-slate-200 text-cyan-700'
            }`}>
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span>AI đang phân tích ngữ cảnh bài đọc...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Futuristic Floating Input Bar (Grok style) */}
      <div className={`p-3 border-t ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'}`}>
        <div className={`relative rounded-2xl border transition-all shadow-inner focus-within:ring-2 focus-within:ring-cyan-500/40 focus-within:border-cyan-500 ${
          isDark ? 'bg-[#0a0f1d] border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
        }`}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputPrompt}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi AI phân tích bài đọc (Nhấn Enter để gửi, Shift+Enter xuống dòng)..."
            disabled={isGenerating}
            className="w-full py-3 pl-4 pr-12 bg-transparent text-xs sm:text-sm resize-none focus:outline-hidden leading-relaxed font-sans placeholder:text-slate-500 max-h-36 overflow-y-auto"
          />

          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isGenerating}
              className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                inputPrompt.trim() && !isGenerating
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-1.5 px-1">
          <span>Hỗ trợ phân tích dẫn chứng chính xác & tư duy mở</span>
          <span className="hidden sm:inline">Phím tắt: Enter gửi, Alt+S menu</span>
        </div>
      </div>
    </div>
  );
};

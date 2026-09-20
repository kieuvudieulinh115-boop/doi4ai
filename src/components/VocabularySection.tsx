import { useState } from 'react';
import { BookMarked, Eye, Sparkles, Target, Search, Compass, ExternalLink } from 'lucide-react';
import { VocabItem } from '../types';

interface VocabularySectionProps {
  vocabulary: VocabItem[];
  selectedVocab: VocabItem | null;
  onSelectVocab: (vocab: VocabItem) => void;
  themeMode?: 'dark' | 'light';
}

export const VocabularySection = ({
  vocabulary,
  selectedVocab,
  onSelectVocab,
  themeMode = 'dark'
}: VocabularySectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = themeMode === 'dark';

  const filteredVocab = vocabulary.filter(v =>
    v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.contextMeaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!vocabulary || vocabulary.length === 0) {
    return (
      <div
        className={`rounded-2xl border p-8 text-center text-sm font-mono ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
        }`}
      >
        // CHƯA CÓ DỮ LIỆU TỪ KHÓ TRONG ĐOẠN VĂN
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header & Search Bar */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 ${
          isDark
            ? 'bg-slate-900/80 border-slate-800/90 text-slate-100 shadow-lg shadow-black/20'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookMarked className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold font-tech flex items-center gap-2">
              <span>Hệ thống từ khó & Giải nghĩa theo ngữ cảnh</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {vocabulary.length} từ ngữ
              </span>
            </h3>
            <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Bấm vào từng thẻ để kích hoạt radar định vị câu văn gốc trong bài đọc
            </p>
          </div>
        </div>

        {/* Quick Filter */}
        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm từ khó..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-slate-950/70 border-slate-700/80 text-slate-200 placeholder:text-slate-500 focus:ring-indigo-500/30 focus:border-indigo-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500/30 focus:border-indigo-500'
            }`}
          />
        </div>
      </div>

      {/* Grid of Vocabulary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredVocab.map((item) => {
          const isSelected = selectedVocab?.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectVocab(item)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative flex flex-col justify-between group ${
                isSelected
                  ? isDark
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                    : 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-400'
                  : isDark
                  ? 'border-slate-800/90 bg-slate-900/70 hover:border-indigo-500/50 hover:bg-slate-800/80 text-slate-200'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/80 text-slate-800'
              }`}
            >
              <div>
                {/* Word & Part of Speech */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-bold text-base font-tech flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-indigo-400 animate-ping' : 'bg-indigo-500'
                      }`}
                    ></span>
                    <span className={isSelected ? 'text-indigo-400' : ''}>{item.word}</span>
                  </span>

                  {item.partOfSpeech && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase shrink-0 ${
                        isDark
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.partOfSpeech}
                    </span>
                  )}
                </div>

                {/* Contextual Meaning */}
                <p className="text-xs sm:text-sm leading-relaxed mb-3">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-indigo-400 block mb-0.5">
                    Nghĩa ngữ cảnh:
                  </span>
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    {item.contextMeaning}
                  </span>
                </p>
              </div>

              {/* Original sentence in passage */}
              {item.originalSentence && (
                <div
                  className={`pt-2 border-t text-xs italic font-serif-reading p-2.5 rounded-xl ${
                    isDark
                      ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                      : 'bg-slate-50 border-slate-200/80 text-slate-700'
                  }`}
                >
                  <span className="not-italic font-mono text-[10px] text-slate-500 block mb-1">
                    CÂU VĂN GỐC TRONG BÀI:
                  </span>
                  "{item.originalSentence}"
                </div>
              )}

              {/* Action indicator */}
              <div className="mt-3 flex items-center justify-end text-xs font-mono text-indigo-400 group-hover:text-indigo-300">
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  {isSelected ? 'Đang kích hoạt radar' : 'Định vị câu văn trong bài ↗'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

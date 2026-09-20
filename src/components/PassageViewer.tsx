import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Play,
  Pause,
  RotateCcw,
  SlidersHorizontal, 
  Settings,
  Loader2,
  Headphones,
  Check,
  X,
  Target, 
  FileText, 
  Info,
  Sparkles
} from 'lucide-react';
import { VocabItem } from '../types';

interface PassageViewerProps {
  title: string;
  passage: string;
  gradeLabel: string;
  selectedCitation: string | null;
  selectedVocab: VocabItem | null;
  onClearCitation: () => void;
  vocabulary: VocabItem[];
  onSelectVocab: (vocab: VocabItem) => void;
  themeMode: 'dark' | 'light';
}

type AudioEngineType = 'natural' | 'system';
type AudioStatusType = 'idle' | 'loading' | 'playing' | 'paused';

export const PassageViewer = ({
  title,
  passage,
  gradeLabel,
  selectedCitation,
  selectedVocab,
  onClearCitation,
  vocabulary,
  onSelectVocab,
  themeMode
}: PassageViewerProps) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [readingParchment, setReadingParchment] = useState(false);
  const isDark = themeMode === 'dark';

  // Advanced Text-To-Speech State
  const [audioEngine, setAudioEngine] = useState<AudioEngineType>('natural');
  const [audioStatus, setAudioStatus] = useState<AudioStatusType>('idle');
  const [audioSpeed, setAudioSpeed] = useState<number>(0.95);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedSystemVoice, setSelectedSystemVoice] = useState<string>('');
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const cachedPassageRef = useRef<string>('');

  // Calculate passage statistics
  const wordCount = useMemo(() => {
    return passage ? passage.trim().split(/\s+/).length : 0;
  }, [passage]);

  const paragraphCount = useMemo(() => {
    return passage ? passage.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
  }, [passage]);

  const fontClass = {
    normal: 'text-[15px] sm:text-[16px] leading-[1.8]',
    large: 'text-[17px] sm:text-[18px] leading-[1.9]',
    larger: 'text-[19px] sm:text-[20px] leading-[2.1]'
  }[fontSize];

  // Stop audio and cleanup on unmount or passage change
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAudioStatus('idle');
    setAudioProgress(0);
    setAudioCurrentTime(0);
  };

  useEffect(() => {
    stopAudio();
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    cachedPassageRef.current = '';
  }, [passage]);

  // Load available system voices for fallback/choice
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const detectVoices = () => {
      const all = window.speechSynthesis.getVoices();
      const vi = all.filter(v => 
        v.lang.toLowerCase().includes('vi') || 
        v.name.toLowerCase().includes('vietnam') || 
        v.name.toLowerCase().includes('tiếng việt') ||
        v.name.toLowerCase().includes('hoaimy') ||
        v.name.toLowerCase().includes('namminh')
      );
      setSystemVoices(vi.length > 0 ? vi : all);
      if (vi.length > 0 && !selectedSystemVoice) {
        setSelectedSystemVoice(vi[0].name);
      }
    };

    detectVoices();
    window.speechSynthesis.onvoiceschanged = detectVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Play natural audio via backend proxy
  const playNaturalAudio = async () => {
    setAudioStatus('loading');
    setAudioError(null);

    try {
      let audioUrl = blobUrlRef.current;
      if (!audioUrl || cachedPassageRef.current !== passage) {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: passage })
        });

        if (!response.ok) {
          throw new Error('Không thể tải luồng âm thanh từ máy chủ');
        }

        const blob = await response.blob();
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        audioUrl = URL.createObjectURL(blob);
        blobUrlRef.current = audioUrl;
        cachedPassageRef.current = passage;
      }

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.src = audioUrl;
      audio.playbackRate = audioSpeed;

      audio.ontimeupdate = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setAudioCurrentTime(audio.currentTime);
          setAudioDuration(audio.duration);
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onended = () => {
        setAudioStatus('idle');
        setAudioProgress(0);
        setAudioCurrentTime(0);
      };

      audio.onerror = () => {
        setAudioError('Không phát được âm thanh tự nhiên, đang chuyển sang giọng máy...');
        playSystemAudio();
      };

      await audio.play();
      setAudioStatus('playing');
    } catch (err: any) {
      console.warn('Lỗi đọc tự nhiên, chuyển sang giọng máy:', err);
      setAudioError('Đang dùng giọng máy hỗ trợ do luồng âm thanh tự nhiên bận.');
      playSystemAudio();
    }
  };

  // Play browser system speech
  const playSystemAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt chưa hỗ trợ Text-to-speech.');
      setAudioStatus('idle');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(passage);
    utterance.lang = 'vi-VN';
    utterance.rate = audioSpeed;
    utterance.pitch = 1.0;

    if (selectedSystemVoice) {
      const match = systemVoices.find(v => v.name === selectedSystemVoice);
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => setAudioStatus('playing');
    utterance.onend = () => {
      setAudioStatus('idle');
      setAudioProgress(0);
    };
    utterance.onerror = () => {
      setAudioStatus('idle');
    };

    window.speechSynthesis.speak(utterance);
    setAudioStatus('playing');
  };

  // Main toggle handler
  const handleTogglePlay = () => {
    if (audioStatus === 'playing') {
      if (audioEngine === 'natural' && audioRef.current) {
        audioRef.current.pause();
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setAudioStatus('paused');
    } else if (audioStatus === 'paused') {
      if (audioEngine === 'natural' && audioRef.current) {
        audioRef.current.play();
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
      setAudioStatus('playing');
    } else {
      if (audioEngine === 'natural') {
        playNaturalAudio();
      } else {
        playSystemAudio();
      }
    }
  };

  // Replay from beginning
  const handleReplay = () => {
    if (audioEngine === 'natural' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setAudioStatus('playing');
    } else {
      stopAudio();
      setTimeout(() => playSystemAudio(), 80);
    }
  };

  // Change playback speed
  const handleSpeedChange = (speed: number) => {
    setAudioSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    if (audioEngine === 'system' && audioStatus === 'playing') {
      stopAudio();
      setTimeout(() => playSystemAudio(), 80);
    }
  };

  // Timeline seeker
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioEngine !== 'natural' || !audioRef.current || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = ratio * audioDuration;
    setAudioProgress(ratio * 100);
  };

  // Render passage content with high-tech laser citation & vocab highlights
  const renderedContent = useMemo(() => {
    if (!passage) return null;

    const paragraphs = passage.split(/\n+/).filter(p => p.trim().length > 0);
    const cleanCitation = selectedCitation ? selectedCitation.trim() : null;

    return paragraphs.map((para, pIdx) => {
      // 1. If citation matches paragraph
      if (cleanCitation && cleanCitation.length > 5 && para.includes(cleanCitation)) {
        const parts = para.split(cleanCitation);
        return (
          <p key={pIdx} className="mb-5 relative group">
            <span className="absolute -left-3 top-1 bottom-1 w-1 bg-cyan-400 rounded-full animate-pulse"></span>
            {parts[0]}
            <mark 
              className="citation-highlight-laser font-semibold"
              title="Dẫn chứng nguyên văn đang được đối chiếu"
            >
              <span className="inline-flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-cyan-400 inline shrink-0 animate-spin" />
                <span>{cleanCitation}</span>
              </span>
            </mark>
            {parts.slice(1).join(cleanCitation)}
          </p>
        );
      }

      // 2. If vocab word is selected
      if (selectedVocab && para.toLowerCase().includes(selectedVocab.word.toLowerCase())) {
        const regex = new RegExp(`(${selectedVocab.word})`, 'gi');
        const parts = para.split(regex);
        return (
          <p key={pIdx} className="mb-5">
            {parts.map((part, idx) =>
              part.toLowerCase() === selectedVocab.word.toLowerCase() ? (
                <span
                  key={idx}
                  className="vocab-tech-badge font-semibold"
                  title={`Từ khó: ${selectedVocab.word} — ${selectedVocab.contextMeaning}`}
                >
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </p>
        );
      }

      // Normal paragraph
      return (
        <p key={pIdx} className="mb-5">
          {para}
        </p>
      );
    });
  }, [passage, selectedCitation, selectedVocab]);

  return (
    <div
      className={`rounded-2xl border flex flex-col h-full overflow-hidden transition-all duration-300 relative ${
        isDark
          ? 'bg-slate-900/90 border-slate-800/80 shadow-xl shadow-black/40 backdrop-blur-xl'
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}
    >
      {/* Top Control HUD */}
      <div
        className={`px-4 sm:px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark
            ? 'bg-slate-900/80 border-slate-800/90 text-slate-200'
            : 'bg-slate-50/80 border-slate-200/80 text-slate-800'
        }`}
      >
        {/* Document Title & Meta */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold truncate font-tech">
                {title || 'Văn bản đọc hiểu'}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="text-cyan-400">{gradeLabel}</span>
              <span>•</span>
              <span>{wordCount} từ</span>
              <span>•</span>
              <span>{paragraphCount} đoạn</span>
            </div>
          </div>
        </div>

        {/* HUD Toolset: Audio Reader, Parchment, Font Size */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {/* TTS Audio Read Button Group */}
          <div className="inline-flex items-center rounded-lg border border-slate-700/70 p-0.5 bg-slate-800/50">
            <button
              onClick={handleTogglePlay}
              disabled={audioStatus === 'loading'}
              className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all ${
                audioStatus === 'playing'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : audioStatus === 'paused'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : audioStatus === 'loading'
                  ? 'bg-slate-700 text-slate-400 cursor-wait'
                  : isDark
                  ? 'bg-transparent hover:bg-slate-700 text-slate-200'
                  : 'bg-transparent hover:bg-slate-200 text-slate-700'
              }`}
              title={
                audioStatus === 'playing'
                  ? 'Tạm dừng đọc'
                  : audioStatus === 'paused'
                  ? 'Tiếp tục đọc'
                  : 'Nghe AI đọc mẫu văn bản (Giọng chuẩn Tiếng Việt)'
              }
            >
              {audioStatus === 'loading' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : audioStatus === 'playing' ? (
                <Pause className="w-3.5 h-3.5 text-slate-950" />
              ) : (
                <Headphones className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>
                {audioStatus === 'loading'
                  ? 'Đang tải...'
                  : audioStatus === 'playing'
                  ? 'Tạm dừng'
                  : audioStatus === 'paused'
                  ? 'Tiếp tục'
                  : 'Đọc mẫu'}
              </span>
            </button>

            {/* Voice Settings Gear Button */}
            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className={`p-1.5 rounded-md transition-colors ${
                showVoiceSettings
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Cài đặt giọng đọc (Giọng tự nhiên, tốc độ)"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Parchment / Paper Theme Switcher */}
          <button
            onClick={() => setReadingParchment(!readingParchment)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              readingParchment
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                : isDark
                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Chế độ trang giấy đọc ấm chống mỏi mắt"
          >
            <span className="text-[11px]">Giấy ngà</span>
          </button>

          {/* Font Controls */}
          <div className="flex items-center gap-1 border border-slate-700/60 p-0.5 rounded-lg bg-slate-800/40">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                fontSize === 'normal'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Cỡ chữ tiêu chuẩn"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                fontSize === 'large'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Cỡ chữ lớn"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('larger')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                fontSize === 'larger'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Cỡ chữ rất lớn"
            >
              A++
            </button>
          </div>
        </div>
      </div>

      {/* Voice Settings Popover/Modal */}
      {showVoiceSettings && (
        <div className="p-3.5 bg-slate-900 border-b border-cyan-500/30 text-xs font-mono animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Tùy chỉnh giọng đọc mẫu:
            </span>
            <button
              onClick={() => setShowVoiceSettings(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Engine Selection */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">Nguồn âm thanh:</span>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    stopAudio();
                    setAudioEngine('natural');
                  }}
                  className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    audioEngine === 'natural'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-bold">Giọng tự nhiên chuẩn (Khuyên dùng)</div>
                      <div className="text-[10px] text-slate-400">Rõ ràng, truyền cảm, phát âm chuẩn tiếng Việt</div>
                    </div>
                  </div>
                  {audioEngine === 'natural' && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </button>

                <button
                  onClick={() => {
                    stopAudio();
                    setAudioEngine('system');
                  }}
                  className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    audioEngine === 'system'
                      ? 'bg-indigo-950/60 border-indigo-400 text-indigo-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold">Giọng máy hệ thống (Web Speech)</div>
                    <div className="text-[10px] text-slate-400">Giọng đọc cài đặt sẵn trong máy tính/trình duyệt</div>
                  </div>
                  {audioEngine === 'system' && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                </button>
              </div>

              {/* If system voice is active and multiple voices exist */}
              {audioEngine === 'system' && systemVoices.length > 0 && (
                <div className="mt-2">
                  <label className="text-[10px] text-slate-400 block mb-1">Chọn giọng hệ thống:</label>
                  <select
                    value={selectedSystemVoice}
                    onChange={(e) => {
                      stopAudio();
                      setSelectedSystemVoice(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-1 text-[11px]"
                  >
                    {systemVoices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Playback Speed Selection */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">Tốc độ đọc:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { speed: 0.85, label: '0.85x Chậm rõ' },
                  { speed: 0.95, label: 'Chuẩn (1x)' },
                  { speed: 1.15, label: '1.15x Nhanh' }
                ].map((item) => (
                  <button
                    key={item.speed}
                    onClick={() => handleSpeedChange(item.speed)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                      audioSpeed === item.speed
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-2.5 p-2 rounded bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                💡 <strong className="text-slate-300">Gợi ý học tập:</strong> Tốc độ <span className="text-cyan-300 font-bold">0.85x</span> giúp học sinh nghe rõ từng thanh điệu và đối chiếu văn bản tốt nhất.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating/Pinned Audio Player Bar when audio is active */}
      {audioStatus !== 'idle' && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-slate-950 via-cyan-950/50 to-slate-950 border-b border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Animated Equalizer Waves */}
            <div className="flex items-end gap-0.5 h-4 shrink-0">
              <span className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${audioStatus === 'playing' ? 'h-4 animate-bounce' : 'h-1.5'}`}></span>
              <span className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${audioStatus === 'playing' ? 'h-3 animate-pulse' : 'h-2'}`}></span>
              <span className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${audioStatus === 'playing' ? 'h-4 animate-bounce' : 'h-1'}`}></span>
              <span className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${audioStatus === 'playing' ? 'h-2 animate-pulse' : 'h-1.5'}`}></span>
            </div>

            <div className="min-w-0">
              <div className="text-cyan-300 font-bold flex items-center gap-1.5 truncate">
                <span>{audioStatus === 'playing' ? 'Đang đọc văn bản' : audioStatus === 'paused' ? 'Tạm dừng đọc' : 'Đang tải âm thanh...'}</span>
                <span className="text-[10px] text-slate-400">({audioEngine === 'natural' ? 'Giọng chuẩn tiếng Việt' : 'Giọng máy'})</span>
              </div>
              {audioEngine === 'natural' && audioDuration > 0 && (
                <div className="text-[10px] text-slate-400 font-mono">
                  {formatTime(audioCurrentTime)} / {formatTime(audioDuration)}
                </div>
              )}
            </div>
          </div>

          {/* Quick Player Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Seeker line for natural audio */}
            {audioEngine === 'natural' && audioDuration > 0 && (
              <div
                onClick={handleSeek}
                className="w-32 sm:w-48 h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative group border border-slate-700"
                title="Bấm để tua đến vị trí mong muốn"
              >
                <div
                  className="h-full bg-cyan-400 transition-all group-hover:bg-cyan-300"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            )}

            {/* Play/Pause */}
            <button
              onClick={handleTogglePlay}
              className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold transition-transform active:scale-95"
              title={audioStatus === 'playing' ? 'Tạm dừng' : 'Tiếp tục'}
            >
              {audioStatus === 'playing' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Replay */}
            <button
              onClick={handleReplay}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Nghe lại từ đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Stop / Close */}
            <button
              onClick={stopAudio}
              className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-700/50 transition-colors"
              title="Dừng và đóng thanh đọc"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Active Citation Laser Banner */}
      {selectedCitation && (
        <div className="px-4 py-2 bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-900 border-b border-cyan-500/40 flex items-center justify-between text-xs text-cyan-200 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0 flex items-center gap-1">
              <Target className="w-3 h-3 text-cyan-400" />
              Dẫn chứng đang soi
            </span>
            <span className="truncate italic font-serif-reading text-cyan-100">
              "{selectedCitation}"
            </span>
          </div>
          <button
            onClick={onClearCitation}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-200 underline ml-2 shrink-0"
          >
            [Xóa vệt soi]
          </button>
        </div>
      )}

      {/* Interactive Vocab Quick Bar */}
      {vocabulary.length > 0 && (
        <div
          className={`px-4 py-2 border-b flex items-center gap-2 overflow-x-auto text-xs ${
            isDark
              ? 'bg-slate-950/50 border-slate-800/80 text-slate-400'
              : 'bg-slate-50/60 border-slate-200/80 text-slate-600'
          }`}
        >
          <span className="font-mono text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1 text-indigo-400">
            <Info className="w-3 h-3" />
            Từ khó:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {vocabulary.map((v) => (
              <button
                key={v.id}
                onClick={() => onSelectVocab(v)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                  selectedVocab?.id === v.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/30 ring-1 ring-indigo-400'
                    : isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                {v.word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reading Canvas Body */}
      <div
        className={`p-6 sm:p-7 overflow-y-auto flex-1 font-serif-reading transition-colors relative ${
          readingParchment
            ? 'bg-[#fbf7ee] text-stone-900 selection:bg-amber-200 selection:text-amber-950'
            : isDark
            ? 'bg-slate-900/60 text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200'
            : 'bg-white text-slate-800 selection:bg-cyan-100 selection:text-cyan-900'
        }`}
      >
        <div className={`${fontClass} tracking-normal`}>
          {renderedContent}
        </div>
      </div>

      {/* Futuristic Telemetry Footer */}
      <div
        className={`px-4 py-2.5 border-t text-[11px] font-mono flex items-center justify-between ${
          isDark
            ? 'bg-[#0a0f1d] border-slate-800 text-slate-400'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>GROUNDED CITATION RADAR</span>
        </div>
        <span className="hidden sm:inline text-slate-500">
          Chỉ dựa vào thông tin văn bản gốc • GDPT 2018
        </span>
      </div>
    </div>
  );
};

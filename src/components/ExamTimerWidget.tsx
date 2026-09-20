import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Bell, 
  BellOff, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Flame,
  ChevronDown
} from 'lucide-react';
import { playChimeSound } from '../utils/audioAlert';

export type ExamDuration = 15 | 45 | 90 | 0; // 0 = stopwatch (đếm xuôi)

interface ExamTimerWidgetProps {
  themeMode: 'dark' | 'light';
  onTimeUp?: () => void;
}

export const ExamTimerWidget: React.FC<ExamTimerWidgetProps> = ({ themeMode, onTimeUp }) => {
  const isDark = themeMode === 'dark';

  // Config & state
  const [selectedDuration, setSelectedDuration] = useState<ExamDuration>(45);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warned5MinRef = useRef<boolean>(false);

  // Calculate total seconds for current preset
  const totalPresetSeconds = selectedDuration === 0 ? 0 : selectedDuration * 60;

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer interval effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (selectedDuration === 0) {
          // Stopwatch mode: count up
          setElapsedSeconds((prev) => prev + 1);
        } else {
          // Countdown mode
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              // Time's up!
              setIsRunning(false);
              setIsFinished(true);
              if (soundAlerts) {
                playChimeSound('finish');
              }
              if (onTimeUp) onTimeUp();
              return 0;
            }

            // Warning at 5 minutes (300 seconds)
            if (prev === 300 && !warned5MinRef.current) {
              warned5MinRef.current = true;
              if (soundAlerts) {
                playChimeSound('warning');
              }
            }

            return prev - 1;
          });
          setElapsedSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, selectedDuration, soundAlerts, onTimeUp]);

  // Handle duration change
  const handleSelectDuration = (duration: ExamDuration) => {
    setIsRunning(false);
    setSelectedDuration(duration);
    setIsFinished(false);
    warned5MinRef.current = false;
    setElapsedSeconds(0);
    if (duration === 0) {
      setSecondsRemaining(0);
    } else {
      setSecondsRemaining(duration * 60);
    }
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    warned5MinRef.current = false;
    setElapsedSeconds(0);
    if (selectedDuration === 0) {
      setSecondsRemaining(0);
    } else {
      setSecondsRemaining(selectedDuration * 60);
    }
    playChimeSound('click');
  };

  const handleTogglePlay = () => {
    if (!isRunning) {
      if (isFinished) {
        handleReset();
      }
      setIsRunning(true);
      playChimeSound('start');
    } else {
      setIsRunning(false);
      playChimeSound('click');
    }
  };

  // Progress percentage
  const progressPercent = totalPresetSeconds > 0 
    ? Math.min(100, Math.max(0, ((totalPresetSeconds - secondsRemaining) / totalPresetSeconds) * 100))
    : 0;

  const isLowTime = selectedDuration > 0 && secondsRemaining <= 300 && secondsRemaining > 0;

  return (
    <>
      {/* Compact Header Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpenModal(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all relative ${
          isFinished
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse ring-1 ring-rose-400/40'
            : isLowTime
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-1 ring-amber-400/40'
            : isRunning
            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-xs'
            : isDark
            ? 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
        }`}
        title="Đồng hồ bấm giờ làm bài thi"
      >
        <Clock className={`w-3.5 h-3.5 ${isRunning ? 'text-cyan-400 animate-spin' : isFinished ? 'text-rose-400' : 'text-slate-400'}`} style={{ animationDuration: '4s' }} />
        <span className="font-bold">
          {selectedDuration === 0 ? formatTime(elapsedSeconds) : formatTime(secondsRemaining)}
        </span>
        {isRunning && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
        )}
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {/* Full Modal HUD Control */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 relative overflow-hidden ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-cyan-950/40' 
                : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}
          >
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500"></div>

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-tech font-bold text-base">Đồng Hồ Luyện Thi Đọc Hiểu</h3>
                  <p className="text-xs text-slate-400 font-mono">Chuẩn thời gian kiểm tra GDPT 2018</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preset Selector */}
            <div className="mb-6">
              <label className="text-xs font-mono text-slate-400 block mb-2 font-semibold">
                Chọn chế độ thời gian:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 15 as ExamDuration, label: '15 phút', desc: 'Kiểm tra 15p' },
                  { value: 45 as ExamDuration, label: '45 phút', desc: '1 tiết / Giữa kỳ' },
                  { value: 90 as ExamDuration, label: '90 phút', desc: 'Thi Cuối kỳ' },
                  { value: 0 as ExamDuration, label: 'Tự do', desc: 'Đếm xuôi' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleSelectDuration(item.value)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedDuration === item.value
                        ? 'bg-gradient-to-b from-cyan-500/20 to-indigo-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400/40'
                        : isDark
                        ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold">{item.label}</div>
                    <div className="text-[10px] opacity-70 truncate mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Large Digital Display */}
            <div 
              className={`rounded-2xl p-6 text-center border relative overflow-hidden mb-6 ${
                isFinished
                  ? 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                  : isLowTime
                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-300'
                  : isDark
                  ? 'bg-slate-950/80 border-slate-800 text-cyan-400'
                  : 'bg-slate-100 border-slate-300 text-cyan-700'
              }`}
            >
              <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                {selectedDuration === 0 ? 'Thời gian đã làm bài' : isFinished ? 'Trạng thái bài thi' : 'Thời gian còn lại'}
              </div>

              <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-wider my-2">
                {selectedDuration === 0 ? formatTime(elapsedSeconds) : formatTime(secondsRemaining)}
              </div>

              {/* Progress Bar (Countdown only) */}
              {selectedDuration > 0 && (
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-3">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isFinished
                        ? 'bg-rose-500'
                        : isLowTime
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              )}

              {/* Status Note */}
              <div className="mt-3 text-xs font-mono flex items-center justify-center gap-1.5">
                {isFinished ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    HẾT GIỜ LÀM BÀI! Vui lòng đối chiếu và nộp bài.
                  </span>
                ) : isLowTime ? (
                  <span className="text-amber-400 font-semibold flex items-center gap-1 animate-pulse">
                    <Flame className="w-4 h-4" />
                    Còn dưới 5 phút! Hãy rà soát lại dẫn chứng văn bản.
                  </span>
                ) : isRunning ? (
                  <span className="text-cyan-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    Đang tính giờ làm bài...
                  </span>
                ) : (
                  <span className="text-slate-400">Đang tạm dừng hoặc chưa bắt đầu</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-5">
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`flex-1 py-3 px-4 rounded-xl font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                    : isFinished
                    ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-rose-500/20'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-cyan-500/25 hover:opacity-95'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Tạm dừng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>{isFinished ? 'Làm lại bài' : 'Bắt đầu làm bài'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-sm flex items-center justify-center gap-1.5 transition-colors"
                title="Đặt lại đồng hồ ban đầu"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Sound alert switch & footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
              <button
                type="button"
                onClick={() => setSoundAlerts(!soundAlerts)}
                className="flex items-center gap-2 hover:text-slate-200 transition-colors"
              >
                {soundAlerts ? (
                  <Bell className="w-4 h-4 text-cyan-400" />
                ) : (
                  <BellOff className="w-4 h-4 text-slate-500" />
                )}
                <span>{soundAlerts ? 'Chuông báo khi hết giờ (Bật)' : 'Chuông báo (Tắt)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { Mail, KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from './authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessReturnLogin: () => void;
  themeMode: 'dark' | 'light';
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccessReturnLogin,
  themeMode,
}) => {
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.forgotPassword(email.trim());
      setInfoMessage(res.message);
      if (res.resetToken) {
        setToken(res.resetToken);
      }
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Không thể tạo yêu cầu đặt lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Vui lòng nhập mã bảo mật đã nhận.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword({
        email: email.trim(),
        token: token.trim(),
        newPassword,
      });
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl transition-all ${
          isDark
            ? 'bg-[#0f172a] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => {
              if (step === 'reset') setStep('request');
              else onClose();
            }}
            className={`p-2 rounded-xl border text-xs transition-colors flex items-center gap-1.5 ${
              isDark
                ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                : 'border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>

          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-500 font-semibold">
            Bảo mật tài khoản
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Request Reset */}
        {step === 'request' && (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <h2 id="forgot-password-title" className="text-xl font-bold tracking-tight font-tech">
                Khôi phục mật khẩu
              </h2>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Nhập email đã đăng ký. Hệ thống sẽ tạo mã đặt lại mật khẩu an toàn cho bạn.
              </p>
            </div>

            <div>
              <label htmlFor="reset-email" className="block text-xs font-medium font-mono mb-1.5">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hocsinh@thcs.edu.vn"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-hidden ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-700 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Tiếp tục xác nhận</span>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Enter token & new password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <h2 id="forgot-password-title" className="text-xl font-bold tracking-tight font-tech">
                Đặt lại mật khẩu mới
              </h2>
              {infoMessage && (
                <p className="text-xs mt-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl font-mono">
                  {infoMessage}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="reset-token" className="block text-xs font-medium font-mono mb-1.5">
                Mã xác thực bảo mật
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reset-token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Nhập mã xác thực"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono transition-all outline-hidden ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-700 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600'
                  }`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reset-new-password" className="block text-xs font-medium font-mono mb-1.5">
                Mật khẩu mới (tối thiểu 6 ký tự)
              </label>
              <input
                id="reset-new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-hidden ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600'
                }`}
              />
            </div>

            <div>
              <label htmlFor="reset-confirm-password" className="block text-xs font-medium font-mono mb-1.5">
                Xác nhận lại mật khẩu
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-hidden ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu mật khẩu...</span>
                </>
              ) : (
                <span>Cập nhật mật khẩu</span>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Success Done */}
        {step === 'done' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-tech">Đặt lại mật khẩu thành công!</h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Bạn có thể đăng nhập ngay bằng mật khẩu mới của mình.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSuccessReturnLogin();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 transition-all shadow-md"
            >
              Trở về Đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

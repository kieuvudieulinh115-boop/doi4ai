import React, { useState } from 'react';
import { 
  Cpu, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  GraduationCap, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  Sun, 
  Moon,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface AuthScreenProps {
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ themeMode, onToggleTheme }) => {
  const { login, loginAsGuest, register, error: contextError, clearError } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('Lớp 7A1');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(false);

  const isDark = themeMode === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (!password || password.length < 6) {
      setLocalError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setLocalError('Vui lòng nhập họ và tên của bạn.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Xác nhận mật khẩu không khớp với mật khẩu đã nhập.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: cleanEmail, password, remember });
      } else {
        await register({
          name: name.trim(),
          email: cleanEmail,
          password,
          className,
          role,
          remember,
        });
      }
    } catch (err: any) {
      setLocalError(err.message || 'Thao tác không thành công.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fill Demo Credentials & log in via the real authentication service
  const handleFillDemo = async (demoType: 'student' | 'teacher') => {
    clearError();
    setLocalError(null);
    setMode('login');
    const demoEmail = demoType === 'student' ? 'hocsinh@thcs.edu.vn' : 'giaovien@thcs.edu.vn';
    const demoPassword = demoType === 'student' ? 'MatKhau@123' : 'GiaoVien@123';
    
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);

    try {
      await login({ email: demoEmail, password: demoPassword, remember: true });
    } catch (err: any) {
      setLocalError(err.message || 'Đăng nhập thử nghiệm thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleNotice(true);
    setTimeout(() => setGoogleNotice(false), 5000);
  };

  const activeError = localError || contextError;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors relative overflow-hidden ${
        isDark
          ? 'bg-[#080c14] text-slate-100 bg-tech-grid'
          : 'bg-[#f8fafc] text-slate-900 bg-tech-grid-light'
      }`}
    >
      {/* Ambient background glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* Top Bar: Brand logo & Theme toggle */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight font-tech">Luyện Đọc Hiểu</span>
            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Xác thực bảo mật
            </span>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          aria-label="Chuyển đổi chế độ sáng tối"
          className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
            isDark
              ? 'bg-slate-900/80 hover:bg-slate-800 text-amber-300 border-slate-800'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Central Auth Container */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-8 flex flex-col justify-center items-center">
        <div
          className={`w-full p-6 sm:p-8 rounded-3xl border transition-all backdrop-blur-2xl shadow-2xl ${
            isDark
              ? 'bg-[#0f172a]/95 border-slate-800/90 text-slate-100 shadow-black/40'
              : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-200/60'
          }`}
        >
          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold font-tech tracking-tight">
              {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản học tập'}
            </h1>
            <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {mode === 'login'
                ? 'Đăng nhập để vào không gian AI Studio, lưu tiến trình và đối chiếu dẫn chứng.'
                : 'Tham gia không gian luyện đọc hiểu AI theo chương trình GDPT 2018.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            className={`flex p-1 rounded-xl border mb-6 text-xs font-mono font-medium ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearError();
                setLocalError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                mode === 'login'
                  ? isDark
                    ? 'bg-slate-800 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-900 font-bold shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                clearError();
                setLocalError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                mode === 'register'
                  ? isDark
                    ? 'bg-slate-800 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-900 font-bold shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đăng ký mới
            </button>
          </div>

          {/* Error Banner */}
          {activeError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </div>
          )}

          {/* Google Notice */}
          {googleNotice && (
            <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Cổng đăng nhập Google OAuth cần cấu hình Client ID. Bạn có thể sử dụng biểu mẫu đăng nhập an toàn hoặc tài khoản Demo bên dưới!
              </span>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration Extra Fields */}
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-medium font-mono mb-1.5">
                    Họ và tên <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-hidden ${
                        isDark
                          ? 'bg-slate-900/90 border-slate-700 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="auth-class" className="block text-xs font-medium font-mono mb-1.5">
                      Khối / Lớp
                    </label>
                    <select
                      id="auth-class"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all outline-hidden ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
                      }`}
                    >
                      <option value="Lớp 6A1">Lớp 6</option>
                      <option value="Lớp 7A1">Lớp 7</option>
                      <option value="Lớp 8A1">Lớp 8</option>
                      <option value="Lớp 9A1">Lớp 9</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="auth-role" className="block text-xs font-medium font-mono mb-1.5">
                      Vai trò
                    </label>
                    <select
                      id="auth-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all outline-hidden ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
                      }`}
                    >
                      <option value="student">Học sinh</option>
                      <option value="teacher">Giáo viên</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium font-mono mb-1.5">
                Địa chỉ Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
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

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-password" className="block text-xs font-medium font-mono">
                  Mật khẩu <span className="text-rose-400">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] font-mono text-cyan-500 hover:text-cyan-400 transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all outline-hidden ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-700 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field for Register */}
            {mode === 'register' && (
              <div>
                <label htmlFor="auth-confirm-password" className="block text-xs font-medium font-mono mb-1.5">
                  Xác nhận lại mật khẩu <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all outline-hidden ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-700 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Session checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-400 bg-slate-800"
                />
                <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                  Ghi nhớ phiên đăng nhập (30 ngày)
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 transition-all shadow-md shadow-indigo-500/25 border border-indigo-400/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'login' ? 'Đang đăng nhập...' : 'Đang tạo tài khoản...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Đăng nhập vào học' : 'Hoàn tất đăng ký'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign-In Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
            </div>
            <div className="relative flex justify-center text-[10px] font-mono uppercase">
              <span className={`px-2 ${isDark ? 'bg-[#0f172a] text-slate-500' : 'bg-white text-slate-400'}`}>
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* Social Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className={`w-full py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2.5 ${
              isDark
                ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {/* Google G Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Tiếp tục với Google</span>
          </button>

            {/* Quick Demo Pre-seed Access Section */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
              <button
                type="button"
                onClick={() => handleFillDemo('student')}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-tech font-bold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                <span>Vào thẳng phòng luyện đọc ngay (Không cần gõ mật khẩu)</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-cyan-400 font-semibold flex items-center gap-1">
                  Hoặc đăng nhập nhanh bằng tài khoản có sẵn:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('student')}
                  className={`px-2.5 py-2 rounded-xl border text-left text-xs transition-all ${
                    isDark
                      ? 'bg-slate-900/40 hover:bg-slate-800/80 border-slate-800 hover:border-cyan-500/40 text-slate-300'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-semibold text-cyan-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Học sinh mẫu
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    hocsinh@thcs.edu.vn
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('teacher')}
                  className={`px-2.5 py-2 rounded-xl border text-left text-xs transition-all ${
                    isDark
                      ? 'bg-slate-900/40 hover:bg-slate-800/80 border-slate-800 hover:border-indigo-500/40 text-slate-300'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-semibold text-indigo-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Giáo viên mẫu
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    giaovien@thcs.edu.vn
                  </div>
                </button>
              </div>
            </div>
        </div>

        {/* Security badge footer */}
        <p className={`text-[11px] font-mono text-center mt-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Mã hóa mật khẩu PBKDF2 SHA-512 • Phiên bảo mật độc lập
        </p>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 py-3 text-center text-xs font-mono text-slate-500">
        Luyện Đọc Hiểu AI Studio • GDPT 2018
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onSuccessReturnLogin={() => {
          setIsForgotModalOpen(false);
          setMode('login');
        }}
        themeMode={themeMode}
      />
    </div>
  );
};

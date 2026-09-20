import { AuthUser, AuthResponse, LoginCredentials, RegisterData } from '../types';

const TOKEN_KEY = 'thcs_auth_session_token';
const REMEMBER_KEY = 'thcs_auth_remember_me';

class AuthService {
  private inMemoryToken: string | null = null;

  public getToken(): string | null {
    if (this.inMemoryToken) return this.inMemoryToken;
    try {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public setToken(token: string, remember = true): void {
    this.inMemoryToken = token;
    try {
      if (remember) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(REMEMBER_KEY, 'true');
        sessionStorage.removeItem(TOKEN_KEY);
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch (e) {
      console.warn('Storage not available for token persistence', e);
    }
  }

  public clearToken(): void {
    this.inMemoryToken = null;
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Storage clear error', e);
    }
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Đăng nhập không thành công.');
    }

    this.setToken(data.token, credentials.remember ?? true);
    return data;
  }

  public async register(data: RegisterData): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || 'Đăng ký không thành công.');
    }

    this.setToken(resData.token, data.remember ?? true);
    return resData;
  }

  public async getCurrentUser(): Promise<AuthUser | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        this.clearToken();
        return null;
      }

      const data = await res.json();
      return data.user || null;
    } catch (err) {
      console.error('Session validation error:', err);
      return null;
    }
  }

  public async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('Logout endpoint call failed, clearing local session', err);
      }
    }
    this.clearToken();
  }

  public async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string; instructions?: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Không thể yêu cầu đặt lại mật khẩu.');
    }
    return data;
  }

  public async resetPassword(params: { email: string; token: string; newPassword: string }): Promise<void> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Đặt lại mật khẩu không thành công.');
    }
  }

  public async updateProfile(updates: { name?: string; className?: string }): Promise<AuthUser> {
    const token = this.getToken();
    if (!token) throw new Error('Chưa đăng nhập.');

    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Không thể cập nhật hồ sơ.');
    }
    return data.user;
  }
}

export const authService = new AuthService();

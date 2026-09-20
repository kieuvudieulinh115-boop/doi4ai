import crypto from 'crypto';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  className: string;
  role: 'student' | 'teacher';
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface ActiveSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface ResetRequest {
  token: string;
  email: string;
  expiresAt: number;
}

// In-memory store for users, active sessions, and password resets
const users = new Map<string, StoredUser>(); // email.toLowerCase() -> StoredUser
const sessions = new Map<string, ActiveSession>(); // token -> ActiveSession
const resetTokens = new Map<string, ResetRequest>(); // email.toLowerCase() -> ResetRequest

// Cryptographic hash using standard PBKDF2 SHA-512
export function hashPassword(password: string, customSalt?: string): { hash: string; salt: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hash));
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Seed initial demo accounts for instant preview & test drive
function seedInitialUsers() {
  const studentPw = hashPassword('MatKhau@123');
  users.set('hocsinh@thcs.edu.vn', {
    id: 'usr-student-01',
    email: 'hocsinh@thcs.edu.vn',
    name: 'Nguyễn Văn An',
    className: 'Lớp 7A1',
    role: 'student',
    passwordHash: studentPw.hash,
    salt: studentPw.salt,
    createdAt: new Date().toISOString(),
  });

  const teacherPw = hashPassword('GiaoVien@123');
  users.set('giaovien@thcs.edu.vn', {
    id: 'usr-teacher-01',
    email: 'giaovien@thcs.edu.vn',
    name: 'Cô Trần Thị Mai',
    className: 'Tổ Ngữ Văn THCS',
    role: 'teacher',
    passwordHash: teacherPw.hash,
    salt: teacherPw.salt,
    createdAt: new Date().toISOString(),
  });
}

seedInitialUsers();

// Public user object without sensitive hash & salt
export function sanitizeUser(user: StoredUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    className: user.className,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return users.get(email.trim().toLowerCase());
}

export function findUserById(id: string): StoredUser | undefined {
  for (const user of users.values()) {
    if (user.id === id) return user;
  }
  return undefined;
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  className = 'Lớp 7A1',
  role: 'student' | 'teacher' = 'student',
  remember = true
): { user: ReturnType<typeof sanitizeUser>; token: string } {
  const normalizedEmail = email.trim().toLowerCase();
  if (users.has(normalizedEmail)) {
    throw new Error('Email này đã được đăng ký tài khoản.');
  }

  const { hash, salt } = hashPassword(password);
  const newUser: StoredUser = {
    id: `usr-${crypto.randomUUID()}`,
    email: normalizedEmail,
    name: name.trim(),
    className: className.trim() || 'Lớp 7A1',
    role,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
  };

  users.set(normalizedEmail, newUser);

  // Generate session token
  const token = generateToken();
  const ttlMs = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days vs 1 day
  sessions.set(token, {
    token,
    userId: newUser.id,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  });

  return {
    user: sanitizeUser(newUser),
    token,
  };
}

export function loginUser(
  email: string,
  password: string,
  remember = true
): { user: ReturnType<typeof sanitizeUser>; token: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.get(normalizedEmail);

  if (!user) {
    throw new Error('Email hoặc mật khẩu không chính xác.');
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    throw new Error('Email hoặc mật khẩu không chính xác.');
  }

  const token = generateToken();
  const ttlMs = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  sessions.set(token, {
    token,
    userId: user.id,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
}

export function getUserFromToken(token: string): ReturnType<typeof sanitizeUser> | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  const user = findUserById(session.userId);
  if (!user) {
    sessions.delete(token);
    return null;
  }

  return sanitizeUser(user);
}

export function removeSession(token: string): boolean {
  return sessions.delete(token);
}

export function updateUserProfile(
  userId: string,
  updates: { name?: string; className?: string }
): ReturnType<typeof sanitizeUser> | null {
  const user = findUserById(userId);
  if (!user) return null;

  if (updates.name && updates.name.trim()) {
    user.name = updates.name.trim();
  }
  if (updates.className && updates.className.trim()) {
    user.className = updates.className.trim();
  }

  return sanitizeUser(user);
}

export function createPasswordResetRequest(email: string): { resetToken: string; expiresAt: number } {
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.get(normalizedEmail);
  if (!user) {
    throw new Error('Không tìm thấy tài khoản với địa chỉ email này.');
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins
  resetTokens.set(normalizedEmail, {
    token: resetToken,
    email: normalizedEmail,
    expiresAt,
  });

  return { resetToken, expiresAt };
}

export function completePasswordReset(email: string, token: string, newPassword: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const req = resetTokens.get(normalizedEmail);

  if (!req || req.token !== token || Date.now() > req.expiresAt) {
    throw new Error('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn (15 phút).');
  }

  const user = users.get(normalizedEmail);
  if (!user) {
    throw new Error('Tài khoản không tồn tại.');
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;

  resetTokens.delete(normalizedEmail);

  // Invalidate all active sessions for this user for security
  for (const [sToken, session] of sessions.entries()) {
    if (session.userId === user.id) {
      sessions.delete(sToken);
    }
  }

  return true;
}

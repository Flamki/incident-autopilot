export interface LocalAuthUser {
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
}

const USERS_KEY = "autopilot_local_users";
const CURRENT_USER_KEY = "autopilot_current_user";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readUsers(): LocalAuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalAuthUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: LocalAuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerLocalUser(input: { fullName: string; email: string; password: string }): { ok: boolean; message?: string } {
  const email = normalizeEmail(input.email);
  const users = readUsers();
  const exists = users.some((user) => normalizeEmail(user.email) === email);
  if (exists) {
    return { ok: false, message: "Account already exists. Please log in." };
  }

  users.push({
    fullName: input.fullName.trim(),
    email,
    password: input.password,
    createdAt: new Date().toISOString(),
  });
  writeUsers(users);
  return { ok: true };
}

export function authenticateLocalUser(input: { email: string; password: string }): LocalAuthUser | null {
  const email = normalizeEmail(input.email);
  const users = readUsers();
  return users.find((user) => normalizeEmail(user.email) === email && user.password === input.password) || null;
}

export function ensureGoogleLocalUser() {
  const email = "google.user@incident-autopilot.app";
  const users = readUsers();
  const existing = users.find((user) => normalizeEmail(user.email) === email);
  if (existing) return existing;

  const created: LocalAuthUser = {
    fullName: "Google Connected User",
    email,
    password: "google-oauth",
    createdAt: new Date().toISOString(),
  };
  users.push(created);
  writeUsers(users);
  return created;
}

export function setCurrentLocalUser(user: Pick<LocalAuthUser, "fullName" | "email"> | null) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentLocalUser(): { fullName: string; email: string } | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { fullName: string; email: string };
  } catch {
    return null;
  }
}

export function clearLocalAuthState() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

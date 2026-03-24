export interface SessionUser {
  fullName: string;
  email: string;
}

const CURRENT_USER_KEY = "autopilot_current_user";

export function setCurrentLocalUser(user: SessionUser | null) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentLocalUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function clearLocalAuthState() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

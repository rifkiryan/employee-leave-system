import { getItem, setItem, removeItem } from "@/lib/storage";
import { ADMIN_USERNAME, ADMIN_PASSWORD, STORAGE_KEY_AUTH } from "@/constants";
import type { AuthSession, LoginCredentials } from "@/types/auth";

export const AuthStorageService = {
  login(credentials: LoginCredentials): boolean {
    if (
      credentials.username === ADMIN_USERNAME &&
      credentials.password === ADMIN_PASSWORD
    ) {
      this.setSession({ id: "0", username: credentials.username, role: "ADMIN", name: "System Administrator" });
      return true;
    }
    return false;
  },

  setSession(user: { id: string; username: string; role: string; name: string; department?: string }): void {
    const session: AuthSession = {
      isLoggedIn: true,
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      department: user.department,
      loginAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEY_AUTH, session);
  },


  logout(): void {
    removeItem(STORAGE_KEY_AUTH);
  },

  getSession(): AuthSession | null {
    return getItem<AuthSession>(STORAGE_KEY_AUTH);
  },

  isAuthenticated(): boolean {
    const session = this.getSession();
    return session !== null && session.isLoggedIn;
  },
};

export type AuthSession = {
  isLoggedIn: boolean;
  id: string;
  username: string;
  role: string;
  name: string;
  department?: string;
  loginAt: string;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

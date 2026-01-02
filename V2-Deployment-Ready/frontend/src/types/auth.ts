export interface User {
  id: number;
  username: string;
  role: string; // 'admin' | 'trainer'
}

export interface AuthContextType {
  authToken: string | null;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

import type {User} from "@/types/User";

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  storeIds: number[];
  storeId: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

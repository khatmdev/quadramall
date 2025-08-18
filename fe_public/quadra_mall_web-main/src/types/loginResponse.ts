import type {Role} from "@/types/Auth/base/User";

export interface LoginResponse {
    token: string;
    refreshToken: string;
    userId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    roles:Role[]
}
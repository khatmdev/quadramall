import type {Role} from "@/types/Auth/base/User";

export interface LoginResponse {
    token: string;
    refreshToken: string;
    userId: string;
    provider: string;
    email: string;
    fullName: string;
    phoneNumber?: string; 
    avatarUrl?: string;
    roles:Role[]
}
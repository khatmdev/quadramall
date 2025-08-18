import { Role } from "../User";


export interface LoginResponse {
    token: string;
    refreshToken: string;
    userId: number;
    provider: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    avatarUrl?: string;
    roles:Role[];
    storeIds: number[];
}
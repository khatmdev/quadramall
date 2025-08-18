export interface Role {
    id: number;
    name: string;
    description?: string;
}

export interface User {
    userId: number;
    email: string;
    provider : string;
    fullName: string;
    phoneNumber?: string;
    avatarUrl: string;
    roles: Role[];
}
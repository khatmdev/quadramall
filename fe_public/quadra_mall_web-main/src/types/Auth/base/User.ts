export interface Role {
    id: string; 
    name: string;
    description?: string;
}

export interface User {
    userId: string;
    email: string;
    provider : string;
    fullName: string;
    phoneNumber?: string;
    avatarUrl: string;
    roles: Role[];
}
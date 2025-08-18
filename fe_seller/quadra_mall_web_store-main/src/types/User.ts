export interface RoleDTO {
    id: number;
    name: string;
    description: string;
    createdAt: string;
}

export interface User {
    email: string;
    provider: string;
    fullName: string;
    phoneNumber: string | null;
    avatarUrl: string;
    roles: Role[];
}

export interface Role {
    id: number;
    name: string;
    description?: string;
}
export interface JwtPayload {
    sub: string;    // userId
    email: string;
    nickname: string;
    role: UserRole;
    exp: number;
}
export interface User {
    id: number;
    email: string;
    nickname: string;
    role: UserRole;
}

export enum UserRole {
    USER = "ROLE_USER",
    ADMIN = "ROLE_ADMIN"
}
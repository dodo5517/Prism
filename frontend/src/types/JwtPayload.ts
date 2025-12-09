export interface JwtPayload {
    sub: string;    // userId
    email: string;
    nickname: string;
    role: string;
    exp: number;
}
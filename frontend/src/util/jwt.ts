import {jwtDecode} from "jwt-decode";
import {JwtPayload, User, UserRole} from "@/types/JwtPayload";

export const handleDecode = (accessToken: string) => {
    // 토큰 해독
    const decoded = jwtDecode<JwtPayload>(accessToken);

    // 유저 객체 생성
    const user: User = {
        id: Number(decoded.sub) || 0,
        email: decoded.email || "",
        nickname: decoded.nickname || "",
        role: decoded.role || UserRole.USER
    };

    return user;
};
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 인터페이스 정의
interface User {
    id: number;
    email: string;
    nickname: string;
    role: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

// 스토어 생성
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,

            login: (user, token) => set({
                user,
                accessToken: token,
                isAuthenticated: true
            }),

            logout: () => set({
                user: null,
                accessToken: null,
                isAuthenticated: false
            }),
        }),
        {
            name: 'auth-storage', // 로컬 스토리지 키 이름
        }
    )
);
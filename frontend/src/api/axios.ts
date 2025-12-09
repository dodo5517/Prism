import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Zustand store에서 토큰 가져오기 (getState() 사용)
        const accessToken = useAuthStore.getState().accessToken;

        if (accessToken) {
            config.headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.error("인증 실패: 토큰 만료 또는 로그인 필요");
            // 토큰 재발급 로직 넣어야 함.
        }
        return Promise.reject(error);
    }
);

export default api;
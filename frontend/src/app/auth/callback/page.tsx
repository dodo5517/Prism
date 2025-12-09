'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useAuthStore } from '@/store/authStore';
import {jwtDecode} from "jwt-decode";
import {JwtPayload} from "@/types/JwtPayload";

// useSearchParams를 쓰려면 Suspense로 감싸야 함.
function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        // URL에서 accessToken 추출
        const accessToken = searchParams.get('accessToken');
        if (accessToken) {
            try {
                // 토큰 해독
                const decoded = jwtDecode<JwtPayload>(accessToken);

                // 유저 객체 생성
                const user = {
                    id: Number(decoded.sub) || 0,
                    email: decoded.email || "",
                    nickname: decoded.nickname || "",
                    role: decoded.role || "USER"
                };

                // 로그인 처리
                login(user, accessToken);
                console.log("로그인 성공! 환영합니다.");

                router.push('/');
            }catch (error) {
                console.error("토큰 해독 실패:", error);
                router.push('/');
            }
        }
    }, [searchParams, router, login]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white">
            <div className="text-2xl font-bold animate-bounce text-indigo-600 mb-4">
                Prism
            </div>
            <p className="text-gray-500">로그인 처리 중입니다...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}
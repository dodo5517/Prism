'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useAuthStore } from '@/store/authStore';

// useSearchParams를 쓰려면 Suspense로 감싸야 함.
function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        // URL에서 accessToken 추출
        const accessToken = searchParams.get('accessToken');

        if (accessToken) {
            const tempUser = { // 임시로
                id: 0,
                email: "",
                nickname: "User",
                role: "USER"
            };

            // 토큰 저장
            login(tempUser, accessToken);
            console.log("로그인 성공! Zustand Store 업데이트 완료.");

            // 메인 페이지로 이동
            router.push('/');
        } else {
            console.error("토큰이 없습니다. 로그인 실패.");
            router.push('/');
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
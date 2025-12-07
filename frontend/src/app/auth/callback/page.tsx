'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

// useSearchParams를 쓰려면 Suspense로 감싸야 함.
function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // URL에서 accessToken 추출
        const accessToken = searchParams.get('accessToken');

        if (accessToken) {
            // 로컬 스토리지에 저장
            localStorage.setItem('accessToken', accessToken);

            console.log("로그인 성공! 토큰 저장 완료.");

            // 메인 페이지로 이동
            window.location.href = '/';
        } else {
            console.error("토큰이 없습니다. 로그인 실패.");
            router.push('/');
        }
    }, [searchParams, router]);

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
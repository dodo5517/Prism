'use client';

import React from 'react';
import api from "@/api/axios";
import { useAuthStore } from '@/store/authStore';

const Login = () => {
    const login = useAuthStore((state) => state.login);

    // 게스트 로그인 핸들러
    const handleGuestLogin = async () => {
        try {
            const response = await api.get('/auth/guest');
            const data = response.data;

            if (data.accessToken) {
                const guestUser = {
                    id: data.id || 0,
                    email: 'guest@prism.com',
                    nickname: data.nickname || '게스트',
                    role: 'USER'
                };

                login(guestUser, data.accessToken);
                alert(`환영합니다, ${guestUser.nickname}님! (게스트 모드)`);
            }
        } catch (error) {
            console.error("게스트 로그인 실패", error);
            alert("게스트 로그인에 실패했습니다.");
        }
    };

    return (
        <div className="mx-auto flex flex-col gap-3 sm:gap-4 w-full max-w-[280px] sm:max-w-xs mt-6 sm:mt-8 md:mt-10 px-4 sm:px-0">
            {/* 로그인 안내 텍스트 */}
            <div className="text-center mb-2 sm:mb-4">
                <p className="text-stone-500 text-xs sm:text-sm">
                    로그인하고 나만의 캘린더를 만들어보세요
                </p>
            </div>

            {/* 구글 로그인 */}
            <a
                href="http://localhost:8080/oauth2/authorization/google"
                className="flex items-center justify-center gap-2 sm:gap-3 w-full py-2.5 sm:py-3 bg-white border border-stone-200 rounded-xl shadow-sm hover:bg-stone-50 hover:border-stone-300 transition-all text-stone-700 font-medium text-sm sm:text-base"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-xs sm:text-sm">Google로 계속하기</span>
            </a>

            {/* 게스트 로그인 */}
            <button
                onClick={handleGuestLogin}
                className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl shadow-lg hover:from-amber-700 hover:to-amber-800 transition-all font-medium text-sm sm:text-base"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs sm:text-sm">게스트로 체험하기</span>
            </button>

            {/* 하단 안내 */}
            <p className="text-center text-stone-400 text-[10px] sm:text-xs mt-2 sm:mt-4">
                게스트 모드는 임시 데이터로 체험할 수 있어요
            </p>
        </div>
    );
};

export default Login;
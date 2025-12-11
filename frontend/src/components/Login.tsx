'use client';

import React from 'react';
import api from "@/api/axios";
import { useAuthStore } from '@/store/authStore';
import {User} from "@/types/JwtPayload";
import {handleDecode} from "@/util/jwt";

const Login = () => {
    const login = useAuthStore((state) => state.login);

    // 게스트 로그인 핸들러
    const handleGuestLogin = async () => {
        try {
            const response = await api.get('/auth/guest');
            const data = response.data;

            if (data.accessToken) {
                const guestUser: User = handleDecode(data.accessToken);
                login(guestUser, data.accessToken);
                alert(`환영합니다, ${guestUser.nickname}님! (게스트 모드)`);
            }
        } catch (error) {
            console.error("게스트 로그인 실패", error);
            alert("게스트 로그인에 실패했습니다.");
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* 로고 */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl sm:text-3xl tracking-[0.25em] text-neutral-800 font-medium mb-3">
                        PRISM
                    </h1>
                    <p className="text-neutral-500 text-sm">
                        일상을 그림으로 기록하세요
                    </p>

                    <div className="flex justify-center mt-4 gap-0.5">
                        <div className="w-6 h-1 rounded-full bg-red-400/70" />
                        <div className="w-6 h-1 rounded-full bg-orange-400/70" />
                        <div className="w-6 h-1 rounded-full bg-yellow-400/70" />
                        <div className="w-6 h-1 rounded-full bg-green-400/70" />
                        <div className="w-6 h-1 rounded-full bg-blue-400/70" />
                        <div className="w-6 h-1 rounded-full bg-indigo-400/70" />
                        <div className="w-6 h-1 rounded-full bg-violet-400/70" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/60 p-6 sm:p-8">
                    <p className="text-center text-neutral-500 text-sm mb-6">
                        로그인하고 나만의 캘린더를 만들어보세요
                    </p>

                    <div className="flex flex-col gap-3">
                        {/* 구글 로그인 */}
                        <a
                            href="http://localhost:8080/oauth2/authorization/google"
                            className="flex items-center justify-center gap-3 w-full py-3 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all text-neutral-700 text-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Google로 계속하기</span>
                        </a>

                        {/* 구분선 */}
                        <div className="flex items-center gap-3 my-1">
                            <div className="flex-1 h-px bg-neutral-200" />
                            <span className="text-xs text-neutral-400">또는</span>
                            <div className="flex-1 h-px bg-neutral-200" />
                        </div>

                        {/* 게스트 로그인 */}
                        <button
                            onClick={handleGuestLogin}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>게스트로 체험하기</span>
                        </button>
                    </div>

                    <p className="text-center text-neutral-400 text-xs mt-6">
                        게스트 모드는 임시 데이터로 체험할 수 있어요
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
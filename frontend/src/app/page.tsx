'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // 화면 켜질 때 토큰 있는지 확인
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
        alert("로그아웃 되었습니다.");
    };

    // 게스트 로그인 핸들러
    const handleGuestLogin = async () => {
        try {
            // 백엔드 게스트 로그인 API 호출
            const res = await fetch('http://localhost:8080/api/auth/guest');
            const data = await res.json();

            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                alert(`환영합니다, ${data.nickname}님! (게스트 모드)`);
                window.location.reload(); // 새로고침해서 로그인 상태 반영
            }
        } catch (error) {
            console.error("게스트 로그인 실패", error);
            alert("게스트 로그인 실패");
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-white gap-8">
            {/* 로고 영역 */}
            <div className="text-center space-y-2">
                <h1 className="text-5xl font-bold text-indigo-600 tracking-tighter">Prism</h1>
            </div>

            {isLoggedIn ? (
                /* 로그인 했을 때 보여줄 화면 */
                <div className="flex flex-col gap-4 items-center w-full max-w-xs animate-fade-in">
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-2">
                        로그인 되었습니다
                    </div>

                    <Link href="/logs/write" className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium text-center shadow-lg shadow-indigo-200">
                        오늘의 일기 쓰기
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-gray-600 text-sm underline mt-2"
                    >
                        로그아웃
                    </button>
                </div>
            ) : (
                /* 로그인 안 했을 때 버튼 */
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    {/* 구글 로그인 버튼 */}
                    <a
                        href="http://localhost:8080/oauth2/authorization/google"
                        className="flex items-center justify-center gap-3 w-full py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition text-gray-700 font-medium"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google로 계속하기
                    </a>

                    {/* 게스트 로그인 버튼 */}
                    <button
                        onClick={handleGuestLogin}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-black transition font-medium"
                    >
                        게스트로 체험하기
                    </button>
                </div>
            )}
        </main>
    );
}
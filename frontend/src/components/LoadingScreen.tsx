import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neutral-900/95">
            <div className="flex flex-col items-center">
                {/* 로딩 스피너 */}
                <div className="w-10 h-10 mb-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />

                {/* 텍스트 */}
                <p className="text-white text-lg mb-2">분석 중</p>
                <p className="text-neutral-500 text-sm">잠시만 기다려주세요</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
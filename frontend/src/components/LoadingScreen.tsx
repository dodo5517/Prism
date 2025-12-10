import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        // 전체 화면 덮기 (z-index 최상위)
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 text-white">

            {/* 빙글빙글 도는 스피너 */}
            <div className="w-16 h-16 mb-4 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>

            <h3 className="text-xl font-bold mb-2">AI가 내용을 분석하고 있어요...</h3>
            <p className="text-gray-300 text-sm">잠시만 기다려주세요</p>
        </div>
    );
};

export default LoadingScreen;
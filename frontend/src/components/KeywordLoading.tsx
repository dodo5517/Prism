import React, {useState, useEffect, useMemo} from 'react';

interface KeywordLoadingProps {
    keywords: string[];
}

// 고정 멘트
const FILLERS = [
    "캐릭터 모양 잡는 중",
    "조명 설정 중",
    "마무리 작업 중",
    "잠시만요!"
];

const KeywordLoading: React.FC<KeywordLoadingProps> = ({ keywords }) => {
    const [visibleKeyword, setVisibleKeyword] = useState(keywords[0] || "Analyzing...");
    const [index, setIndex] = useState(0);

    const isUserKeyword = index < keywords.length;

    const displayList = useMemo(() => {
        const combined = [...keywords];
        for (let i = 0; i < FILLERS.length; i++) {
            // 필러가 키워드보다 뒤에 나오도록 배열에 추가
            combined.push(FILLERS[i]);
        }
        return combined;
    }, [keywords]);

    useEffect(() => {
        if (displayList.length === 0) return;

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % displayList.length);
        }, 2000); // 3초마다 키워드 변경

        return () => clearInterval(interval);
    }, [displayList]);

    useEffect(() => {
        setVisibleKeyword(displayList[index]);
    }, [index, displayList]);

    return (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md">
            {/* 배경 */}
            <div className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />

            <div className="relative z-10 flex flex-col items-center gap-6">
                <p className="text-stone-300 text-xs sm:text-sm tracking-[0.3em] uppercase animate-bounce">
                    그림 그리는 중...
                </p>

                {/* 키워드 텍스트 */}
                <div className="h-20 flex items-center justify-center">
                     <span
                         key={visibleKeyword} // 키가 바뀌면 애니메이션 재실행됨
                         className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white/90 animate-fade-in-up"
                     >
                         {/* 인덱스를 기준으로 #을 붙일지 말지 결정 */}
                         {isUserKeyword ? `#${visibleKeyword}` : visibleKeyword}
                    </span>
                </div>

                {/* 로딩 바 */}
                <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full animate-progress-infinite" />
                </div>
            </div>
        </div>
    );
};

export default KeywordLoading;
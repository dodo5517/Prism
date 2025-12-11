import React, {useState, useEffect, useMemo} from 'react';

interface KeywordLoadingProps {
    keywords: string[];
}

// 고정 멘트
const FILLERS = [
    "색을 입히는 중",
    "조명 설정 중",
    "마무리 중",
    "거의 다 됐어요",
    "잠시만요!"
];

const KeywordLoading: React.FC<KeywordLoadingProps> = ({ keywords }) => {
    const [visibleKeyword, setVisibleKeyword] = useState(keywords[0] || "...");
    const [index, setIndex] = useState(0);

    const isUserKeyword = index < keywords.length;

    const displayList = useMemo(() => {
        const combined = [...keywords];
        for (let i = 0; i < FILLERS.length; i++) {
            // 고정멘트가 키워드보다 뒤에 나오도록
            combined.push(FILLERS[i]);
        }
        return combined;
    }, [keywords]);

    useEffect(() => {
        if (displayList.length === 0) return;

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % displayList.length);
        }, 2000); // 2초마다 키워드 변경

        return () => clearInterval(interval);
    }, [displayList]);

    useEffect(() => {
        setVisibleKeyword(displayList[index]);
    }, [index, displayList]);

    // 무지개 색상
    const spectrumColors = [
        'bg-red-400',
        'bg-orange-400',
        'bg-yellow-400',
        'bg-green-400',
        'bg-blue-400',
        'bg-indigo-400',
        'bg-violet-400',
    ];

    return (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-neutral-900/90 backdrop-blur-md">
            <div className="flex flex-col items-center gap-8">
                {/* 상태 텍스트 */}
                <p className="text-neutral-400 text-xs tracking-widest uppercase">
                    그림으로 변환 중
                </p>

                {/* 키워드 */}
                <div className="h-16 flex items-center justify-center">
                    <span
                        key={visibleKeyword}
                        className="text-2xl sm:text-3xl text-white/90 animate-fade-in"
                    >
                        {isUserKeyword ? `#${visibleKeyword}` : visibleKeyword}
                    </span>
                </div>

                {/* 로딩 바 */}
                <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden flex">
                    {spectrumColors.map((color, i) => (
                        <div
                            key={i}
                            className={`flex-1 ${color} animate-pulse`}
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KeywordLoading;
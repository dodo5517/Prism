import React from 'react';
import { CalendarDetailResponseDto } from '@/types/diary';

interface ResultModalProps {
    data: CalendarDetailResponseDto | null;
    onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ data, onClose }) => {
    if (!data) return null;

    // 점수에 따른 테두리 색상
    const getBorderColorClass = (score: number = 0) => {
        if (score >= 70) return 'border-pink-300';   // 70점 이상: 분홍
        if (score >= 40) return 'border-yellow-200'; // 40~49점: 연노랑
        return 'border-gray-300';                   // 그 외: 회색
    };

    return (
        // 배경
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            {/* 모달 박스 */}
            <div
                className="relative w-full max-w-md p-6 mx-4 bg-white rounded-xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()} // 박스 클릭 시 닫힘 방지
            >

                {/* 이미지 */}
                <div className={`w-full aspect-square mb-4 rounded-lg overflow-hidden border-4 ${getBorderColorClass(data.moodScore)} bg-gray-100 flex items-center justify-center`}>
                    {data.imageUrl ? (
                        <img
                            src={data.imageUrl}
                            alt="AI Created"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-gray-400 text-sm">이미지가 없습니다</span>
                    )}
                </div>

                {/* 키워드 태그 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {data.keywords?.map((k, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md"
                        >
                            #{k}
                        </span>
                    ))}
                </div>

                {/* 날짜 및 본문 */}
                <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">{data.date}</p>
                    <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                        {data.content}
                    </p>
                </div>

                {/* 닫기 */}
                <button
                    onClick={onClose}
                    className="w-full py-3 text-white font-bold bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors active:scale-95"
                >
                    닫기
                </button>
            </div>
        </div>
    );
};

export default ResultModal;
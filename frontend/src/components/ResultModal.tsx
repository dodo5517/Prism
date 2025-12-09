import React from 'react';
import { CalendarDetailResponseDto } from '@/types/diary';

interface ResultModalProps {
    data: CalendarDetailResponseDto | null;
    onClose: () => void;
    onDelete?: (date: string) => void;
    onRecreate?: (date: string) => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ data, onClose, onDelete, onRecreate }) => {
    if (!data) return null;

    // 점수에 따른 테두리 색상
    const getBorderColorClass = (score: number = 0) => {
        if (score >= 70) return 'border-pink-300';
        if (score >= 40) return 'border-amber-200';
        return 'border-stone-300';
    };

    // 점수에 따른 배경 그라데이션
    const getBackgroundGradient = (score: number = 0) => {
        if (score >= 70) return 'from-pink-50 to-amber-50';
        if (score >= 40) return 'from-amber-50 to-stone-50';
        return 'from-stone-50 to-stone-100';
    };

    // 삭제 핸들러
    const handleDelete = () => {
        if (confirm('정말 삭제하시겠습니까?')) {
            onDelete?.(data.date);
        }
    };

    // 다시 만들기 핸들러
    const handleRecreate = () => {
        if (confirm('이미지를 다시 생성하시겠습니까?')) {
            onRecreate?.(data.date);
        }
    };

    return (
        // 배경
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            {/* 모달 박스 */}
            <div
                className={`relative w-full max-w-[320px] sm:max-w-sm md:max-w-md p-4 sm:p-5 md:p-6 bg-gradient-to-br ${getBackgroundGradient(data.moodScore)} rounded-2xl shadow-2xl overflow-hidden border border-stone-200/50`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 이미지 */}
                <div className={`w-full aspect-square mb-3 sm:mb-4 rounded-xl overflow-hidden border-4 ${getBorderColorClass(data.moodScore)} bg-stone-100 flex items-center justify-center shadow-inner`}>
                    {data.imageUrl ? (
                        <img
                            src={data.imageUrl}
                            alt="AI Created"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-stone-400">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs sm:text-sm">이미지가 없습니다</span>
                        </div>
                    )}
                </div>

                {/* 날짜 */}
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">{data.date}</p>
                </div>

                {/* 키워드 태그 */}
                {data.keywords && data.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {data.keywords.map((k, index) => (
                            <span
                                key={index}
                                className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium text-amber-700 bg-amber-100/80 rounded-full border border-amber-200/50"
                            >
                                #{k}
                            </span>
                        ))}
                    </div>
                )}

                {/* 본문 */}
                <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-white/60 rounded-xl border border-stone-200/50">
                    <p className="text-stone-700 text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {data.content}
                    </p>
                </div>

                {/* 버튼 그룹 */}
                <div className="flex flex-col gap-2 sm:gap-3">
                    {/* 다시 만들기 & 삭제 버튼 */}
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={handleRecreate}
                            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 text-amber-700 font-medium bg-white/80 border border-amber-200 rounded-xl hover:bg-amber-50 transition-all active:scale-[0.98] text-xs sm:text-sm"
                        >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            다시 만들기
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 text-red-600 font-medium bg-white/80 border border-red-200 rounded-xl hover:bg-red-50 transition-all active:scale-[0.98] text-xs sm:text-sm"
                        >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            삭제
                        </button>
                    </div>

                    {/* 닫기 버튼 */}
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 sm:py-3 text-white font-bold bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all active:scale-[0.98] shadow-lg text-sm sm:text-base"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultModal;
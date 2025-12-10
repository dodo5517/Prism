'use client';

import React, { useState, useEffect } from 'react';
import {analyzeDiary, generateImageOnly, getDiaryDetail} from '@/api/diaryApi';
import {AnalyzeResponse, CalendarDetailResponseDto, CalendarResponseDto} from '@/types/diary';
import LoadingScreen from '@/components/LoadingScreen';
import ResultModal from '@/components/ResultModal';
import {format} from "date-fns";
import KeywordLoading from "@/components/KeywordLoading";

interface WriteModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate?: string;
    onAddDiary: (diary: CalendarResponseDto) => void;
    onUpdateDiary: (updated: CalendarDetailResponseDto) => void;
    onDeleteDiary: (id: number) => void;
}

const WriteModal: React.FC<WriteModalProps> = ({ isOpen, onClose, selectedDate, onAddDiary, onUpdateDiary, onDeleteDiary }) => {
    // 오늘 날짜 구하기 (YYYY-MM-DD)
    const getToday = () => format(new Date(), "yyyy-MM-dd");

    // 상태
    // selectedDate가 있으면 그것을, 없으면 오늘 날짜를 기본값으로 설정
    const [date, setDate] = useState<string>(selectedDate || getToday());
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modalData, setModalData] = useState<CalendarDetailResponseDto | null>(null);

    // 로딩 상태 분리
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false); // 텍스트 분석 중
    const [isGenerating, setIsGenerating] = useState<boolean>(false); // 이미지 생성 중
    const [keywords, setKeywords] = useState<string[]>([]); // 애니메이션용 키워드

    // 모달이 열릴 때마다 날짜 및 내용 초기화
    useEffect(() => {
        if (isOpen && selectedDate) {
            setDate(selectedDate);
            setContent('');
        }
    }, [isOpen, selectedDate]);

    const handleSubmit = async () => {
        if (!content.trim()) {
            alert("일기 내용을 입력해주세요!");
            return;
        }

        setIsLoading(true);

        try {
            // 분석 시작 (기존 LoadingScreen 표시)
            setIsAnalyzing(true);
            const analysisResult:AnalyzeResponse = await analyzeDiary(date, content);
            setIsAnalyzing(false);

            // 분석 완료 -> 키워드 애니메이션 시작
            setKeywords(analysisResult.keywords);
            setIsGenerating(true);

            // 이미지 생성 요청
            await generateImageOnly(analysisResult.logId);
            // 최종 완료 -> 상세 데이터 가져오기
            const detailData = await getDiaryDetail(analysisResult.logId);

            // 달력 업데이트
            onAddDiary({
                id: detailData.id,
                date: detailData.date,
                imageUrl: detailData.imageUrl ?? "",
                moodScore: detailData.moodScore
            });

            // 결과 모달 띄우기
            setModalData(detailData);
            // 내용 초기화
            setContent('');
        } catch (error) {
            console.error(error);
            alert("일기 저장 중 오류가 발생했습니다.");
            // 에러 시 로딩 상태 모두 해제
            setIsAnalyzing(false);
        } finally {
            // 애니메이션 종료
            setIsGenerating(false);
            setIsLoading(false);
        }
    };

    // 결과 모달 닫기 핸들러
    const handleResultClose = () => {
        setModalData(null);
        onClose();
    };

    // 모달이 닫혀있으면 렌더링 하지 않음
    if (!isOpen) return null;

    // 결과가 있으면 ResultModal로 교체
    if (modalData) {
        return (
            <ResultModal
                data={modalData}
                onClose={handleResultClose}
                onUpdateDiary={onUpdateDiary}
                onDeleteDiary={onDeleteDiary}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            {/* 모달 박스 */}
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()} // 배경 클릭 시 닫힘 방지
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">일기 쓰기</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 날짜 및 내용 */}
                <div className="p-5 overflow-y-auto">
                    {/* 날짜 입력 */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            날짜
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={getToday()}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                        />
                    </div>

                    {/* 내용 입력 */}
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            무슨 일이 있었나요?
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="있었던 일을 적어보세요..."
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none h-40"
                        />
                    </div>
                </div>

                {/* 버튼 */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-amber-500/30 hover:from-amber-600 hover:to-orange-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? (
                            <span>일기 분석 중...</span>
                        ) : isGenerating ? (
                            <span>그림 그리는 중...</span>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                <span>AI에게 그림 부탁하기</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
            {/* 키워드 애니메이션 로딩 */}
            {isGenerating && <KeywordLoading keywords={keywords} />}
            {/* 기본 스피너 로딩 */}
            {isAnalyzing && <LoadingScreen />}
        </div>
    );
};

export default WriteModal;
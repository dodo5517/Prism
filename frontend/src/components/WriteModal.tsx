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

    // selectedDate가 있으면 그것을, 없으면 오늘 날짜를 기본값으로 설정
    const [date, setDate] = useState<string>(selectedDate || getToday());
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modalData, setModalData] = useState<CalendarDetailResponseDto | null>(null);

    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [keywords, setKeywords] = useState<string[]>([]);

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
            // 분석 시작
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* 배경 */}
            <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" />

            {/* 모달 */}
            <div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-100">
                    <h2 className="text-base font-medium text-neutral-800">오늘 하루</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 내용 */}
                <div className="p-5 overflow-y-auto">
                    {/* 날짜 */}
                    <div className="mb-5">
                        <label className="block text-sm text-neutral-600 mb-2">날짜</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={getToday()}
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-neutral-900/5 focus:border-neutral-400 outline-none transition-all text-neutral-700"
                        />
                    </div>

                    {/* 내용 */}
                    <div>
                        <label className="block text-sm text-neutral-600 mb-2">무슨 일이 있었나요?</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="오늘 있었던 일을 자유롭게 적어보세요..."
                            className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-neutral-900/5 focus:border-neutral-400 outline-none transition-all resize-none h-44 text-neutral-700 placeholder:text-neutral-400"
                        />
                    </div>
                </div>

                {/* 버튼 */}
                <div className="p-5 border-t border-neutral-100 bg-neutral-50/50">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-3.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                                일기 분석 중...
                            </span>
                        ) : isGenerating ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                                그림 그리는 중...
                            </span>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>그림으로 변환하기</span>
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
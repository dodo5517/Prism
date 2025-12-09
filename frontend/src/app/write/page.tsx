"use client";

import React, { useState } from 'react';
import { createDiary, getDiaryDetail } from '@/api/diaryApi';
import { CalendarDetailResponseDto } from '@/types/diary';
import LoadingScreen from '@/components/LoadingScreen';
import ResultModal from '@/components/ResultModal';

const Page: React.FC = () => {
    // 오늘 날짜 구하기 (YYYY-MM-DD)
    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // 상태
    const [date, setDate] = useState<string>(getToday()); // 기본값=오늘
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modalData, setModalData] = useState<CalendarDetailResponseDto | null>(null);

    const handleSubmit = async () => {
        if (!content.trim()) {
            alert("일기 내용을 입력해주세요!");
            return;
        }

        setIsLoading(true);

        try {
            // 일기 작성 API 호출
            const logId = await createDiary(date, content);
            console.log("생성된 로그 ID:", logId);

            // 상세 조회 API 호출
            const detailData = await getDiaryDetail(logId);
            setModalData(detailData);
            setContent('');

        } catch (error) {
            console.error(error);
            alert("일기 저장 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="write-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            {/*날짜*/}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    날짜
                </label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={getToday()} // 미래 날짜 선택 방지
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
            </div>

            <h2>오늘 무슨 일이 있었나요?</h2>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘 있었던 일을 적어보세요..."
                rows={6}
                style={{ width: '100%', padding: '10px', marginTop: '10px' }}
            />

            <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}
            >
                AI에게 그림 부탁하기
            </button>

            {/* 로딩 화면 */}
            {isLoading && <LoadingScreen />}

            {/* 결과 모달 */}
            {modalData && (
                <ResultModal
                    data={modalData}
                    onClose={() => setModalData(null)}
                />
            )}
        </div>
    );
};

export default Page;
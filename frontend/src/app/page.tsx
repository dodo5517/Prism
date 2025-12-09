'use client';

import React, { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, setMonth, isSameMonth, isSameDay } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import {getCalendar, getDiaryDetail} from '@/api/diaryApi';
import ResultModal from '@/components/ResultModal';
import LoadingScreen from '@/components/LoadingScreen';
import LoginView from '@/components/Login';
import WriteModal from '@/components/WriteModal';

import { CalendarDetailResponseDto, CalendarResponseDto } from "@/types/diary";

export default function Home() {
    const { isAuthenticated, logout } = useAuthStore();

    // 상태 관리
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [diaries, setDiaries] = useState<CalendarResponseDto[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDetail, setSelectedDetail] = useState<CalendarDetailResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    // 모달 상태
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

    // 초기화 및 데이터 로딩
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isAuthenticated && isMounted) {
            fetchDiaries(currentDate);
        }
    }, [currentDate, isAuthenticated, isMounted]);

    // 달력 부분 업데이트 함수
    const addDiary = (newDiary: CalendarResponseDto) => {
        setDiaries(prev => {
            // 이미 해당 날짜 일기가 있으면 교체
            const exists = prev.some(d => d.id === newDiary.id);
            if (exists) {
                return prev.map(d => (d.id === newDiary.id ? newDiary : d));
            }
            // 없으면 추가
            return [...prev, newDiary];
        });
    };

    // 달력 부분 업데이트 함수
    const updateDiary = (updated: CalendarDetailResponseDto) => {
        setDiaries(prev =>
            prev.map(d =>
                d.id === updated.id
                    ? {
                        id: updated.id,
                        date: updated.date,
                        imageUrl: updated.imageUrl ?? "",
                        moodScore: updated.moodScore
                    }
                    : d
            )
        );
    };

    // 일기 삭제 시 목록에서도 제거
    const removeDiary = (id: number) => {
        setDiaries(prev => prev.filter(d => d.id !== id));
    };

    const fetchDiaries = async (date: Date) => {
        setIsLoading(true);
        try {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const data = await getCalendar(year, month);
            setDiaries(data);
        } catch (error) {
            console.error("데이터 로드 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 달력 그리드 생성(date-fns 활용)
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart); // 일요일 시작 기준
        const endDate = endOfWeek(monthEnd);

        const days = eachDayOfInterval({ start: startDate, end: endDate });

        // 주 단위로 묶기
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }
        return weeks;
    }, [currentDate]);

    // 달 이동 핸들러
    const handleMonthChange = (monthIndex: number) => {
        const newDate = setMonth(currentDate, monthIndex - 1);
        setCurrentDate(newDate);
    };

    const handleDateClick = async (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        // 해당 날짜에 일기가 있는지 확인
        const diary = diaries.find((d) => d.date === dateString);
        if (diary) {
            try {
                // 로딩 표시 필요시 setIsLoading(true);
                // 상제 조회 API 호출
                const detailData = await getDiaryDetail(diary.id);

                // 받아온 상세 데이터로 모달 열기
                setSelectedDetail(detailData);
            } catch (error) {
                console.error("상세 조회 실패:", error);
                alert("일기 내용을 불러오는 데 실패했습니다.");
            } finally {
                // setIsLoading(false);
            }
        } else {
            // 일기가 없으면 쓰기 모달 열기
            openWriteModal(dateString);
        }
    };

    const openWriteModal = (dateStr: string) => {
        setSelectedDate(dateStr);
        setIsWriteModalOpen(true);
    };

    // 상수 데이터
    const daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    if (!isMounted) return null;

    // 로그인 전 화면
    if (!isAuthenticated) return <LoginView />;

    return (
        <main className="min-h-screen bg-stone-200 p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center font-sans">
            <div className="w-full max-w-xs sm:max-w-lg md:max-w-3xl lg:max-w-4xl bg-amber-50/90 rounded-lg shadow-2xl overflow-hidden border border-stone-300/50 relative">

                {/* 상단 로그아웃/쓰기 버튼 */}
                <div className="absolute top-3 right-4 z-20 flex gap-2">
                    <button onClick={() => openWriteModal(format(new Date(), "yyyy-MM-dd"))}
                            className="text-[10px] sm:text-xs bg-stone-600 text-amber-50 px-2 py-1 rounded hover:bg-stone-800 transition">
                        + WRITE
                    </button>
                    <button
                        onClick={() => { if(confirm("로그아웃 하시겠습니까?")) logout(); }}
                        className="text-[10px] sm:text-xs text-stone-400 hover:text-red-400 underline"
                    >
                        LOGOUT
                    </button>
                </div>

                {/* Header */}
                <div className="bg-stone-300/50 px-4 py-3 flex flex-col gap-4 border-b border-stone-300/70">

                    {/* 년도 | 로고 | 버튼 */}
                    <div className="flex items-center justify-between w-full relative">
                        {/* 년도 */}
                        <div className="text-stone-500 text-sm font-serif font-bold italic w-20">
                            {format(currentDate, 'yyyy')}
                        </div>

                        {/* 로고 */}
                        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl sm:text-3xl font-serif font-extrabold text-indigo-900 tracking-widest uppercase drop-shadow-sm">
                            Prism
                        </h1>

                        {/* 버튼 */}
                        <div className="flex gap-2 w-20 justify-end z-10">
                            <button onClick={() => openWriteModal('')}
                                className="text-[10px] sm:text-xs bg-stone-600 text-amber-50 px-2 py-1 rounded hover:bg-stone-800 transition whitespace-nowrap">
                                + WRITE
                            </button>
                            <button
                                onClick={() => { if(confirm("로그아웃 하시겠습니까?")) logout(); }}
                                className="text-[10px] sm:text-xs text-stone-500 hover:text-red-500 underline whitespace-nowrap"
                            >
                                LOGOUT
                            </button>
                        </div>
                    </div>

                    {/* 월 선택 버튼 (1~12)*/}
                    <div className="flex items-center justify-center gap-1 sm:gap-2 w-full overflow-x-auto pb-1 scrollbar-hide">
                        {months.map((m) => (
                            <button
                                key={m}
                                onClick={() => handleMonthChange(m)}
                                className={`flex-shrink-0 text-[10px] sm:text-xs w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
                                    m === (currentDate.getMonth() + 1)
                                        ? 'bg-red-400 text-white font-bold shadow-md scale-110'
                                        : 'text-stone-400 hover:bg-stone-200 hover:text-stone-600'
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-7 border-b border-stone-300/50 bg-amber-50/50">
                    {daysOfWeek.map((day, index) => (
                        <div
                            key={day}
                            className={`py-2 text-center text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider ${
                                index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-stone-500'
                            }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="relative bg-amber-50">
                    {calendarDays.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-7 border-b border-stone-200/60 last:border-b-0">
                            {week.map((day, dayIndex) => {
                                const dateString = format(day, 'yyyy-MM-dd');
                                const diary = diaries.find((d) => d.date === dateString);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isToday = isSameDay(day, new Date());
                                const isWeekend = dayIndex === 0 || dayIndex === 6; // 0:Sun, 6:Sat

                                return (
                                    <div
                                        key={day.toString()}
                                        onClick={() => handleDateClick(day)}
                                        className={`
                                            min-h-[60px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[110px] 
                                            p-1 border-r border-stone-200/40 last:border-r-0 relative group cursor-pointer transition-colors
                                            ${!isCurrentMonth ? 'bg-stone-100/50 text-stone-300' : 'text-stone-600 hover:bg-amber-100/30'}
                                            ${isToday ? 'bg-indigo-50/60' : ''}
                                        `}
                                    >
                                        {/* 날짜 숫자 */}
                                        <span className={`
                                            relative z-10 text-[10px] sm:text-xs font-medium px-1 rounded
                                            ${dayIndex === 0 ? 'text-red-400' : dayIndex === 6 ? 'text-blue-400' : ''}
                                            ${isToday ? 'bg-indigo-500 text-white font-bold shadow-sm' : ''}
                                        `}>
                                            {format(day, 'd')}
                                        </span>

                                        {/* 이미지 */}
                                        {diary && (
                                            <div className="absolute inset-0 z-0">
                                                {/* 이미지 */}
                                                <img
                                                    src={diary.imageUrl}
                                                    alt="image"
                                                    className="w-full h-full p-[1px] rounded-[4px] object-cover grayscale-[20%] duration-500"
                                                />

                                                {/*/!* 감정 테두리 (Overlay) *!/*/}
                                                {/*<div className={`absolute inset-0 border-[3px] pointer-events-none transition-colors duration-300 ${*/}
                                                {/*    diary.moodScore >= 8 ? 'border-pink-300/70' :*/}
                                                {/*        diary.moodScore >= 4 ? 'border-transparent' : 'border-stone-400/50'*/}
                                                {/*}`} />*/}

                                                {/* 감정 점수 (작게 표시) - 선택사항 */}
                                                {/* <div className="absolute bottom-1 right-1 bg-white/80 px-1 rounded text-[8px] font-bold text-stone-600">
                                                    {diary.moodScore}
                                                </div> */}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* 모달 */}
            <WriteModal
                isOpen={isWriteModalOpen}
                onClose={() => setIsWriteModalOpen(false)}
                selectedDate={selectedDate}
                onAddDiary={addDiary}
                onUpdateDiary={updateDiary}
                onDeleteDiary={removeDiary}
            />
            {selectedDetail &&
                <ResultModal
                    data={selectedDetail}
                    onClose={() => setSelectedDetail(null)}
                    onUpdateDiary={updateDiary}
                    onDeleteDiary={removeDiary}
                />
            }

            {/*로딩*/}
            {isLoading && <LoadingScreen />}
        </main>
    );
};
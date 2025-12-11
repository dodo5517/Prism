'use client';

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, setMonth, isSameMonth, isSameDay } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import {getCalendar, getDiaryDetail} from '@/api/diaryApi';
import ResultModal from '@/components/ResultModal';
import LoadingScreen from '@/components/LoadingScreen';
import LoginView from '@/components/Login';
import WriteModal from '@/components/WriteModal';

import { CalendarDetailResponseDto, CalendarResponseDto } from "@/types/diary";
import {UserRole} from "@/types/JwtPayload";

export default function Home() {
    const { isAuthenticated, logout, user } = useAuthStore();

    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [diaries, setDiaries] = useState<CalendarResponseDto[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDetail, setSelectedDetail] = useState<CalendarDetailResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
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

    // 달력에 추가하는 함수
    const addDiary = (newDiary: CalendarResponseDto) => {
        setDiaries(prev => {
            const exists = prev.some(d => d.id === newDiary.id);
            if (exists) {
                return prev.map(d => (d.id === newDiary.id ? newDiary : d));
            }
            return [...prev, newDiary];
        });
    };

    // 달력에 업데이트하는 함수
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

    // 달력 그리드 생성
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart); // 시작 기준 일요일
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
            // 일기 있으면
            try {
                // 상제 조회 API 호출
                const detailData = await getDiaryDetail(diary.id);
                setSelectedDetail(detailData);
            } catch (error) {
                console.error("상세 조회 실패:", error);
                alert("일기 내용을 불러오는 데 실패했습니다.");
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

    const daysOfWeek: string[] = ['일', '월', '화', '수', '목', '금', '토'];
    const months: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    if (!isMounted) return null;
    // 로그인 전 화면
    if (!isAuthenticated) return <LoginView />;

    return (
        <main className="min-h-screen bg-neutral-100 p-3 sm:p-5 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-xs sm:max-w-lg md:max-w-3xl lg:max-w-4xl">
                {/* 메인  */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/60 overflow-hidden">

                    {/* 헤더 */}
                    <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
                        <div className="flex items-center justify-between mb-5">
                            {/* 년도 */}
                            <span className="text-neutral-400 text-xs sm:text-sm tabular-nums">
                                {format(currentDate, 'yyyy')}
                            </span>

                            {/* 로고 */}
                            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg sm:text-xl tracking-[0.2em] text-neutral-800 font-medium">
                                PRISM
                            </h1>

                            {/* 버튼 */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                {user?.role === UserRole.ADMIN && (
                                    <Link
                                        href="/admin"
                                        className="text-[10px] sm:text-xs px-2.5 py-1.5 rounded-md bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
                                    >
                                        Admin
                                    </Link>
                                )}
                                <button
                                    onClick={() => openWriteModal('')}
                                    className="text-[10px] sm:text-xs px-3 py-1.5 rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                                >
                                    기록하기
                                </button>
                                <button
                                    onClick={() => { if(confirm("로그아웃 하시겠습니까?")) logout(); }}
                                    className="text-[10px] sm:text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                    로그아웃
                                </button>
                            </div>
                        </div>

                        {/* 월 선택 */}
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                            {months.map((m) => (
                                <button
                                    key={m}
                                    onClick={() => handleMonthChange(m)}
                                    className={`text-xs w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md transition-all ${
                                        m === (currentDate.getMonth() + 1)
                                            ? 'bg-neutral-900 text-white'
                                            : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 border-b border-neutral-100 bg-neutral-50/50">
                        {daysOfWeek.map((day, index) => (
                            <div
                                key={`${day}-${index}`}
                                className={`py-2.5 text-center text-[11px] sm:text-xs ${
                                    index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-neutral-400'
                                }`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar */}
                    <div>
                        {calendarDays.map((week, weekIndex) => (
                            <div key={weekIndex} className="grid grid-cols-7 border-b border-neutral-50 last:border-b-0">
                                {week.map((day, dayIndex) => {
                                    const dateString = format(day, 'yyyy-MM-dd');
                                    const diary = diaries.find((d) => d.date === dateString);
                                    const isCurrentMonth = isSameMonth(day, currentDate);
                                    const isToday = isSameDay(day, new Date());

                                    return (
                                        <div
                                            key={day.toString()}
                                            onClick={() => handleDateClick(day)}
                                            className={`
                                                min-h-[60px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[110px] 
                                                p-1 sm:p-1.5 border-r border-neutral-50 last:border-r-0 relative group cursor-pointer transition-colors
                                                ${!isCurrentMonth ? 'bg-neutral-50/50' : 'hover:bg-neutral-50'}
                                            `}
                                        >
                                            {/* 날짜 */}
                                            <span className={`
                                                relative z-10 text-[11px] sm:text-xs inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-colors
                                                ${!isCurrentMonth ? 'text-neutral-300' : ''}
                                                ${dayIndex === 0 && isCurrentMonth ? 'text-red-400' : ''}
                                                ${dayIndex === 6 && isCurrentMonth ? 'text-blue-400' : ''}
                                                ${dayIndex !== 0 && dayIndex !== 6 && isCurrentMonth ? 'text-neutral-600' : ''}
                                                ${isToday ? 'bg-neutral-900 text-white' : ''}
                                            `}>
                                                {format(day, 'd')}
                                            </span>

                                            {/* 이미지 */}
                                            {diary && (
                                                <div className="absolute inset-1 z-0 rounded-lg overflow-hidden">
                                                    <img
                                                        src={diary.imageUrl}
                                                        alt="diary"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    {/* hover */}
                                                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                                         style={{
                                                             boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.8), inset 0 0 20px rgba(255,255,255,0.3)'
                                                         }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 하단 */}
                <div className="flex justify-center mt-4 gap-1">
                    <div className="w-8 h-0.5 rounded-full bg-red-300/60" />
                    <div className="w-8 h-0.5 rounded-full bg-amber-300/60" />
                    <div className="w-8 h-0.5 rounded-full bg-emerald-300/60" />
                    <div className="w-8 h-0.5 rounded-full bg-blue-300/60" />
                    <div className="w-8 h-0.5 rounded-full bg-violet-300/60" />
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

            {isLoading && <LoadingScreen />}
        </main>
    );
}
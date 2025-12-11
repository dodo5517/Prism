'use client';

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TooltipItem
} from 'chart.js';
import { fetchKeywordStats } from '@/api/adminApi';
import { KeywordStats } from '@/types/admin';
import LoadingScreen from '@/components/LoadingScreen';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Page() {
    const [stats, setStats] = useState<KeywordStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
    const [filterMonth, setFilterMonth] = useState<number>(0);

    useEffect(() => {
        loadStats();
    }, [filterYear, filterMonth]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const data = await fetchKeywordStats(filterYear, filterMonth);
            setStats(data);
        } catch (error) {
            console.error("통계 로드 실패:", error);
            setStats([]);
        } finally {
            setLoading(false);
        }
    };

    // 총 키워드 수 계산 (,로 구분된 키워드 개수 합산)
    const getTotalKeywordCount = (): number => {
        return stats.reduce((total, s) => {
            const keywords = s.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
            return total + keywords.length;
        }, 0);
    };

    // 키워드 문자열을 배열로 변환
    const parseKeywords = (keywordString: string): string[] => {
        return keywordString.split(',').map(k => k.trim()).filter(k => k.length > 0);
    };

    // 차트 데이터 구성
    const chartData = {
        labels: stats.map(s => s.keywords),
        datasets: [
            {
                label: '키워드 사용 횟수',
                data: stats.map(s => s.count),
                backgroundColor: 'rgba(217, 119, 6, 0.5)', // amber-600
                borderColor: 'rgba(217, 119, 6, 1)',
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#57534e', // stone-600
                    font: {
                        size: 12,
                    },
                },
            },
            title: {
                display: true,
                text: `${filterYear}년 ${filterMonth === 0 ? '전체' : filterMonth + '월'} 키워드 Top ${stats.length}`,
                color: '#44403c', // stone-700
                font: {
                    size: 16,
                    weight: 'bold' as const,
                },
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(68, 64, 60, 0.9)', // stone-700
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(217, 119, 6, 0.5)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                callbacks: {
                    title: (context: TooltipItem<'bar'>[]) => {
                        return `키워드: ${context[0].label}`;
                    },
                    label: (context: TooltipItem<'bar'>) => {
                        return `사용 횟수: ${context.raw}회`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    display: false, // x축 라벨 숨기기
                },
                grid: {
                    color: 'rgba(214, 211, 209, 0.5)', // stone-300
                },
            },
            y: {
                ticks: {
                    color: '#78716c',
                },
                grid: {
                    color: 'rgba(214, 211, 209, 0.5)',
                },
            },
        },
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-100 p-4 sm:p-6 md:p-8">
            {/* 헤더 */}
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-stone-700">관리자 대시보드</h1>
                        <p className="text-xs sm:text-sm text-stone-500">키워드 통계 분석</p>
                    </div>
                </div>

                {/* 필터 카드 */}
                <div className="bg-amber-50/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-stone-200/50 mb-6 sm:mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <h2 className="text-base sm:text-lg font-semibold text-stone-700">키워드 통계 필터</h2>
                    </div>

                    <div className="flex flex-wrap gap-3 sm:gap-4">
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs sm:text-sm text-stone-500 mb-1.5">연도</label>
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(Number(e.target.value))}
                                className="w-full p-2.5 sm:p-3 bg-white/60 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-sm sm:text-base text-stone-700"
                            >
                                {[...Array(3)].map((_, i) => {
                                    const y = new Date().getFullYear() - i;
                                    return <option key={y} value={y}>{y}년</option>;
                                })}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs sm:text-sm text-stone-500 mb-1.5">월</label>
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(Number(e.target.value))}
                                className="w-full p-2.5 sm:p-3 bg-white/60 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-sm sm:text-base text-stone-700"
                            >
                                <option value={0}>전체</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}월</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 차트 카드 */}
                <div className="bg-amber-50/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-stone-200/50">
                    <p className="text-xs text-stone-400 mb-2">* 막대에 마우스를 올리면 키워드를 확인할 수 있습니다</p>
                    <div className="h-[300px] sm:h-[350px] md:h-[400px]">
                        {stats.length > 0 ? (
                            <Bar data={chartData} options={options} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-stone-400">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <p className="text-sm sm:text-base">데이터가 없습니다.</p>
                                <p className="text-xs sm:text-sm mt-1">다른 기간을 선택해보세요.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 통계 요약 카드 */}
                {stats.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
                        {/* 총 키워드 수 - 청록색 계열 */}
                        <div className="bg-gradient-to-br from-teal-100 to-emerald-50 p-4 sm:p-5 rounded-xl border border-teal-200/50 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <p className="text-xs sm:text-sm text-teal-700">총 키워드 수</p>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-teal-800">{getTotalKeywordCount()}</p>
                        </div>

                        {/* 최다 키워드 - 로즈/핑크 계열 */}
                        <div className="bg-gradient-to-br from-rose-100 to-pink-50 p-4 sm:p-5 rounded-xl border border-rose-200/50 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                <p className="text-xs sm:text-sm text-rose-700">최다 키워드</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {stats[0]?.keywords ? (
                                    parseKeywords(stats[0].keywords).map((keyword, index) => (
                                        <span
                                            key={index}
                                            className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-rose-700 bg-white/70 rounded-full border border-rose-300/60 shadow-sm"
                                        >
                                            #{keyword}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-rose-800">-</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
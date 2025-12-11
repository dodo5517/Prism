'use client';

import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    TooltipItem
} from 'chart.js';
import { fetchKeywordStats, fetchMoodStats } from '@/api/adminApi';
import { KeywordStats, MoodStats } from '@/types/admin';
// import LoadingScreen from '@/components/LoadingScreen';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function Page() {
    const [keywordStats, setKeywordStats] = useState<KeywordStats[]>([]);
    const [moodStats, setMoodStats] = useState<MoodStats[]>([]);
    const [loading, setLoading] = useState(false);

    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
    const [filterMonth, setFilterMonth] = useState<number>(0);

    useEffect(() => {
        loadStats();
    }, [filterYear, filterMonth]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const [kData, mData] = await Promise.all([
                fetchKeywordStats(filterYear, filterMonth),
                fetchMoodStats(filterYear)
            ]);
            setKeywordStats(kData);
            setMoodStats(mData || []);
        } catch (error) {
            console.error("통계 로드 실패:", error);
            setKeywordStats([]);
            setMoodStats([]);
        } finally {
            setLoading(false);
        }
    };

    const getTotalKeywordCount = (): number => {
        return keywordStats.reduce((total, s) => {
            const keywords = s.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
            return total + keywords.length;
        }, 0);
    };

    const parseKeywords = (keywordString: string): string[] => {
        return keywordString.split(',').map(k => k.trim()).filter(k => k.length > 0);
    };

    // 스펙트럼 색상 (차트용)
    const spectrumColors = [
        'rgba(239, 68, 68, 0.7)',   // red
        'rgba(34, 197, 94, 0.7)',   // green
        'rgba(59, 130, 246, 0.7)',  // blue
    ];

    const barData = {
        labels: keywordStats.map(s => s.keywords),
        datasets: [
            {
                label: '사용 횟수',
                data: keywordStats.map(s => s.count),
                backgroundColor: spectrumColors,
                borderRadius: 6,
            },
        ],
    };

    const lineData = {
        labels: moodStats.map(s => s.period),
        datasets: [
            {
                label: '평균 점수',
                data: moodStats.map(s => s.averageScore),
                borderColor: '#404040',
                backgroundColor: 'rgba(64, 64, 64, 0.05)',
                tension: 0.3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#404040',
                pointBorderWidth: 2,
                pointRadius: 4,
                fill: true,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#262626',
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 8,
                padding: 12,
                callbacks: {
                    title: (context: TooltipItem<'bar'>[]) => context[0].label,
                    label: (context: TooltipItem<'bar'>) => `${context.raw}회`,
                },
            },
        },
        scales: {
            x: {
                ticks: { display: false },
                grid: { display: false },
                border: { display: false },
            },
            y: {
                ticks: { color: '#a3a3a3', font: { size: 11 } },
                grid: { color: '#f5f5f5' },
                border: { display: false },
            },
        },
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#262626',
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 8,
                padding: 12,
            },
        },
        scales: {
            x: {
                ticks: { color: '#a3a3a3', font: { size: 11 } },
                grid: { display: false },
                border: { display: false },
            },
            y: {
                min: 0,
                max: 100,
                ticks: { color: '#a3a3a3', font: { size: 11 } },
                grid: { color: '#f5f5f5' },
                border: { display: false },
            },
        },
    };

    // 키워드 태그 색상
    const tagColors = [
        'bg-red-50 text-red-600',
        'bg-orange-50 text-orange-600',
        'bg-amber-50 text-amber-600',
        'bg-emerald-50 text-emerald-600',
        'bg-blue-50 text-blue-600',
        'bg-indigo-50 text-indigo-600',
        'bg-violet-50 text-violet-600',
    ];

    return (
        <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-xl sm:text-2xl font-medium text-neutral-800">대시보드</h1>
                    </div>
                    <p className="text-sm text-neutral-500">서비스 통계를 확인하세요</p>
                </div>

                {/* 필터 */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(Number(e.target.value))}
                        className="px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/5 focus:border-neutral-400 transition-all"
                    >
                        {[...Array(3)].map((_, i) => {
                            const y = new Date().getFullYear() - i;
                            return <option key={y} value={y}>{y}년</option>;
                        })}
                    </select>

                    <select
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(Number(e.target.value))}
                        className="px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/5 focus:border-neutral-400 transition-all"
                    >
                        <option value={0}>전체</option>
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}월</option>
                        ))}
                    </select>
                </div>

                {/* 요약 카드 */}
                {keywordStats.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-5 rounded-xl border border-neutral-200/60 shadow-sm">
                            <p className="text-xs text-neutral-500 mb-1">총 키워드</p>
                            <p className="text-3xl font-light text-neutral-800 tabular-nums">{getTotalKeywordCount()}</p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-neutral-200/60 shadow-sm">
                            <p className="text-xs text-neutral-500 mb-3">인기 키워드</p>
                            <div className="flex flex-wrap gap-1.5">
                                {keywordStats[0]?.keywords ? (
                                    parseKeywords(keywordStats[0].keywords).map((keyword, index) => (
                                        <span
                                            key={index}
                                            className={`px-2.5 py-1 text-xs rounded-full ${tagColors[index % tagColors.length]}`}
                                        >
                                            {keyword}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-neutral-400">-</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 차트 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* 키워드 차트 */}
                    <div className="bg-white p-5 rounded-xl border border-neutral-200/60 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-sm font-medium text-neutral-800">Top3 키워드</h2>
                            <p className="text-xs text-neutral-400 mt-1">
                                {filterYear}년 {filterMonth === 0 ? '전체' : `${filterMonth}월`}
                            </p>
                        </div>
                        <div className="h-[280px]">
                            {keywordStats.length > 0 ? (
                                <Bar data={barData} options={barOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-neutral-400 text-sm">
                                    데이터가 없습니다
                                </div>
                            )}
                        </div>
                        {keywordStats.length > 0 && (
                            <p className="text-[11px] text-neutral-400 mt-3">막대 위에 마우스를 올려 키워드를 확인하세요</p>
                        )}
                    </div>

                    {/* 감정 차트 */}
                    <div className="bg-white p-5 rounded-xl border border-neutral-200/60 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-sm font-medium text-neutral-800">감정 변화</h2>
                            <p className="text-xs text-neutral-400 mt-1">{filterYear}년 월별 추이</p>
                        </div>
                        <div className="h-[280px]">
                            {moodStats.length > 0 ? (
                                <Line data={lineData} options={lineOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-neutral-400 text-sm">
                                    데이터가 없습니다
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 하단 */}
                <div className="flex justify-center mt-8 gap-0.5">
                    <div className="w-6 h-0.5 rounded-full bg-red-400/60" />
                    <div className="w-6 h-0.5 rounded-full bg-orange-400/60" />
                    <div className="w-6 h-0.5 rounded-full bg-yellow-400/60" />
                    <div className="w-6 h-0.5 rounded-full bg-green-400/60" />
                    <div className="w-6 h-0.5 rounded-full bg-blue-400/60" />
                    <div className="w-6 h-0.5 rounded-full bg-indigo-400/60" />
                    <div className="w-6 h-0.5 rounded-full bg-violet-400/60" />
                </div>
            </div>

            {/*{loading && <LoadingScreen />}*/}
        </div>
    );
}
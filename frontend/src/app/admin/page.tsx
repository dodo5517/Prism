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
import LoadingScreen from '@/components/LoadingScreen';

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

    const barData = {
        labels: keywordStats.map(s => s.keywords),
        datasets: [
            {
                label: '사용 횟수',
                data: keywordStats.map(s => s.count),
                backgroundColor: 'rgba(13, 148, 136, 0.5)',
                borderRadius: 4,
            },
        ],
    };

    const lineData = {
        labels: moodStats.map(s => s.period),
        datasets: [
            {
                label: '평균 점수',
                data: moodStats.map(s => s.averageScore),
                borderColor: '#0d9488',
                backgroundColor: 'rgba(13, 148, 136, 0.08)',
                tension: 0.3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#0d9488',
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
            title: { display: false },
            tooltip: {
                backgroundColor: '#1c1917',
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 6,
                padding: 10,
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
                ticks: { color: '#a8a29e', font: { size: 11 } },
                grid: { color: '#f5f5f4' },
                border: { display: false },
            },
        },
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                backgroundColor: '#1c1917',
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 6,
                padding: 10,
            },
        },
        scales: {
            x: {
                ticks: { color: '#a8a29e', font: { size: 11 } },
                grid: { display: false },
                border: { display: false },
            },
            y: {
                min: 0,
                max: 100,
                ticks: { color: '#a8a29e', font: { size: 11 } },
                grid: { color: '#f5f5f4' },
                border: { display: false },
            },
        },
    };

    // if (loading) return "Loading...";

    return (
        <div className="min-h-screen bg-stone-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-xl sm:text-2xl font-semibold text-stone-800">대시보드</h1>
                    <p className="text-sm text-stone-500 mt-1">서비스 통계를 확인하세요</p>
                </div>

                {/* 필터 */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(Number(e.target.value))}
                        className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                        {[...Array(3)].map((_, i) => {
                            const y = new Date().getFullYear() - i;
                            return <option key={y} value={y}>{y}년</option>;
                        })}
                    </select>

                    <select
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(Number(e.target.value))}
                        className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                        <div className="bg-white p-4 sm:p-5 rounded-lg border border-stone-200">
                            <p className="text-xs text-stone-500 mb-1">총 키워드</p>
                            <p className="text-2xl sm:text-3xl font-semibold text-stone-800">{getTotalKeywordCount()}</p>
                        </div>

                        <div className="bg-white p-4 sm:p-5 rounded-lg border border-stone-200">
                            <p className="text-xs text-stone-500 mb-2">인기 키워드</p>
                            <div className="flex flex-wrap gap-1.5">
                                {keywordStats[0]?.keywords ? (
                                    parseKeywords(keywordStats[0].keywords).map((keyword, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs text-amber-700 bg-amber-50 rounded"
                                        >
                                            {keyword}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-stone-400">-</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 차트 그리드 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* 키워드 차트 */}
                    <div className="bg-white p-4 sm:p-5 rounded-lg border border-stone-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-medium text-stone-800">Top3 키워드</h2>
                                <p className="text-xs text-stone-400 mt-0.5">
                                    {filterYear}년 {filterMonth === 0 ? '전체' : `${filterMonth}월`}
                                </p>
                            </div>
                        </div>
                        <div className="h-[260px] sm:h-[300px]">
                            {keywordStats.length > 0 ? (
                                <Bar data={barData} options={barOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-stone-400 text-sm">
                                    데이터가 없습니다
                                </div>
                            )}
                        </div>
                        {keywordStats.length > 0 && (
                            <p className="text-[11px] text-stone-400 mt-3">막대 위에 마우스를 올려 키워드를 확인하세요</p>
                        )}
                    </div>

                    {/* 감정 추이 차트 */}
                    <div className="bg-white p-4 sm:p-5 rounded-lg border border-stone-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-medium text-stone-800">감정 변화</h2>
                                <p className="text-xs text-stone-400 mt-0.5">{filterYear}년 월별 추이</p>
                            </div>
                        </div>
                        <div className="h-[260px] sm:h-[300px]">
                            {moodStats.length > 0 ? (
                                <Line data={lineData} options={lineOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-stone-400 text-sm">
                                    데이터가 없습니다
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
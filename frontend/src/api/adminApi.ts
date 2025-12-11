import api from './axios';
import {ApiResponse} from "@/types/global";
import {KeywordStats, MoodStats} from "@/types/admin";


// 키워드 통계 요청 API
export const fetchKeywordStats = async (year?: number, month?: number): Promise<KeywordStats[]> => {
    const response = await api.get<ApiResponse<KeywordStats[]>>(`/admin/stats/keywords`,{
        params: { year, month }
    });
    return response.data.data;
};

// 감정 추이 통계 요청 API
export const fetchMoodStats = async (year?: number): Promise<MoodStats[]> => {
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));

    const response = await api.get<ApiResponse<MoodStats[]>>(`/admin/stats/mood?${params.toString()}`);
    return response.data.data;
};
import api from './axios';
import {ApiResponse} from "@/types/global";
import {KeywordStats} from "@/types/admin";

export const fetchKeywordStats = async (year?: number, month?: number): Promise<KeywordStats[]> => {
    const response = await api.get<ApiResponse<KeywordStats[]>>(`/admin/stats/keywords`,{
        params: { year, month }
    });
    return response.data.data;
};
import api from './axios';
import {MoodLogRequestDto, CalendarDetailResponseDto, CalendarResponseDto} from '@/types/diary';

// 공통 응답 형식
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string | null;
}

// 일기 작성
export const createDiary = async (date:string, content: string): Promise<number> => {
    const requestBody: MoodLogRequestDto = { date, content };
    const response = await api.post<ApiResponse<number>>('/logs', requestBody);
    return response.data.data;
};

// 달력 조회
export const getCalendar = async (): Promise<CalendarResponseDto> => {
    const response = await api.get<ApiResponse<CalendarResponseDto>>(`/logs`);
    return response.data.data;
};

// 상세 조회
export const getDiaryDetail = async (id: number): Promise<CalendarDetailResponseDto> => {
    const response = await api.get<ApiResponse<CalendarDetailResponseDto>>(`/logs/${id}`);
    return response.data.data;
};
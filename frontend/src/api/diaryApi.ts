import api from './axios';
import {MoodLogRequestDto, CalendarDetailResponseDto, CalendarResponseDto, AnalyzeResponse} from '@/types/diary';

// 공통 응답 형식
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string | null;
}

// 일기 저장 및 분석
export const analyzeDiary = async (date: string, content: string): Promise<AnalyzeResponse> => {
    const response = await api.post<ApiResponse<AnalyzeResponse>>('/logs', { date, content });
    return response.data.data;
};

// 이미지 생성
export const generateImageOnly = async (logId: number): Promise<number> => {
    const response = await api.post<ApiResponse<number>>(`/logs/${logId}/image`);
    return response.data.data;
};

// 일기 작성
// export const createDiary = async (date:string, content: string): Promise<number> => {
//     const requestBody: MoodLogRequestDto = { date, content };
//     const response = await api.post<ApiResponse<number>>('/logs', requestBody);
//     return response.data.data;
// };

// 달력 조회
export const getCalendar = async (year: number, month: number): Promise<CalendarResponseDto[]> => {
    const response = await api.get<ApiResponse<CalendarResponseDto[]>>(`/logs/monthly`,{
        params: { year, month }
    });
    return response.data.data;
};

// 상세 조회
export const getDiaryDetail = async (id: number): Promise<CalendarDetailResponseDto> => {
    const response = await api.get<ApiResponse<CalendarDetailResponseDto>>(`/logs/${id}`);
    return response.data.data;
};

// 일기 삭제(일기 + 분석 삭제)
export const deleteLog = async (id: number): Promise<boolean> => {
    const response = await api.delete<ApiResponse<void>>(`/logs/${id}`);
    return response.data.success;
};

// 이미지 재생성(기록 내용으로 AI만 재생성)
export const regenerateImage = async (id: number): Promise<CalendarDetailResponseDto> => {
    const response = await api.post<ApiResponse<CalendarDetailResponseDto>>(`/logs/${id}/regenerate`);
    return response.data.data;
};
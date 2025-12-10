// 공통 응답 형식
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string | null;
}
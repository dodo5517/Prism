export interface MoodLogRequestDto {
    date: string;
    content: string;
}

export interface CalendarResponseDto {
    id: number;
    date: string;
    imageUrl: string;
    moodScore: number;
}

export interface CalendarDetailResponseDto {
    id: number;
    date: string;
    keywords: string[];
    imageUrl: string | null;
    content: string;
    moodScore: number;
}

package dodo.springboot.prismbackend.mood.dto;

import java.time.LocalDate;

public record CalendarResponseDto(
        Long id,
        LocalDate date,      // 날짜
        String imageUrl,     // 썸네일
        Integer moodScore   // 감정 점수
) {}

package dodo.springboot.prismbackend.mood.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CalendarDetailResponseDto(
        Long id,
        LocalDate date,
        List<String> keywords,
        String imageUrl,
        String content,
        Integer moodScore
) {
}

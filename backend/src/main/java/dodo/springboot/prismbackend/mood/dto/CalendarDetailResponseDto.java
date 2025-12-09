package dodo.springboot.prismbackend.mood.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CalendarDetailResponseDto(
        Long id,
        LocalDate date,
        List<String> keyword,
        String imageUrl,
        String content
) {
}

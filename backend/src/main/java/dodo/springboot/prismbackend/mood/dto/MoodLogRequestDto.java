package dodo.springboot.prismbackend.mood.dto;

import java.time.LocalDate;

public record MoodLogRequestDto(
        LocalDate date,
        String content
) {}
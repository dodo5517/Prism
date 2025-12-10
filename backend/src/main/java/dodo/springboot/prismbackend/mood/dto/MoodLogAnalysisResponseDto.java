package dodo.springboot.prismbackend.mood.dto;

import java.util.List;

public record MoodLogAnalysisResponseDto(
        Long logId,
        List<String> keywords,
        String representativeMood
) {
}

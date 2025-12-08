package dodo.springboot.prismbackend.mood.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record AiAnalysisResult(
        @JsonProperty("representative_mood") String representativeMood,
        @JsonProperty("mood_score") Integer moodScore,
        List<String> keywords,
        @JsonProperty("image_prompt") String imagePrompt
) {}
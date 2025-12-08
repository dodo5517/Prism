package dodo.springboot.prismbackend.mood.service;

import dodo.springboot.prismbackend.mood.dto.AiAnalysisResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${spring.gemini.api-key}")
    private String apiKey;
    private final WebClient.Builder webClientBuilder;

    public AiAnalysisResult analyzeMood(String diaryContent, String userCharacter) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.error("GEMINI_API_KEY가 설정되지 않았습니다! .env 파일을 확인하세요.");
            return new AiAnalysisResult("설정 오류", 0, List.of(), "API Key Missing");
        } else {
            log.info("Gemini API Key 로드됨: {}...", apiKey.substring(0, Math.min(apiKey.length(), 5)));
        }
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        // 이미지 묘사 표현 프롬프트
        String prompt = """
            You are a Visual Prompt Engineer for a "Daily Diary Illustration" app.
            
            **Input:** Diary: "%s" / Character: "%s"
            
            **CHARACTER:** Convert to "handmade clay [character]"
            
            **STYLE:** Handmade clay figure, stop-motion animation style, slightly imperfect, visible fingerprint texture, wobbly handcrafted charm, warm muted pastel colors, simple soft background, single character only, Aardman animation style.
            
            **EMOTION:**
            - 0-39: sad droopy eyes, frown, tear drop, dark cloud above
            - 40-69: calm eyes, small smile
            - 70-100: happy curved eyes, big smile, hearts around
            
            **PROP (CRITICAL - MUST INCLUDE 1):**
            - Extract main object/food from diary
            - ALWAYS include at least 1 prop that explains the situation
            - Translate Korean items to simple English visual description
            - Describe the SHAPE and APPEARANCE, not the name
            - Food examples: 붕어빵→"fish-shaped bread pastry", 마라탕→"bowl of spicy red soup with noodles", 떡볶이→"bowl of red sauce rice cakes", 빙수→"shaved ice in bowl"
            - Activity examples: 공부/시험→book/pencil, 야근/일→laptop/coffee, 운동→dumbbell, 게임→controller, TV/넷플→TV/remote, 카페→coffee cup, 감기→thermometer/tissue
            - If no clear match→extract main noun from diary and describe it
            
            **OUTPUT (JSON only):**
            {
              "representative_mood": "Korean word",
              "mood_score": 0-100,
              "keywords": ["context", "emotion", "action"],
              "image_prompt": "handmade clay figure, stop-motion style, single character only, one clay [CHARACTER], [expression], [pose], holding/next to [PROP - MUST INCLUDE, described in English], warm muted pastel colors, simple background, Aardman style. Negative prompt: realistic, photograph, anime, perfect, smooth, multiple characters, complex background"
            }
            
            **EXAMPLE:**
            Diary: "붕어빵 먹음" / Character: "dog"
            {"representative_mood":"만족","mood_score":75,"keywords":["붕어빵","간식","행복"],"image_prompt":"handmade clay figure, stop-motion style, single character only, one clay dog with happy curved eyes and big smile, holding small fish-shaped bread pastry, warm muted pastel colors, simple beige background, Aardman style. Negative prompt: realistic, photograph, anime, perfect, smooth, multiple characters, complex background"}
            """.formatted(diaryContent, userCharacter);

        try {
            String response = webClientBuilder.build().post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Gemini response: {}", response);
            return parseGeminiResponse(response);
        } catch (Exception e) {
            log.error("Gemini Error", e);
            // 에러 시 기본값 리턴 (중단 방지)
            return new AiAnalysisResult("분석 불가", 0, List.of(), "A peaceful landscape painting");
        }
    }

    private AiAnalysisResult parseGeminiResponse(String rawResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(rawResponse);
            String jsonText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

            if (jsonText.startsWith("```json")) jsonText = jsonText.substring(7);
            if (jsonText.endsWith("```")) jsonText = jsonText.substring(0, jsonText.length() - 3);

            return mapper.readValue(jsonText, AiAnalysisResult.class);
        } catch (Exception e) {
            return new AiAnalysisResult("파싱 에러", 0, List.of(), "A abstract painting of emotions");
        }
    }
}
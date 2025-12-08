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
            
            **CHARACTER:** Convert to "handmade clay [character]" (e.g., human→"handmade clay person", 여자→"handmade clay girl", dog→"handmade clay dog", unknown→"handmade clay [input]")
            
            **STYLE:** Handmade clay figure, stop-motion animation style (like Aardman, Wallace and Gromit, Coraline), slightly imperfect and asymmetrical features, visible fingerprint textures on clay, wobbly handcrafted charm, chibi proportions (big head, small body), warm muted pastel colors, simple soft background, single centered character.
            
            **EMOTION:**
            - 0-39: sad droopy eyes, frown, tear drop, dark cloud above
            - 40-69: calm dot eyes, small smile
            - 70-100: happy curved eyes, big smile, hearts/sparkles around
            
            **PROP (MUST INCLUDE 1):** 감기→thermometer/tissue, 공부/시험→book/pencil, 야근/일→laptop/coffee, 운동→dumbbell, 음식/치킨/맛집→plate with food, 게임→controller, TV/넷플→TV/remote, 카페→coffee cup. No match→extract main noun.
            
            **OUTPUT (JSON only):**
            {
              "representative_mood": "Korean word",
              "mood_score": 0-100,
              "keywords": ["context", "emotion", "action"],
              "image_prompt": "handmade clay figure, stop-motion animation style, single character only, one [CHARACTER] with big head small body, slightly asymmetrical features, visible fingerprint texture, [expression], [pose], [PROP as handmade clay object], warm muted pastel colors, soft simple background, wobbly handcrafted charm, Aardman animation style. Negative prompt: realistic, photograph, anime, perfect, symmetrical, smooth, digital, polished, complex background, multiple characters, two characters, group, duo, crowd"
            }
            
            **EXAMPLE:**
            Diary: "치킨 시켜먹음 존맛" / Character: "human"
            {"representative_mood":"행복","mood_score":88,"keywords":["치킨","맛있음","만족"],"image_prompt":"handmade clay figure, stop-motion animation style, clay person with big head small body, slightly asymmetrical face, visible fingerprint texture on surface, happy curved eyes and big wonky smile, sitting holding clay fried chicken piece, plate of clay chicken in front, small clay hearts floating, warm muted pastel colors, soft beige background, wobbly handcrafted charm, Aardman animation style. Negative prompt: realistic, photograph, anime, perfect, symmetrical, smooth, digital, polished, complex background, multiple characters"}
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
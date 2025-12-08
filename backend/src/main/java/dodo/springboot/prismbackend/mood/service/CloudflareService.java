package dodo.springboot.prismbackend.mood.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudflareService {

    @Value("${spring.cloudflare.account-id}")
    private String accountId;

    @Value("${spring.cloudflare.api-token}")
    private String apiToken;

    private final WebClient.Builder webClientBuilder;

    // Cloudflare에서 제공하는 Stable Diffusion XL 모델
    // (더 빠른 속도를 원하시면 "@cf/bytedance/stable-diffusion-xl-lightning" 모델로 바꿔도 됩니다)
    private static final String MODEL_ID = "@cf/stabilityai/stable-diffusion-xl-base-1.0";

    public byte[] generateImage(String prompt) {
        String url = "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/ai/run/" + MODEL_ID;

        try {
            // 버퍼 사이즈 제한 16MB로 늘림(사진 받기 위해서)
            WebClient webClient = webClientBuilder
                    .exchangeStrategies(ExchangeStrategies.builder()
                            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024)) // 16MB
                            .build())
                    .build();
            // Cloudflare는 입력으로 JSON {"prompt": "..."} 을 받습니다.
            String requestBody = "{\"prompt\": \"" + prompt + "\"}";

            return webClientBuilder.build()
                    .post()
                    .uri(url)
                    .header("Authorization", "Bearer " + apiToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(byte[].class) // 이미지를 바이너리(byte[])로 바로 줍니다.
                    .block();

        } catch (Exception e) {
            log.error("Cloudflare AI 이미지 생성 실패", e);
            return null;
        }
    }
}
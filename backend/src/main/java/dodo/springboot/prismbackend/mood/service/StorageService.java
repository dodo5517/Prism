package dodo.springboot.prismbackend.mood.service;

import dodo.springboot.prismbackend.global.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

    @Value("${spring.supabase.bucket-name}")
    private String supabaseBucketName;
    @Value("${spring.supabase.url}")
    private String supabaseUrl;
    @Value("${spring.supabase.key}")
    private String supabaseKey;

    private final WebClient.Builder webClientBuilder;
    private final ImageUtil imageUtil;

    public String uploadImage(byte[] originalImageBytes, String filename) {
        // 이미지 리사이징 (500px, JPG로 변환)
        byte[] resizedImageBytes = imageUtil.resizeImage(originalImageBytes);
        if (resizedImageBytes == null) {
            log.error("리사이징 실패로 업로드 중단");
            return null;
        }
        // 파일명 확장자 변경 (.png -> .jpg)
        String jpgFilename = filename.replace(".png", ".jpg");

        // 공개 url 생성
        String url = supabaseUrl + "/storage/v1/object/" + supabaseBucketName + "/" + jpgFilename;
        try {
            webClientBuilder.build().post()
                    .uri(url)
                    .header("Authorization", "Bearer " + supabaseKey)
                    // Cloudflare는 기본 PNG로 줌. 하지만 JPEG로 저장해도 무관
                    .contentType(MediaType.IMAGE_JPEG)
                    // 리사이징한 데이터 보냄
                    .bodyValue(resizedImageBytes)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // 업로드 성공 후 공개 URL 리턴
            return url;
        } catch (Exception e) {
            log.error("Storage Upload Error", e);
            return null;
        }
    }
}
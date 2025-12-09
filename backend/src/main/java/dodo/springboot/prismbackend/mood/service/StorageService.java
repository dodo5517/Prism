package dodo.springboot.prismbackend.mood.service;

import dodo.springboot.prismbackend.global.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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

    // 이미지 업로드
    public String uploadImage(byte[] originalImageBytes, String filename) {
        // 이미지 리사이징 (500px, JPG로 변환)
        byte[] resizedImageBytes = imageUtil.resizeImage(originalImageBytes);
        if (resizedImageBytes == null) {
            log.error("리사이징 실패로 업로드 중단");
            return null;
        }
        // 날짜(타임스탬프) 생성
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

        // 모든 확장자 제거
        String baseName = filename.replaceAll("\\.\\w+$", "");
        // 날짜 붙이고 확장자는 .jpg로
        String jpgFilename = timestamp + "_" + baseName + ".jpg";

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

    // 이미지 삭제
    public boolean deleteStorageImage(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return false;
        }

        // URL에서 파일명 추출
        String filename = extractFilenameFromUrl(fileUrl);
        if (filename == null) {
            log.warn("파일명 추출 실패: {}", fileUrl);
            return false;
        }

        // 삭제 요청 URL 생성
        String deleteUrl = supabaseUrl + "/storage/v1/object/" + supabaseBucketName + "/" + filename;

        try {
            webClientBuilder.build().delete()
                    .uri(deleteUrl)
                    .header("Authorization", "Bearer " + supabaseKey)
                    .retrieve()
                    .toBodilessEntity() 
                    .block();

            log.info("이미지 삭제 성공: {}", filename);
            return true;

        } catch (Exception e) {
            log.error("Storage Delete Error (파일: {})", filename, e);
            // 실무 팁: 스토리지는 실패해도 DB 삭제는 진행할지, 롤백할지 정책 결정 필요
            // 여기서는 false를 반환하여 호출 측에서 알 수 있게 함
            return false;
        }
    }

    // URL에서 파일명만 걸러내는 유틸리티 메서드
    private String extractFilenameFromUrl(String url) {
        try {
            // URL 디코딩 (한글 경우 대비)
            String decodedUrl = URLDecoder.decode(url, StandardCharsets.UTF_8);
            String splitKey = "/object/" + supabaseBucketName + "/";
            int index = decodedUrl.indexOf(splitKey);

            if (index == -1) {
                return null;
            }
            return decodedUrl.substring(index + splitKey.length());
        } catch (Exception e) {
            log.error("URL 파싱 에러", e);
            return null;
        }
    }
}
package dodo.springboot.prismbackend.global.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Slf4j
@Component
public class ImageUtil {

    // 달력 썸네일용으로 500px
    private static final int TARGET_WIDTH = 500;

    // 원본 이미지(byte[])를 받아서, 너비 500px로 줄인 새 이미지(byte[])를 리턴
    public byte[] resizeImage(byte[] originalImageBytes) {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(originalImageBytes);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            // 바이트 배열 -> 이미지 객체로 읽기
            BufferedImage originalImage = ImageIO.read(bais);
            if (originalImage == null) {
                log.error("이미지 데이터를 읽을 수 없습니다.");
                return null;
            }

            // 새 크기 계산 (너비 500px 기준, 비율 유지)
            int originalWidth = originalImage.getWidth();
            int originalHeight = originalImage.getHeight();
            int newHeight = (originalHeight * TARGET_WIDTH) / originalWidth;

            // 리사이징된 빈 이미지(캔버스) 생성
            Image resultingImage = originalImage.getScaledInstance(TARGET_WIDTH, newHeight, Image.SCALE_SMOOTH);
            BufferedImage outputImage = new BufferedImage(TARGET_WIDTH, newHeight, BufferedImage.TYPE_INT_RGB);

            // 캔버스에 그림 그리기
            Graphics2D graphics2D = outputImage.createGraphics();
            graphics2D.drawImage(resultingImage, 0, 0, null);
            graphics2D.dispose();

            // 이미지 객체 -> 바이트 배열로 변환 (JPEG 포맷 사용-용량 더 작음)
            ImageIO.write(outputImage, "jpg", baos);
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("이미지 리사이징 실패", e);
            return null;
        }
    }
}
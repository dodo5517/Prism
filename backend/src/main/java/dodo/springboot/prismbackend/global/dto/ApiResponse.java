package dodo.springboot.prismbackend.global.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private String status;  // "success" or "error"
    private String message; // 에러 메시지 (성공 시 null)
    private T data;         // 실제 데이터

    // 성공 (데이터 있음)
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("success", null, data);
    }

    // 성공 (데이터 없음 - 예: 저장 완료)
    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>("success", null, null);
    }

    // 실패
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>("error", message, null);
    }
}
package dodo.springboot.prismbackend.auth.controller;

import dodo.springboot.prismbackend.auth.dto.TokenResponseDto;
import dodo.springboot.prismbackend.auth.service.AuthService;
import dodo.springboot.prismbackend.global.util.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieUtil cookieUtil;

    @GetMapping("/guest")
    public ResponseEntity<?> guestLogin(HttpServletResponse response) {
        // 토근 생성
        TokenResponseDto tokenDto = authService.loginOrSignup(
                "guest@prism.com", "체험용 계정", "guest", "guest_1234"
        );

        // 쿠키 설정
        ResponseCookie cookie = cookieUtil.createRefreshTokenCookie(tokenDto.refreshToken());
        response.addHeader("Set-Cookie", cookie.toString());

        return ResponseEntity.ok(Map.of(
                "accessToken", tokenDto.accessToken(),
                "nickname", tokenDto.nickname()
        ));
    }
}
package dodo.springboot.prismbackend.auth.controller;

import dodo.springboot.prismbackend.auth.entity.RefreshToken;
import dodo.springboot.prismbackend.auth.jwt.JwtUtil;
import dodo.springboot.prismbackend.auth.repository.RefreshTokenRepository;
import dodo.springboot.prismbackend.user.entity.Role;
import dodo.springboot.prismbackend.user.entity.User;
import dodo.springboot.prismbackend.user.repository.UserRepository;
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

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @GetMapping("/guest")
    public ResponseEntity<?> guestLogin(HttpServletResponse response) {
        // 게스트용 이메일
        String guestEmail = "guest@prism.com";
        // DB에 게스트 유저가 없으면 생성, 있으면 조회
        User guestUser = userRepository.findByEmail(guestEmail)
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(guestEmail)
                        .nickname("체험용 계정")
                        .role(Role.USER)
                        .provider("guest")
                        .providerId("guest_1234")
                        .build()));

        // 토큰 발급
        String accessToken = jwtUtil.createAccessToken(guestUser.getId(), guestUser.getEmail());
        String refreshToken = jwtUtil.createRefreshToken(guestUser.getId());

        // refreshToken DB에 저장 (기존 거 있으면 업데이트, 없으면 생성)
        refreshTokenRepository.findByUserId(guestUser.getId())
                .ifPresentOrElse(
                        token -> {
                            token.updateToken(refreshToken);
                            refreshTokenRepository.save(token);
                        },
                        () -> refreshTokenRepository.save(new RefreshToken(guestUser.getId(), refreshToken))
                );

        // refreshToken 쿠키 생성 및 설정
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(60 * 60 * 24 * 7)
                .sameSite("Lax")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        // 토큰 리턴 (JSON 형식)
        return ResponseEntity.ok(Map.of(
                "accessToken", accessToken,
                "nickname", guestUser.getNickname()
        ));
    }
}
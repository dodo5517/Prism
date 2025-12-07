package dodo.springboot.prismbackend.auth.handler;

import dodo.springboot.prismbackend.auth.entity.RefreshToken;
import dodo.springboot.prismbackend.auth.jwt.JwtUtil;
import dodo.springboot.prismbackend.auth.repository.RefreshTokenRepository;
import dodo.springboot.prismbackend.user.entity.Role;
import dodo.springboot.prismbackend.user.entity.User;
import dodo.springboot.prismbackend.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // 구글 유저 정보 추출
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        // 구글은 sub이 고유 ID
        String providerId = (String) attributes.get("sub");

        // 유저 확인 (있으면 로그인, 없으면 회원가입)
        User user = userRepository.findByEmail(email)
                .map(entity -> entity.update(name)) // 닉네임 변경시 업데이트
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .nickname(name)
                            .role(Role.USER)
                            .provider("google")
                            .providerId(providerId)
                            .build();
                    return userRepository.save(newUser);
                });

        // jwt 토큰 생성
        String accessToken = jwtUtil.createAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtUtil.createRefreshToken(user.getId());

        // refreshToken DB에 저장 (기존 거 있으면 업데이트, 없으면 생성)
        refreshTokenRepository.findByUserId(user.getId())
                .ifPresentOrElse(
                        token -> {
                            token.updateToken(refreshToken);
                            refreshTokenRepository.save(token);
                        },
                        () -> refreshTokenRepository.save(new RefreshToken(user.getId(), refreshToken))
                );

        // refreshToken HTTP-only 쿠키로 생성
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)  // 자바스크립트 접근 불가 (XSS 방지)
                .secure(true)    // HTTPS에서만 전송 (localhost에서는 허용됨)
                .path("/")       // 모든 경로에서 쿠키 전송
                .maxAge(60 * 60 * 24 * 7) // 7일
                .sameSite("Lax") // CSRF 방지
                .build();

        // 응답 헤더에 쿠키 추가
        response.addHeader("Set-Cookie", cookie.toString());

        // 프론트엔드에 accessToken 달아서 리다이렉트
        String targetUrl = "http://localhost:3000/auth/callback?token=" + accessToken;

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
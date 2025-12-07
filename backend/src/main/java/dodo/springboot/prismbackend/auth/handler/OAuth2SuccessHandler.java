package dodo.springboot.prismbackend.auth.handler;

import dodo.springboot.prismbackend.auth.dto.TokenResponseDto;
import dodo.springboot.prismbackend.auth.service.AuthService;
import dodo.springboot.prismbackend.global.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final CookieUtil cookieUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // 데이터 추출
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getAttribute("sub");

        // 서비스 호출 (모든 비즈니스 로직 위임)
        TokenResponseDto tokenDto = authService.loginOrSignup(email, name, "google", providerId);

        // 쿠키 설정
        ResponseCookie cookie = cookieUtil.createRefreshTokenCookie(tokenDto.refreshToken());
        response.addHeader("Set-Cookie", cookie.toString());

        // 프론트로 리다이렉트
        String targetUrl = "http://localhost:3000/auth/callback?token=" + tokenDto.accessToken();
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
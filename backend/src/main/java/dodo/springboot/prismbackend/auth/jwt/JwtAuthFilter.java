package dodo.springboot.prismbackend.auth.jwt;

import dodo.springboot.prismbackend.user.entity.Role;
import dodo.springboot.prismbackend.user.entity.User;
import dodo.springboot.prismbackend.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${spring.jwt.secret}")
    private String secretKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 헤더에서 토큰 꺼내기
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // "Bearer " 제거

            try {
                // accessToken 검증 및 파싱
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(secretKey.getBytes(StandardCharsets.UTF_8))
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String userIdStr = claims.getSubject();
                String email = claims.get("email", String.class);

                // 토큰에서 role 꺼내기
                String role = claims.get("role", String.class);

                // 없으면 기본값(ROLE_USER) 설정
                if (role == null) {
                    role = "ROLE_USER";
                }

                Long userId = Long.parseLong(userIdStr);

                // 토큰에 있던 권한 넣어주기
                Authentication auth = new UsernamePasswordAuthenticationToken(
                        userId, // Principal
                        null,   // Credentials (보통 비밀번호, 인증된 상태라 null)
                        Collections.singletonList(new SimpleGrantedAuthority(role)) // 진짜 권한
                );
                // SecurityContext에 등록
                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception e) {
                // 토큰이 위조/만료된 경우
                // SecurityConfig가 401 던짐
                logger.error("JWT 검증 실패: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
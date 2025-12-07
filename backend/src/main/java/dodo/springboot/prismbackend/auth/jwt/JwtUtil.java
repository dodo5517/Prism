package dodo.springboot.prismbackend.auth.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key;
    private final long accessTokenValidity = 1000L * 60 * 60 * 24; // 24시간

    public JwtUtil(@Value("${spring.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // accessToken 생성 (userId, email 담음)
    public String createAccessToken(Long userId, String email, String role) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId)) // Subject에 ID 저장
                .claim("email", email) // Claim에 이메일 저장
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenValidity))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // RefreshToken 생성 (userId 담음)
    public String createRefreshToken(Long userId) {
        long refreshTokenValidity = 1000L * 60 * 60 * 24 * 7; // 7일

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenValidity))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
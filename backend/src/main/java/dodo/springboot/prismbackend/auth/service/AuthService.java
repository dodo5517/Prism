package dodo.springboot.prismbackend.auth.service;

import dodo.springboot.prismbackend.auth.dto.TokenResponseDto;
import dodo.springboot.prismbackend.auth.entity.RefreshToken;
import dodo.springboot.prismbackend.auth.jwt.JwtUtil;
import dodo.springboot.prismbackend.auth.repository.RefreshTokenRepository;
import dodo.springboot.prismbackend.user.entity.Role;
import dodo.springboot.prismbackend.user.entity.User;
import dodo.springboot.prismbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    // 소셜 로그인
    @Transactional
    public TokenResponseDto loginOrSignup(String email, String nickname, String provider, String providerId) {

        // 유저 찾기 or 저장 (회원가입)
        User user = userRepository.findByEmail(email)
                .map(entity -> entity.update(nickname)) // 닉네임 변경 시 업데이트
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .nickname(nickname)
                            .role(Role.USER)
                            .provider(provider)
                            .providerId(providerId)
                            .build();
                    return userRepository.save(newUser);
                });

        // 토큰 발급
        String accessToken = jwtUtil.createAccessToken(user.getId(), user.getEmail(), user.getRole().getKey());
        String refreshToken = jwtUtil.createRefreshToken(user.getId());

        // refreshToken DB 저장/업데이트
        refreshTokenRepository.findByUserId(user.getId())
                .ifPresentOrElse(
                        token -> token.updateToken(refreshToken), // Dirty Checking으로 자동 저장
                        () -> refreshTokenRepository.save(new RefreshToken(user.getId(), refreshToken))
                );

        // 토큰과 닉네임 응답
        return new TokenResponseDto(accessToken, refreshToken, user.getNickname());
    }
}
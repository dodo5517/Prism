package dodo.springboot.prismbackend.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users") // 테이블 이름 지정
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email; // 구글 이메일

    @Column(nullable = false)
    private String nickname; // 구글 이름

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // USER or ADMIN

    private String provider; // "google"
    private String providerId; // 구글 고유 ID

    private LocalDateTime createdAt;

    @Builder
    public User(String email, String nickname, Role role, String provider, String providerId) {
        this.email = email;
        this.nickname = nickname;
        this.role = role;
        this.provider = provider;
        this.providerId = providerId;
        this.createdAt = LocalDateTime.now();
    }

    // 소셜 로그인 시 닉네임 등이 바뀌었을 때 업데이트하는 메소드
    public User update(String nickname) {
        this.nickname = nickname;
        return this;
    }
}
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

    @Column(columnDefinition = "TEXT")
    private String characterDescription = "Golden Hamster"; // 본인 캐릭터

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

    // 로그인 시 닉네임이 바뀌었을 때 업데이트 메소드
    public User update(String nickname) {
        this.nickname = nickname;
        return this;
    }

    // 캐릭터 설정 바뀌면 업데이트 메소드
    public void updateCharacter(String description) {
        this.characterDescription = description;
    }
}
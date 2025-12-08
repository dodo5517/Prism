package dodo.springboot.prismbackend.auth.entity;

import dodo.springboot.prismbackend.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String token;

    @Builder
    public RefreshToken(User user, String token) {
        this.user = user;
        this.token = token;
    }

    // 토큰 교체 (로그인 할 때마다 업데이트)
    public RefreshToken updateToken(String token) {
        this.token = token;
        return this;
    }
}
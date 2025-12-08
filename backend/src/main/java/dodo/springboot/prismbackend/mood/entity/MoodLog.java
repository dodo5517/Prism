package dodo.springboot.prismbackend.mood.entity;

import dodo.springboot.prismbackend.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "mood_logs")
public class MoodLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate logDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Builder
    public MoodLog(User user, LocalDate logDate, String content) {
        this.user = user;
        this.logDate = logDate;
        this.content = content;
    }
}
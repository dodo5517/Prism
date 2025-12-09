package dodo.springboot.prismbackend.mood.entity;

import dodo.springboot.prismbackend.global.entity.BaseTimeEntity;
import dodo.springboot.prismbackend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "mood_logs")
public class MoodLog extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate logDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @OneToOne(mappedBy = "moodLog", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private MoodAnalysis moodAnalysis;

    @Builder
    public MoodLog(User user, LocalDate logDate, String content, MoodAnalysis moodAnalysis) {
        this.user = user;
        this.logDate = logDate;
        this.content = content;
        this.moodAnalysis = moodAnalysis;
    }
}
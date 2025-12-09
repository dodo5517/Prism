package dodo.springboot.prismbackend.mood.entity;

import dodo.springboot.prismbackend.global.entity.BaseTimeEntity;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "mood_analysis")
public class MoodAnalysis extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mood_log_id", nullable = false, unique = true)
    private MoodLog moodLog;

    private String representativeMood;
    private Integer moodScore;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> keywords;

    @Column(columnDefinition = "TEXT")
    private String imagePrompt; // 이미지 묘사 표현 지시문 (영어로)

    @Column(columnDefinition = "TEXT")
    private String imageUrl;    // 생성된 이미지 주소

    @Builder
    public MoodAnalysis(MoodLog moodLog, String representativeMood, Integer moodScore, List<String> keywords, String imagePrompt, String imageUrl) {
        this.moodLog = moodLog;
        this.representativeMood = representativeMood;
        this.moodScore = moodScore;
        this.keywords = keywords;
        this.imagePrompt = imagePrompt;
        this.imageUrl = imageUrl;
    }
}
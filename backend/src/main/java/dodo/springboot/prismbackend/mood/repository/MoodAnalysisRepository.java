package dodo.springboot.prismbackend.mood.repository;

import dodo.springboot.prismbackend.mood.dto.KeywordStatisticsDto;
import dodo.springboot.prismbackend.mood.dto.MoodStatisticsDto;
import dodo.springboot.prismbackend.mood.entity.MoodAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MoodAnalysisRepository extends JpaRepository<MoodAnalysis, Long> {

    // 해당 기간의 Top3 키워드 조회 쿼리(공동 등수 포함)
    @Query(value = """
    SELECT 
        sub.count AS count,
        -- 같은 count를 가진 키워드들을 쉼표(,)로 합침.
        STRING_AGG(sub.keyword, ', ' ORDER BY sub.keyword) AS keywords
    FROM (
        SELECT
            T.keyword AS keyword,
            COUNT(T.keyword) AS count,
            -- COUNT 기준으로 공동 순위를 매김
            DENSE_RANK() OVER (ORDER BY COUNT(T.keyword) DESC) as ranking
        FROM mood_analysis ma
        JOIN mood_logs ml ON ma.mood_log_id = ml.id
        CROSS JOIN LATERAL unnest(ma.keywords) AS T(keyword)
        WHERE ml.log_date BETWEEN :startDate AND :endDate
        GROUP BY T.keyword
    ) sub
    WHERE sub.ranking <= 3
    -- 등수별로 그룹화
    GROUP BY sub.count, sub.ranking
    ORDER BY sub.ranking ASC
""", nativeQuery = true)
    List<KeywordStatisticsDto> findTopKeywordsByPeriod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 감정 추이 통계 조회 쿼리
    @Query(value = """
        SELECT
            TO_CHAR(ml.log_date, 'YYYY-MM') AS period,
            ROUND(AVG(ma.mood_score), 1) AS averageScore
        FROM mood_analysis ma
        JOIN mood_logs ml ON ma.mood_log_id = ml.id
        WHERE ml.log_date BETWEEN :startDate AND :endDate
        GROUP BY period
        ORDER BY period ASC
    """, nativeQuery = true)
    List<MoodStatisticsDto> findMoodTrendByPeriod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}

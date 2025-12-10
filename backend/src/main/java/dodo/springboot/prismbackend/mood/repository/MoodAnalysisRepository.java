package dodo.springboot.prismbackend.mood.repository;

import dodo.springboot.prismbackend.mood.dto.KeywordStatisticsDto;
import dodo.springboot.prismbackend.mood.entity.MoodAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MoodAnalysisRepository extends JpaRepository<MoodAnalysis, Long> {

    // 해당 기간의 Top3 키워드 조회 쿼리
    @Query(value = """
        SELECT
            T.keyword AS keyword,
            COUNT(T.keyword) AS count
        FROM mood_analysis ma
        JOIN mood_logs ml ON ma.mood_log_id = ml.id
        -- unnest 함수 (PostgreSQL 배열(text[])을 행으로 풀어줌)
        -- CROSS JOIN LATERAL을 사용하여 각 행의 배열을 펼침
        CROSS JOIN LATERAL unnest(ma.keywords) AS T(keyword)
        WHERE ml.log_date BETWEEN :startDate AND :endDate
        GROUP BY T.keyword
        ORDER BY count DESC
        LIMIT 3
    """, nativeQuery = true)
    List<KeywordStatisticsDto> findTopKeywordsByUserIdAndPeriod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}

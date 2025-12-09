package dodo.springboot.prismbackend.mood.repository;

import dodo.springboot.prismbackend.mood.dto.CalendarResponseDto;
import dodo.springboot.prismbackend.mood.entity.MoodLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CalendarRepository extends JpaRepository<MoodLog, Long> {
    // 캘린더 목록 조회
    @Query("SELECT new dodo.springboot.prismbackend.mood.dto.CalendarResponseDto(" +
            "  m.id, m.logDate, a.imageUrl, a.moodScore" + ") " +
            "FROM MoodLog m " +
            "LEFT JOIN m.moodAnalysis a " +
            "WHERE m.logDate BETWEEN :startDate AND :endDate " +
            "AND m.user.id = :userId")
    List<CalendarResponseDto> findAllByDateRangeAndUser_Id(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("userId") Long userId
    );

    Optional<MoodLog> findByIdAndUser_Id(Long id, Long userId);
}

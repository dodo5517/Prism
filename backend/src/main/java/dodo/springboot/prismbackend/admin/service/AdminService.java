package dodo.springboot.prismbackend.admin.service;

import dodo.springboot.prismbackend.mood.dto.KeywordStatisticsDto;
import dodo.springboot.prismbackend.mood.dto.MoodStatisticsDto;
import dodo.springboot.prismbackend.mood.repository.MoodAnalysisRepository;
import dodo.springboot.prismbackend.user.entity.User;
import dodo.springboot.prismbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final MoodAnalysisRepository moodAnalysisRepository;
    private final UserRepository userRepository;

    // 해당 기간의 Top3 키워드 조회
    public List<KeywordStatisticsDto> getTopKeywords(Long userId, Integer year, Integer month) {
        User user = userRepository.findByIdAndAdmin(userId)
                .orElseThrow(() -> new IllegalArgumentException("관리자 권한이 없습니다."));
        if (user == null) {
            throw new IllegalStateException("관리자 권한이 없습니다.");
        }

        LocalDate startDate;
        LocalDate endDate;

        if (year == null || year == 0) {
            // 년도 필터가 없으면 2000년부터
            startDate = LocalDate.of(2000, 1, 1);
            endDate = LocalDate.now().plusDays(1); // 오늘 포함

        } else if (month == null || month == 0) {
            // 년도만 필터링 (해당 년도의 시작일과 종료일)
            startDate = LocalDate.of(year, 1, 1);
            endDate = LocalDate.of(year, 12, 31);
        } else {
            // 년도와 월 모두 필터링 (해당 월의 시작일과 종료일)
            YearMonth ym = YearMonth.of(year, month);
            startDate = ym.atDay(1);
            endDate = ym.atEndOfMonth();
        }
        return moodAnalysisRepository.findTopKeywordsByPeriod(startDate, endDate);
    }

    // 연도별 감정 추이 통계
    public List<MoodStatisticsDto> getMoodTrend(Long userId, Integer year) {
        User user = userRepository.findByIdAndAdmin(userId)
                .orElseThrow(() -> new IllegalArgumentException("관리자 권한이 없습니다."));
        if (user == null) {
            throw new IllegalStateException("관리자 권한이 없습니다.");
        }

        // 년도 없으면 올해 데이터를 기본으로 보여줍니다.
        int targetYear = (year == null || year == 0) ? LocalDate.now().getYear() : year;

        LocalDate startDate = LocalDate.of(targetYear, 1, 1);
        LocalDate endDate = LocalDate.of(targetYear, 12, 31);

        return moodAnalysisRepository.findMoodTrendByPeriod(startDate, endDate);
    }
}
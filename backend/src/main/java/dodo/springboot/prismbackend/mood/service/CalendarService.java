package dodo.springboot.prismbackend.mood.service;

import dodo.springboot.prismbackend.mood.dto.CalendarDetailResponseDto;
import dodo.springboot.prismbackend.mood.dto.CalendarResponseDto;
import dodo.springboot.prismbackend.mood.entity.MoodAnalysis;
import dodo.springboot.prismbackend.mood.entity.MoodLog;
import dodo.springboot.prismbackend.mood.repository.CalendarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalendarService {
    private final CalendarRepository calendarRepository;
    // 목록 조회
    public List<CalendarResponseDto> getCalendarList(int year, int month, Long userId) {
        // 그 달의 시작/끝 날짜 계산
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return calendarRepository.findAllByDateRangeAndUser_Id(startDate, endDate, userId);
    }

    // 상세 조회
    public CalendarDetailResponseDto getMoodLogDetail(Long id, Long userId) {
        // 본인 일기인지 확인
        MoodLog moodLog = calendarRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없거나 접근 권한이 없습니다."));

        MoodAnalysis analysis = moodLog.getMoodAnalysis();

        List<String> mainKeyword = (analysis != null && analysis.getKeywords() != null && !analysis.getKeywords().isEmpty())
                ? analysis.getKeywords()
                : List.of();

        String imageUrl = (analysis != null) ? analysis.getImageUrl() : null;

        return new CalendarDetailResponseDto(
                moodLog.getId(),
                moodLog.getLogDate(),
                mainKeyword,
                imageUrl,
                moodLog.getContent(),
                analysis.getMoodScore()
        );
    }
}

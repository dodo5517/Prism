package dodo.springboot.prismbackend.mood.service;

import dodo.springboot.prismbackend.mood.dto.CalendarDetailResponseDto;
import dodo.springboot.prismbackend.mood.dto.CalendarResponseDto;
import dodo.springboot.prismbackend.mood.dto.MoodLogAnalysisResponseDto;
import dodo.springboot.prismbackend.mood.entity.MoodAnalysis;
import dodo.springboot.prismbackend.mood.entity.MoodLog;
import dodo.springboot.prismbackend.user.entity.User;
import dodo.springboot.prismbackend.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import dodo.springboot.prismbackend.mood.repository.CalendarRepository;
import dodo.springboot.prismbackend.mood.repository.MoodAnalysisRepository;
import dodo.springboot.prismbackend.mood.repository.MoodLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalendarService {
    private final CalendarRepository calendarRepository;
    private final StorageService storageService;
    private final MoodLogService moodLogService;
    private final MoodAnalysisRepository moodAnalysisRepository;
    private final MoodLogRepository moodLogRepository;
    private final UserRepository userRepository;

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
        if (analysis == null || analysis.getImagePrompt() == null) {
            throw new IllegalStateException("분석 데이터가 존재하지 않습니다.");
        }

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

    // 일기 삭제 (이미지 + 데이터)
    @Transactional // 쓰기 작업이므로 트랜잭션 필요
    public boolean deleteLog(Long id, Long userId) {
        // 본인 일기인지 확인
        MoodLog moodLog = calendarRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없거나 접근 권한이 없습니다."));
        MoodAnalysis analysis = moodLog.getMoodAnalysis();

        // 스토리지에서 이미지 파일 삭제
        if (analysis.getImageUrl() != null) {
            storageService.deleteStorageImage(analysis.getImageUrl());
        }

        // DB에서 데이터 삭제
        moodAnalysisRepository.delete(analysis);
        moodLogRepository.delete(moodLog);

        log.info("일기 삭제 완료");
        return true;
    }

    // 이미지 재생성 (기존 이미지 삭제 -> AI 재생성 -> DB 업데이트)
    @Transactional
    public MoodLogAnalysisResponseDto regenerateImage(Long id, Long userId) {
        // 본인 일기인지 확인
        MoodLog moodLog = calendarRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없거나 접근 권한이 없습니다."));
        MoodAnalysis oldAnalysis = moodLog.getMoodAnalysis();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));


        if (moodLog.getMoodAnalysis() != null) {
            // 스토리지에서 이미지 파일 삭제
            storageService.deleteStorageImage(oldAnalysis.getImageUrl());

            // DB에서 analysis 삭제
            moodLog.setMoodAnalysis(null);
            calendarRepository.flush();
        }

        // 새로운 Gemini 분석(프롬프트) 및 결과 저장
        moodLogService.processAiAnalysis(user, moodLog);

        MoodAnalysis newAnalysis = moodLog.getMoodAnalysis();

        // 키워드 리턴
        return new MoodLogAnalysisResponseDto(
                moodLog.getId(),
                newAnalysis.getKeywords(),
                newAnalysis.getRepresentativeMood()
        );
    }
}

package dodo.springboot.prismbackend.mood.controller;

import dodo.springboot.prismbackend.global.dto.ApiResponse;
import dodo.springboot.prismbackend.mood.dto.CalendarDetailResponseDto;
import dodo.springboot.prismbackend.mood.dto.CalendarResponseDto;
import dodo.springboot.prismbackend.mood.dto.MoodLogRequestDto;
import dodo.springboot.prismbackend.mood.service.CalendarService;
import dodo.springboot.prismbackend.mood.service.MoodLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class MoodLogController {

    private final MoodLogService moodLogService;
    private final CalendarService calendarService;

    @PostMapping
    public ApiResponse<Long> createLog(
            @AuthenticationPrincipal Long userId, // JWT 필터가 id 찾아줌.
            @RequestBody MoodLogRequestDto requestDto
    ) {
        Long logId = moodLogService.createMoodLog(userId, requestDto);
        return ApiResponse.success(logId);
    }

    // 달 조회
    @GetMapping("/monthly")
    public ApiResponse<List<CalendarResponseDto>> getCalendarList(
            @AuthenticationPrincipal Long userId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        List<CalendarResponseDto> list = calendarService.getCalendarList(year, month, userId);
        return ApiResponse.success(list);
    }

    // 상세 조회 (모달용, Content 포함)
    @GetMapping("/{id}")
    public ApiResponse<CalendarDetailResponseDto> getCalendarDetail(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id
    ) {
        CalendarDetailResponseDto detail = calendarService.getMoodLogDetail(id, userId);
        return ApiResponse.success(detail);
    }

    // 일기 삭제 (이미지 + 데이터)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiary(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id // moodLogId
    ) {
        calendarService.deleteLog(id, userId);
        return ResponseEntity.noContent().build();
    }

    // 이미지 재생성 (본문 유지, AI만 다시 요청)
    @PostMapping("/{id}/regenerate")
    public ApiResponse<Long> regenerateImage(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id // moodLogId
    ) {
        Long logId = calendarService.regenerateImage(id, userId);
        return ApiResponse.success(logId);
    }
}
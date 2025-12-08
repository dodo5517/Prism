package dodo.springboot.prismbackend.mood.controller;

import dodo.springboot.prismbackend.global.dto.ApiResponse;
import dodo.springboot.prismbackend.mood.dto.MoodLogRequestDto;
import dodo.springboot.prismbackend.mood.service.MoodLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class MoodLogController {

    private final MoodLogService moodLogService;

    @PostMapping
    public ApiResponse<Long> createLog(
            @AuthenticationPrincipal Long userId, // JWT 필터가 id 찾아줌.
            @RequestBody MoodLogRequestDto requestDto
    ) {
        Long logId = moodLogService.createMoodLog(userId, requestDto);
        return ApiResponse.success(logId);
    }
}
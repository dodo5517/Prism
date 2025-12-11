package dodo.springboot.prismbackend.admin.controller;

import dodo.springboot.prismbackend.admin.service.AdminService;
import dodo.springboot.prismbackend.global.dto.ApiResponse;
import dodo.springboot.prismbackend.mood.dto.KeywordStatisticsDto;
import dodo.springboot.prismbackend.mood.dto.MoodStatisticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // 키워드 통계 API
    @GetMapping("/stats/keywords")
    public ApiResponse<List<KeywordStatisticsDto>> getKeywordStats(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        List<KeywordStatisticsDto> stats = adminService.getTopKeywords(userId, year, month);
        return ApiResponse.success(stats);
    }

    // 연도별 감정 추이 통계 API
    @GetMapping("/stats/mood")
    public ApiResponse<List<MoodStatisticsDto>> getMoodStats(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) Integer year
    ) {
        List<MoodStatisticsDto> stats = adminService.getMoodTrend(userId, year);
        return ApiResponse.success(stats);
    }
}

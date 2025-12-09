package dodo.springboot.prismbackend.mood.service;

import dodo.springboot.prismbackend.mood.dto.AiAnalysisResult;
import dodo.springboot.prismbackend.mood.dto.MoodLogRequestDto;
import dodo.springboot.prismbackend.mood.entity.MoodAnalysis;
import dodo.springboot.prismbackend.mood.entity.MoodLog;
import dodo.springboot.prismbackend.mood.repository.MoodAnalysisRepository;
import dodo.springboot.prismbackend.mood.repository.MoodLogRepository;
import dodo.springboot.prismbackend.user.entity.User;
import dodo.springboot.prismbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MoodLogService {

    private final MoodLogRepository moodLogRepository;
    private final MoodAnalysisRepository moodAnalysisRepository;
    private final UserRepository userRepository;
    
    private final GeminiService geminiService;
    private final CloudflareService cloudflareService;
    private final StorageService storageService;

    @Transactional
    public Long createMoodLog(Long userId, MoodLogRequestDto requestDto) {
        // 유저 찾기
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));
        // 일기 저장
        MoodLog moodLog = moodLogRepository.save(MoodLog.builder()
                .user(user)
                .logDate(requestDto.date())
                .content(requestDto.content())
                .build());

        // AI 처리 및 결과 저장
        processAiAnalysis(user, moodLog);

        return moodLog.getId();
    }

    // AI 처리 메서드
    @Transactional
    public void processAiAnalysis(User user, MoodLog moodLog) {
        // Gemini 분석 (그림 묘사 프롬프트 생성)
        // 유저의 캐릭터 설정 가져오기
        String userChar = (user.getCharacterDescription() != null && !user.getCharacterDescription().isEmpty())
                ? user.getCharacterDescription() : "dog";
        AiAnalysisResult aiResult = geminiService.analyzeMood(moodLog.getContent(), userChar);

        // Cloudflare 이미지 생성 (byte[])
        byte[] imageBytes = cloudflareService.generateImage(aiResult.imagePrompt());

        // Supabase storage 업로드
        String imageUrl = null;
        if (imageBytes != null) {
            // 일단 .png로 저장 -> StorageService가 .jpg로 바꿈
            String filename = "user_" + user.getId() + "_" + ".png";
            imageUrl = storageService.uploadImage(imageBytes, filename);
        }

        // MoodAnalysis 객체 생성
        MoodAnalysis newAnalysis = MoodAnalysis.builder()
                .moodLog(moodLog)
                .representativeMood(aiResult.representativeMood())
                .moodScore(aiResult.moodScore())
                .keywords(aiResult.keywords())
                .imagePrompt(aiResult.imagePrompt())
                .imageUrl(imageUrl)
                .build();

        // MoodAnalysis 저장
        moodAnalysisRepository.save(newAnalysis);

        // MoodLog에 분석 결과 연결
        moodLog.setMoodAnalysis(newAnalysis);
    }
}
package dodo.springboot.prismbackend.mood.service;

import dodo.springboot.prismbackend.mood.dto.AiAnalysisResult;
import dodo.springboot.prismbackend.mood.dto.MoodLogAnalysisResponseDto;
import dodo.springboot.prismbackend.mood.dto.MoodLogRequestDto;
import dodo.springboot.prismbackend.mood.entity.MoodAnalysis;
import dodo.springboot.prismbackend.mood.entity.MoodLog;
import dodo.springboot.prismbackend.mood.repository.CalendarRepository;
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
    private final CalendarRepository calendarRepository;
    
    private final GeminiService geminiService;
    private final CloudflareService cloudflareService;
    private final StorageService storageService;

    // 일기 저장 및 AI 분석 (이미지 생성 X)
    @Transactional
    public MoodLogAnalysisResponseDto analyzeDiary(Long userId, MoodLogRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        // 일기(MoodLog) 우선 저장
        MoodLog moodLog = moodLogRepository.save(MoodLog.builder()
                .user(user)
                .logDate(requestDto.date())
                .content(requestDto.content())
                .build());

        // Gemini 분석 및 결과 저장
        processAiAnalysis(user, moodLog);

        MoodAnalysis analysis = moodLog.getMoodAnalysis();

        // 키워드 리턴
        return new MoodLogAnalysisResponseDto(
                moodLog.getId(),
                analysis.getKeywords(),
                analysis.getRepresentativeMood()
        );
    }

    // 이미지 생성
    @Transactional
    public Long generateImageForLog(Long logId, Long userId) {
        // 일기 조회 및 본인 확인
        MoodLog moodLog = calendarRepository.findByIdAndUser_Id(logId, userId)
                .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없거나 접근 권한이 없습니다."));
        MoodAnalysis analysis = moodLog.getMoodAnalysis();
        if (analysis == null || analysis.getImagePrompt() == null) {
            throw new IllegalStateException("분석 데이터가 존재하지 않습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        // Cloudflare 이미지 생성
        // 저장된 프롬프트를 사용하여 이미지 생성
        byte[] imageBytes = cloudflareService.generateImage(analysis.getImagePrompt());

        // Supabase storage 업로드
        String imageUrl = null;
        if (imageBytes != null) {
            // 일단 .png로 저장 -> StorageService가 .jpg로 바꿈
            String filename = "user_" + user.getId() + "_" + ".png";
            imageUrl = storageService.uploadImage(imageBytes, filename);
        }

        // DB 업데이트 (Dirty Checking)
        analysis.setImageUrl(imageUrl);

        return moodLog.getId();
    }

    // Gemini 분석 및 결과 저장
    @Transactional
    public void processAiAnalysis(User user, MoodLog moodLog) {
        // 유저의 캐릭터 설정 가져오기
        String userChar = (user.getCharacterDescription() != null && !user.getCharacterDescription().isEmpty())
                ? user.getCharacterDescription() : "dog";
        // GeminiService 호출 (그림 묘사 프롬프트 생성)
        AiAnalysisResult aiResult = geminiService.analyzeMood(moodLog.getContent(), userChar);

        // 분석 결과 저장 (이미지 URL은 null 상태로 저장)
        MoodAnalysis analysis = MoodAnalysis.builder()
                .moodLog(moodLog)
                .representativeMood(aiResult.representativeMood())
                .moodScore(aiResult.moodScore())
                .keywords(aiResult.keywords())
                .imagePrompt(aiResult.imagePrompt()) // 프롬프트는 여기서 미리 저장
                .imageUrl(null) // 아직 이미지 없음
                .build();

        // MoodAnalysis 저장
        moodAnalysisRepository.save(analysis);
        // MoodLog에 분석 결과 연결
        moodLog.setMoodAnalysis(analysis);
    }
}
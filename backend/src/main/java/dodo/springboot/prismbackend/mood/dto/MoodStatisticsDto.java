package dodo.springboot.prismbackend.mood.dto;

public interface MoodStatisticsDto {
    String getPeriod();       // 기간
    Double getAverageScore(); // 점수
}
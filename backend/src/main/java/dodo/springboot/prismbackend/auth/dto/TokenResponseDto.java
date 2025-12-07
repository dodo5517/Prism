package dodo.springboot.prismbackend.auth.dto;

public record TokenResponseDto(String accessToken, String refreshToken, String nickname) {}
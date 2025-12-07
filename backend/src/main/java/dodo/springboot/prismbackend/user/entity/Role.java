package dodo.springboot.prismbackend.user.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {

    // 스프링 시큐리티는 권한 이름 앞에 "ROLE_"이 붙는 것을 좋아합니다.
    USER("ROLE_USER"),
    ADMIN("ROLE_ADMIN");

    private final String key;
}
package dodo.springboot.prismbackend.user.repository;

import dodo.springboot.prismbackend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // 이메일로 유저 찾기
    Optional<User> findByEmail(String email);

    // admin인지 조회
    @Query("""
    select u from User u where u.id = :id and u.role = 'ADMIN'
    """)
    Optional<User> findByIdAndAdmin(Long id);
}
package dodo.springboot.prismbackend.mood.repository;

import dodo.springboot.prismbackend.mood.entity.MoodLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MoodLogRepository extends JpaRepository<MoodLog, Long> {

}

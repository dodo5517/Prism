package dodo.springboot.prismbackend.mood.repository;

import dodo.springboot.prismbackend.mood.entity.MoodAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MoodAnalysisRepository extends JpaRepository<MoodAnalysis, Long> {

}

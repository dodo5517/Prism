package dodo.springboot.prismbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class PrismBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(PrismBackendApplication.class, args);
    }

}

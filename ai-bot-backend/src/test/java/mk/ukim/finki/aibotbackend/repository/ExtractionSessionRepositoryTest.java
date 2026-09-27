package mk.ukim.finki.aibotbackend.repository;

import jakarta.transaction.Transactional;
import mk.ukim.finki.aibotbackend.config.JpaConfig;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionSession;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionTarget;
import mk.ukim.finki.aibotbackend.model.enums.SessionStatus;
import mk.ukim.finki.aibotbackend.model.enums.SocialNetwork;
import mk.ukim.finki.aibotbackend.model.enums.TargetType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(JpaConfig.class)
@Transactional
@Testcontainers
public class ExtractionSessionRepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
        .withDatabaseName("aibot_test")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ExtractionSessionRepository extractionSessionRepository;
    private Long threadsSessionId;

    @BeforeEach
    void setUp() {
        ExtractionSession threads = new ExtractionSession(SocialNetwork.THREADS, "Threads profile");
        threads.getTargets().add(new ExtractionTarget(TargetType.PROFILE, "midkast091", threads));
        threads.getTargets().add(new ExtractionTarget(TargetType.HASHTAG, "македонија", threads));
        threadsSessionId = extractionSessionRepository.save(threads).getId();
        ExtractionSession reddit = new ExtractionSession(SocialNetwork.REDDIT, "Reddit feed");
        reddit.setStatus(SessionStatus.COMPLETED);
        extractionSessionRepository.save(reddit);
    }

    @Test
    void testFindAllByStatus() {
        List<ExtractionSession> created = extractionSessionRepository.findAllByStatus(SessionStatus.CREATED);
        List<ExtractionSession> completed = extractionSessionRepository.findAllByStatus(SessionStatus.COMPLETED);

        assertThat(created).hasSize(1);
        assertThat(created.getFirst().getDescription()).isEqualTo("Threads profile");
        assertThat(completed).hasSize(1);
        assertThat(extractionSessionRepository.findAllByStatus(SessionStatus.FAILED)).isEmpty();
    }

    @Test
    void testFindAllBySocialNetwork() {
        assertThat(extractionSessionRepository.findAllBySocialNetwork(SocialNetwork.THREADS)).hasSize(1);
        assertThat(extractionSessionRepository.findAllBySocialNetwork(SocialNetwork.REDDIT)).hasSize(1);
        assertThat(extractionSessionRepository.findAllBySocialNetwork(SocialNetwork.TIKTOK)).isEmpty();
    }

    @Test
    void testFindByIdLoadsTheTargets() {
        Optional<ExtractionSession> result = extractionSessionRepository.findById(threadsSessionId);

        assertThat(result).isPresent();
        assertThat(result.get().getTargets()).hasSize(2);
        assertThat(result.get().getTargets())
                .extracting(ExtractionTarget::getValue)
                .containsExactlyInAnyOrder("midkast091", "македонија");
    }
}

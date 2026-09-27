package mk.ukim.finki.aibotbackend.service;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import mk.ukim.finki.aibotbackend.integration.vezilka.DonationReceipt;
import mk.ukim.finki.aibotbackend.integration.vezilka.TextDonationRequest;
import mk.ukim.finki.aibotbackend.integration.vezilka.VezilkaClient;
import mk.ukim.finki.aibotbackend.model.domain.DonationBatch;
import mk.ukim.finki.aibotbackend.model.domain.ExtractedPost;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionSession;
import mk.ukim.finki.aibotbackend.model.enums.DonationStatus;
import mk.ukim.finki.aibotbackend.model.enums.SocialNetwork;
import mk.ukim.finki.aibotbackend.model.exception.InvalidDonationStateException;
import mk.ukim.finki.aibotbackend.repository.ExtractionSessionRepository;
import mk.ukim.finki.aibotbackend.service.domain.DonationService;
import mk.ukim.finki.aibotbackend.service.domain.ExtractedPostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@Testcontainers
@Transactional
public class DonationServiceIntegrationTest {
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

    @MockitoBean
    private VezilkaClient vezilkaClient;

    @Autowired
    private DonationService donationService;

    @Autowired
    private ExtractedPostService extractedPostService;

    @Autowired
    private ExtractionSessionRepository extractionSessionRepository;

    @Autowired
    private EntityManager entityManager;

    private Long macedonianPostId;
    private Long englishPostId;

    @BeforeEach
    void setUp() {
        ExtractionSession session = extractionSessionRepository
                .save(new ExtractionSession(SocialNetwork.THREADS, "Test session"));

        List<ExtractedPost> posts = extractedPostService.saveAll(List.of(
                new ExtractedPost(session, "MK1", "midkast091", "Денеска е убав ден во Скопје.",
                        "https://www.threads.com/@midkast091/post/MK1", null, 0.95),
                new ExtractedPost(session, "EN1", "midkast091", "PeaceDrops logo for sale",
                        "https://www.threads.com/@midkast091/post/EN1", null, 0.0)
        ));

        macedonianPostId = posts.get(0).getId();
        englishPostId = posts.get(1).getId();
        flush();
    }

    private void flush() {
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    void testDonationWorkflow() {
        when(vezilkaClient.submitTextDonation(any()))
                .thenReturn(new DonationReceipt("ref-1", "accepted"));

        DonationBatch batch = donationService.createBatch(List.of(macedonianPostId, englishPostId));
        flush();

        donationService.approve(batch.getId());
        flush();

        DonationBatch submitted = donationService.submit(batch.getId());

        assertThat(submitted.getStatus()).isEqualTo(DonationStatus.SUBMITTED);
        assertThat(submitted.getVezilkaReference()).isEqualTo("ref-1");
        assertThat(submitted.getSubmittedAt()).isNotNull();

        ArgumentCaptor<TextDonationRequest> captor = ArgumentCaptor.forClass(TextDonationRequest.class);
        org.mockito.Mockito.verify(vezilkaClient).submitTextDonation(captor.capture());
        assertThat(captor.getValue().content()).contains("Денеска е убав ден");
        assertThat(captor.getValue().content()).doesNotContain("PeaceDrops");
    }

    @Test
    void testSubmitFailsWhenTheBatchIsNotApproved() {
        DonationBatch batch = donationService.createBatch(List.of(macedonianPostId));
        flush();

        assertThatThrownBy(() -> donationService.submit(batch.getId()))
                .isInstanceOf(InvalidDonationStateException.class);
    }

    @Test
    void testSubmitFailsWhenNoPostIsMacedonian() {
        DonationBatch batch = donationService.createBatch(List.of(englishPostId));
        flush();
        donationService.approve(batch.getId());
        flush();

        assertThatThrownBy(() -> donationService.submit(batch.getId()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void testRefreshSubmittedStatusesUpdatesTheBatch() {
        when(vezilkaClient.submitTextDonation(any()))
                .thenReturn(new DonationReceipt("ref-2", "accepted"));
        when(vezilkaClient.checkStatus(anyString()))
                .thenReturn(DonationStatus.ACCEPTED);

        DonationBatch batch = donationService.createBatch(List.of(macedonianPostId));
        flush();
        donationService.approve(batch.getId());
        flush();
        donationService.submit(batch.getId());
        flush();

        donationService.refreshSubmittedStatuses();
        flush();

        assertThat(donationService.findById(batch.getId()))
                .isPresent()
                .get()
                .extracting(DonationBatch::getStatus)
                .isEqualTo(DonationStatus.ACCEPTED);
    }
}

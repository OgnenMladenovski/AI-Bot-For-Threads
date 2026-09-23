package mk.ukim.finki.aibotbackend.repository;

import mk.ukim.finki.aibotbackend.model.domain.ExtractionSession;
import mk.ukim.finki.aibotbackend.model.enums.SessionStatus;
import mk.ukim.finki.aibotbackend.model.enums.SocialNetwork;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExtractionSessionRepository extends JpaRepository<ExtractionSession, Long> {
    List<ExtractionSession> findAllByStatus(SessionStatus status);
    List<ExtractionSession> findAllBySocialNetwork(SocialNetwork socialNetwork);

    @Override
    @EntityGraph(attributePaths = "targets")
    Optional<ExtractionSession> findById(Long id);
}

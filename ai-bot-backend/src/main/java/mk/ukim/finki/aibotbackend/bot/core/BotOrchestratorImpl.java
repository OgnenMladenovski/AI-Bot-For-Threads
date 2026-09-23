package mk.ukim.finki.aibotbackend.bot.core;

import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.aibotbackend.model.domain.ExtractedPost;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionSession;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionTarget;
import mk.ukim.finki.aibotbackend.model.dto.CreateExtractedPostDto;
import mk.ukim.finki.aibotbackend.model.exception.SessionNotFoundException;
import mk.ukim.finki.aibotbackend.service.domain.BotActionLogService;
import mk.ukim.finki.aibotbackend.service.domain.ExtractedPostService;
import mk.ukim.finki.aibotbackend.service.domain.ExtractionSessionService;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
public class BotOrchestratorImpl implements BotOrchestrator {
    private final SocialNetworkBot socialNetworkBot;
    private final ExtractionSessionService extractionSessionService;
    private final ExtractedPostService extractedPostService;
    private final BotActionLogService botActionLogService;

    public BotOrchestratorImpl(
        SocialNetworkBot socialNetworkBot,
        ExtractionSessionService extractionSessionService,
        ExtractedPostService extractedPostService,
        BotActionLogService botActionLogService
    ) {
        this.socialNetworkBot = socialNetworkBot;
        this.extractionSessionService = extractionSessionService;
        this.extractedPostService = extractedPostService;
        this.botActionLogService = botActionLogService;
    }

    @Override
    public void runSession(Long sessionId) {
        ExtractionSession session = extractionSessionService
            .findById(sessionId)
            .orElseThrow(() -> new SessionNotFoundException(sessionId));

        Set<String> seenExternalIds = new HashSet<>();

        try {
            socialNetworkBot.login();

            for(ExtractionTarget target : session.getTargets())
            {
                List<CreateExtractedPostDto> collected = socialNetworkBot.execute(
                        target,
                        ((action, successful) -> botActionLogService.log(session, action, successful))
                );

                List<ExtractedPost> posts = collected.stream()
                        .filter(dto -> dto.externalId() == null || seenExternalIds.add(dto.externalId()))
                        .map(dto -> dto.toExtractedPost(session))
                        .toList();

                extractedPostService.saveAll(posts);
                log.info("Target {} '{}' produced {} post(s).", target.getType(), target.getValue(), posts.size());
            }
            extractionSessionService.complete(sessionId);
        }
        catch (RuntimeException exception) {
            extractionSessionService.fail(sessionId);
            log.error("Extraction session {} failed.", sessionId, exception);
        }
        finally {
            socialNetworkBot.shutdown();
        }
    }
}

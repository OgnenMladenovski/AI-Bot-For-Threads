package mk.ukim.finki.aibotbackend.bot.extraction;

import java.util.List;
import mk.ukim.finki.aibotbackend.bot.browser.PageSnapshot;
import mk.ukim.finki.aibotbackend.model.dto.CreateExtractedPostDto;

/**
 * Turns a captured page into structured posts.
 *
 * <p>Implemented by {@link ThreadsContentExtractor}, which parses the [POST]
 * blocks of the snapshots. The returned DTOs carry no language confidence —
 * the agentic loop fills it in via the {@link LanguageDetector}.</p>
 */
public interface ContentExtractor {
    List<CreateExtractedPostDto> extract(PageSnapshot snapshot);
}

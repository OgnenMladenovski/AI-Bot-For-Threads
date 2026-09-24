package mk.ukim.finki.aibotbackend.bot.extraction;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import mk.ukim.finki.aibotbackend.bot.browser.PageSnapshot;
import mk.ukim.finki.aibotbackend.model.dto.CreateExtractedPostDto;
import mk.ukim.finki.aibotbackend.model.enums.MediaType;
import org.junit.jupiter.api.Test;

public class ThreadsContentExtractorTest {
    private final ThreadsContentExtractor extractor = new ThreadsContentExtractor();

    private PageSnapshot snapshotOf(String domContent) {
        return new PageSnapshot("https://www.threads.com/@avtor", "Threads", domContent, null);
    }

    @Test
    void testExtractsPostsWithAllFields() {
        List<CreateExtractedPostDto> posts = extractor.extract(snapshotOf("""
            [POSTS]
            [POST]
            url=https://www.threads.com/@avtor/post/DABC123
            author=@avtor
            time=2026-09-20T10:15:00Z
            text=Добро утро, Скопје!
            Денес е убав ден.
            media=IMAGE|https://example.com/slika.jpg
            [/POST]
            [POST]
            url=https://www.threads.com/@druga/post/DXYZ789
            author=@druga
            text=Втор пост без слика.
            [/POST]
            """));

        assertThat(posts).hasSize(2);

        CreateExtractedPostDto first = posts.get(0);
        assertThat(first.externalId()).isEqualTo("DABC123");
        assertThat(first.authorHandle()).isEqualTo("avtor");
        assertThat(first.content()).isEqualTo("Добро утро, Скопје!\nДенес е убав ден.");
        assertThat(first.sourceUrl()).isEqualTo("https://www.threads.com/@avtor/post/DABC123");
        assertThat(first.postedAt()).isNotNull();
        assertThat(first.macedonianConfidence()).isNull();
        assertThat(first.mediaItems()).hasSize(1);
        assertThat(first.mediaItems().get(0).type()).isEqualTo(MediaType.IMAGE);

        assertThat(posts.get(1).externalId()).isEqualTo("DXYZ789");
        assertThat(posts.get(1).postedAt()).isNull();
    }

    @Test
    void testSkipsEmptyBlocksAndDuplicates() {
        List<CreateExtractedPostDto> posts = extractor.extract(snapshotOf("""
            [POST]
            url=https://www.threads.com/@avtor/post/DSAME
            text=Ист пост.
            [/POST]
            [POST]
            url=https://www.threads.com/@avtor/post/DSAME
            text=Ист пост.
            [/POST]
            [POST]
            author=@reklama
            [/POST]
            """));

        assertThat(posts).hasSize(1);
    }

    @Test
    void testHandlesEmptySnapshot() {
        assertThat(extractor.extract(snapshotOf(""))).isEmpty();
        assertThat(extractor.extract(snapshotOf("nothing useful here"))).isEmpty();
        assertThat(extractor.extract(null)).isEmpty();
    }
}
package mk.ukim.finki.aibotbackend.bot.extraction;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import mk.ukim.finki.aibotbackend.bot.browser.PageSnapshot;
import mk.ukim.finki.aibotbackend.model.dto.CreateExtractedPostDto;
import mk.ukim.finki.aibotbackend.model.dto.CreateMediaItemDto;
import mk.ukim.finki.aibotbackend.model.enums.MediaType;
import org.springframework.stereotype.Component;

/**
 * Parses the [POST] blocks that PlaywrightBrowserAgent writes into PageSnapshot.domContent and turns them into posts.
 *
 * <p>One block looks like this:</p>
 * <pre>{@code
 * [POST]
 * url=https://www.threads.com/@avtor/post/DABC123
 * author=@avtor
 * time=2026-09-20T10:15:00Z
 * text=Добро утро, Скопје!
 * Денес е убав ден за прошетка.
 * media=IMAGE|https://example.com/slika.jpg
 * media=VIDEO|https://example.com/video.mp4
 * [/POST]
 * }</pre>
 */
@Component
public class ThreadsContentExtractor implements ContentExtractor {

    //Everything between [POST] and [/POST]
    private static final Pattern POST_BLOCK = Pattern.compile("\\[POST\\](.*?)\\[/POST\\]", Pattern.DOTALL);

    //The id at the end of a Threads permalink
    private static final Pattern POST_ID = Pattern.compile("/post/([A-Za-z0-9_-]+)");

    @Override
    public List<CreateExtractedPostDto> extract(PageSnapshot snapshot) {
        if (snapshot == null || snapshot.domContent() == null) {
            return List.of();
        }

        List<CreateExtractedPostDto> posts = new ArrayList<>();
        Set<String> seenExternalIds = new HashSet<>();

        Matcher blocks = POST_BLOCK.matcher(snapshot.domContent());

        while (blocks.find()) {
            CreateExtractedPostDto post = parsePost(blocks.group(1));

            if (post == null) {
                continue;
            }

            //If a post appears twice in one snapshot, keep only the first one
            if (post.externalId() != null && !seenExternalIds.add(post.externalId())) {
                continue;
            }

            posts.add(post);
        }

        return posts;
    }

    private CreateExtractedPostDto parsePost(String block) {
        String sourceUrl = null;
        String authorHandle = null;
        String postedAt = null;
        StringBuilder content = new StringBuilder();
        List<CreateMediaItemDto> mediaItems = new ArrayList<>();
        //The post text can span several lines, so everything after text= belongs to it
        boolean readingText = false;

        for (String line : block.split("\\R")) {
            if (line.startsWith("url=")) {
                sourceUrl = line.substring("url=".length()).trim();
                readingText = false;
            }
            else if (line.startsWith("author=")) {
                authorHandle = line.substring("author=".length()).trim().replace("@", "");
                readingText = false;
            }
            else if (line.startsWith("time=")) {
                postedAt = line.substring("time=".length()).trim();
                readingText = false;
            }
            else if (line.startsWith("media=")) {
                addMediaItem(mediaItems, line.substring("media=".length()).trim());
                readingText = false;
            }
            else if (line.startsWith("text=")) {
                content.append(line.substring("text=".length()));
                //The text starts here and goes on until the next known key
                readingText = true;
            }
            else if (readingText) {
                content.append("\n").append(line);
            }
        }

        String text = content.toString().trim();

        //A block without text and without media is not a post (Ads, Suggested for you)
        if (text.isBlank() && mediaItems.isEmpty()) {
            return null;
        }

        return new CreateExtractedPostDto(
                extractExternalId(sourceUrl),
                authorHandle,
                text,
                sourceUrl,
                parsePostedAt(postedAt),
                null,
                mediaItems
        );
    }

    private void addMediaItem(List<CreateMediaItemDto> mediaItems, String value) {
        String[] parts = value.split("\\|", 2);

        if (parts.length != 2 || parts[1].isBlank()) {
            return;
        }

        MediaType type;

        //Videos or Images
        if (parts[0].equalsIgnoreCase("VIDEO")) {
            type = MediaType.VIDEO;
        }
        else {
            type = MediaType.IMAGE;
        }

        mediaItems.add(new CreateMediaItemDto(type, parts[1].trim(), null));
    }

    private String extractExternalId(String sourceUrl) {
        if (sourceUrl == null) {
            return null;
        }

        Matcher matcher = POST_ID.matcher(sourceUrl);

        //Takes out the id
        if (matcher.find()) {
            return matcher.group(1);
        }
        else {
            return null;
        }
    }

    private LocalDateTime parsePostedAt(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            //Threads gives the time in ISO format with Z (UTC), so it converts it to local time
            return LocalDateTime.ofInstant(Instant.parse(value), ZoneId.systemDefault());
        }
        catch (RuntimeException exception) {
            return null;
        }
    }
}
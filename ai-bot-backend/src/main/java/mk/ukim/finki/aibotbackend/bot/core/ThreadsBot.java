package mk.ukim.finki.aibotbackend.bot.core;

import mk.ukim.finki.aibotbackend.bot.browser.BrowserAgent;
import mk.ukim.finki.aibotbackend.bot.browser.PageSnapshot;
import mk.ukim.finki.aibotbackend.bot.extraction.ContentExtractor;
import mk.ukim.finki.aibotbackend.bot.extraction.LanguageDetector;
import mk.ukim.finki.aibotbackend.bot.llm.LlmClient;
import mk.ukim.finki.aibotbackend.config.BotProperties;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionTarget;
import mk.ukim.finki.aibotbackend.model.enums.SocialNetwork;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class ThreadsBot extends AbstractSocialNetworkBot{

    //5 rounds fit into 12 steps (NAVIGATE + 5 x (EXTRACT+SCROLL) + FINISH) of the 15 allowed, which leaves room for mistakes
    private static final int EXTRACT_ROUNDS = 5;
    private final String username;
    private final String password;
    private boolean loggedIn = false;

    //The button could be in Macedonian or English so the bot tries both + Submit
    private static final List<String> SUBMIT_BUTTONS = List.of(
            "[role='button']:has-text('Најави се')",
            "[role='button']:has-text('Log in')",
            "[type='submit']"
    );

    protected ThreadsBot(BrowserAgent browserAgent, LlmClient llmClient, ContentExtractor contentExtractor, LanguageDetector languageDetector, BotProperties botProperties, @Value("${threads.username}") String username, @Value("${threads.password}") String password) {
        super(browserAgent, llmClient, contentExtractor, languageDetector, botProperties);
        this.username = username;
        this.password = password;
    }

    @Override
    protected String buildGoal(ExtractionTarget target) {
        String value = target.getValue().trim();

        //Target types in the url
        String url = switch (target.getType()) {
            case PROFILE -> "https://www.threads.com/@" + value.replace("@", "");
            case HASHTAG -> "https://www.threads.com/search?q=" + URLEncoder.encode("#" + value.replace("#", ""), StandardCharsets.UTF_8) + "&serp_type=tags";
            case KEYWORD -> "https://www.threads.com/search?q=" + URLEncoder.encode(value, StandardCharsets.UTF_8) + "&serp_type=default";
            case FEED_URL -> value;
        };

        //The GOAL part of the Gemini prompt
        return """
                Collect Macedonian-language posts from this Threads page: %s
                1. If the current URL is not %s, use NAVIGATE to open it.
                2. Use EXTRACT to collect the posts that are currently visible.
                3. Use SCROLL to load more posts, then EXTRACT again.
                4. Repeat steps 2 and 3 until you have done EXTRACT %d times, then FINISH.
                Never open a single post and never like, follow, comment or write anything.
                """.formatted(url, url, EXTRACT_ROUNDS);
    }

    @Override
    public SocialNetwork network() {
        //What social media the bot will be using
        return SocialNetwork.THREADS;
    }

    @Override
    public void login() {
        //Gemini can also log in to Threads, this checks so that the same action doesn't get repeated
        if (loggedIn) {
            return;
        }

        browserAgent.start();
        browserAgent.navigateTo("https://www.threads.com");

        if (isLoggedIn(browserAgent.snapshot())) {
            loggedIn = true;
            return;
        }

        if (username.isBlank() || password.isBlank()) {
            throw new IllegalStateException("Threads shows a login wall but THREADS_USERNAME/THREADS_PASSWORD are empty.");
        }

        browserAgent.navigateTo("https://www.threads.com" + "/login");
        browserAgent.type("[autocomplete='username']", username);
        browserAgent.type("[type='password']", password);

        boolean clicked = false;
        for (String selector : SUBMIT_BUTTONS) {
            try {
                browserAgent.click(selector);
                clicked = true;
                break;
            }
            catch (RuntimeException exception) {
                //The button is not on the page
            }
        }

        if (!clicked) {
            throw new IllegalStateException("Could not find the login button.");
        }

        //3 attempts to check if the bot has logged into Threads, because it takes a couple of seconds to redirect
        for (int attempt = 0; attempt < 3; attempt++) {
            browserAgent.navigateTo("https://www.threads.com");
            if (isLoggedIn(browserAgent.snapshot())) {
                loggedIn = true;
                return;
            }
        }

        throw new IllegalStateException("Threads login failed. Run once with bot.headless=false and log in by hand, the cookies are then saved in the profile folder.");
    }

    private boolean isLoggedIn(PageSnapshot snapshot) {
        //The bot knows it's logged in when there isn't a password input field
        if (snapshot.url().contains("/login")) {
            return false;
        }
        return !snapshot.domContent().contains("input:password");
    }

    @Override
    public void shutdown() {
        //The browser is closed so the next session has to log in again
        loggedIn = false;
        super.shutdown();
    }
}
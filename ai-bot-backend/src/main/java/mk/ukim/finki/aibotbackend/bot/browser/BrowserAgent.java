package mk.ukim.finki.aibotbackend.bot.browser;

/**
 * The browser automation seam of the bot: everything the agentic loop can
 * physically do inside a real browser.
 *
 * <p>Implemented by {@link PlaywrightBrowserAgent}, which drives a real Chromium
 * with a persistent profile and honours {@code BotProperties.headless()}.</p>
 *
 * <p>Element parameters are free-form <i>descriptions</i> — the index from the
 * snapshot's [ELEMENTS] section (e.g. "#12"), a CSS selector, or plain text —
 * and the implementation decides how to resolve them.</p>
 */
public interface BrowserAgent {
    /**
     * Starts the underlying browser. Must be called before any other method.
     */
    void start();

    void navigateTo(String url);

    void click(String elementDescription);

    void type(String elementDescription, String text);

    void scrollDown();

    /**
     * @return a PNG screenshot of the current viewport
     */
    byte[] takeScreenshot();

    /**
     * Captures what is currently on screen so the {@code LlmClient} can decide
     * the next action and the {@code ContentExtractor} can extract content.
     */
    PageSnapshot snapshot();

    /**
     * Closes the underlying browser and releases all resources.
     */
    void close();
}

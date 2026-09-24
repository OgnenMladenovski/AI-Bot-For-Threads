package mk.ukim.finki.aibotbackend.bot.browser;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.LoadState;
import mk.ukim.finki.aibotbackend.config.BotProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class PlaywrightBrowserAgent implements BrowserAgent {

    private final BotProperties botProperties;
    private final String userDataDir;
    private Playwright playwright;
    private BrowserContext context;
    private Page page;
    private static final Pattern ELEMENT_INDEX = Pattern.compile("#?(\\d{1,3})");
    private static final String SNAPSHOT_SCRIPT = """
        () => {
          const lines = [];
          document.querySelectorAll('[data-bot-id]').forEach(el => el.removeAttribute('data-bot-id'));

          const isVisible = (el) => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0;
          };

          const cleanText = (raw, author) => {
            const skip = new Set(['Translate', 'View more replies', 'Show more', 'See more']);
            return raw.split('\\n')
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .filter((line, i) => !(i === 0 && line === author))
              .filter(line => !skip.has(line))
              .filter(line => !/^\\d+(\\.\\d+)?[KM]?$/.test(line))
              .filter(line => !/^\\d+[smhdw]$/.test(line))
              .filter(line => !/^\\d+\\s*\\/\\s*\\d+$/.test(line))
              .join('\\n');
          };

          lines.push('[ELEMENTS]');
          const selector = 'button, a, input, textarea, [role="button"], [contenteditable="true"]';
          let index = 0;
          for (const el of document.querySelectorAll(selector)) {
            if (!isVisible(el)) continue;
            if (index >= 40) break;
            el.setAttribute('data-bot-id', String(index));
            const tag = el.tagName.toLowerCase();
            const label = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '')
              .trim().replace(/\\s+/g, ' ').slice(0, 60);
            lines.push('[' + index + '] ' + tag + ' "' + label + '"');
            index++;
          }

          lines.push('[POSTS]');
          const seenUrls = new Set();
          for (const link of document.querySelectorAll('a[href*="/post/"]')) {
            const url = link.href.split('?')[0].replace(/\\/media$/, '');
            if (seenUrls.has(url)) continue;

            let container = link;
            for (let i = 0; i < 8 && container.parentElement; i++) {
              container = container.parentElement;
              if (container.querySelector('time') && container.innerText.length > 40) break;
            }

            const text = (container.innerText || '').trim();
            if (text.length < 10) continue;
            seenUrls.add(url);

            const timeEl = container.querySelector('time');
            const author = (url.split('/@')[1] || '').split('/')[0];

            lines.push('[POST]');
            lines.push('url=' + url);
            lines.push('author=' + author);
            if (timeEl && timeEl.getAttribute('datetime')) {
              lines.push('time=' + timeEl.getAttribute('datetime'));
            }
            lines.push('text=' + cleanText(text, author));
            for (const img of container.querySelectorAll('img')) {
              if (!img.src) continue;
              if (img.naturalWidth < 300) continue;
              if ((img.alt || '').toLowerCase().includes('profile picture')) continue;
              lines.push('media=IMAGE|' + img.src);
            }
            for (const video of container.querySelectorAll('video')) {
              if (video.src) lines.push('media=VIDEO|' + video.src);
            }
            lines.push('[/POST]');
          }

          return lines.join('\\n');
        }
        """;

    public PlaywrightBrowserAgent(BotProperties botProperties, @Value("${threads.user-data-dir}") String userDataDir) {
        this.botProperties = botProperties;
        this.userDataDir = userDataDir;
    }

    @Override
    public void start() {
        //This is needed because if we click start() twice it would open another browser
        if (page != null) {
            return;
        }

        playwright = Playwright.create();

        //Opens the folder where it stores the cookies, so that the Threads login lasts between runs
        context = playwright
                .chromium()
                .launchPersistentContext(Path.of(userDataDir), new BrowserType.LaunchPersistentContextOptions()
                        .setHeadless(botProperties.headless())
                        .setLocale("mk-MK")
                        .setViewportSize(1280, 900)
                        .setArgs(List.of("--disable-blink-features=AutomationControlled"))); //Hides the flag that shows the browser is automated

        //If a tab is already open (which there usually is when we open a Playwright browser) it uses that one instead of starting a new one
        if (context.pages().isEmpty()) {
            page = context.newPage();
        }
        else {
            page = context.pages().getFirst();
        }
    }

    @Override
    public void navigateTo(String url) {
        if (page == null) {
            throw new IllegalStateException("The browser is not started. Call start() first.");
        }
        page.navigate(url);
        page.waitForLoadState(LoadState.DOMCONTENTLOADED);
        //Threads loads the posts with JavaScript so they arrive late
        page.waitForTimeout(2000);
    }

    @Override
    public void click(String elementDescription) {
        if (page == null) {
            throw new IllegalStateException("The browser is not started. Call start() first.");
        }

        resolve(elementDescription).click(new Locator.ClickOptions().setTimeout(5000));
        page.waitForTimeout(1000);
    }

    @Override
    public void type(String elementDescription, String text) {
        if (page == null) {
            throw new IllegalStateException("The browser is not started. Call start() first.");
        }

        resolve(elementDescription).fill(text, new Locator.FillOptions().setTimeout(5000));
    }

    @Override
    public void scrollDown() {
        if (page == null) {
            throw new IllegalStateException("The browser is not started. Call start() first.");
        }
        //Scrolls 1500 pixels downwards
        page.mouse().wheel(0, 1500);
        //Waits 1.5 seconds for the posts to load
        page.waitForTimeout(1500);
    }

    @Override
    public byte[] takeScreenshot() {
        if (page == null) {
            throw new IllegalStateException("The browser is not started. Call start() first.");
        }
        return page.screenshot();
    }

    @Override
    public PageSnapshot snapshot() {
        if (page == null) {
            throw new IllegalStateException("The browser is not started. Call start() first.");
        }

        String domContent = (String) page.evaluate(SNAPSHOT_SCRIPT);

        if (domContent.length() > 10000) {
            domContent = domContent.substring(0, 10000);

            int lastBlockEnd = domContent.lastIndexOf("[/POST]");
            if (lastBlockEnd > 0) {
                domContent = domContent.substring(0, lastBlockEnd + "[/POST]".length());
            }
        }

        return new PageSnapshot(page.url(), page.title(), domContent, null);
    }

    @Override
    public void close() {
        if (context != null) {
            context.close();
        }

        if (playwright != null) {
            playwright.close();
        }

        //Clears the context so that the next time start() is clicked it opens a new tab
        page = null;
        context = null;
        playwright = null;
    }

    private Locator resolve(String elementDescription) {
        String description = elementDescription.trim();
        Matcher matcher = ELEMENT_INDEX.matcher(description);

        if (matcher.matches()) {
            return page.locator("[data-bot-id='" + matcher.group(1) + "']");
        }

        if (description.startsWith(".") || description.startsWith("#") || description.startsWith("[")) {
            return page.locator(description).first();
        }

        return page.getByText(description).first();
    }
}

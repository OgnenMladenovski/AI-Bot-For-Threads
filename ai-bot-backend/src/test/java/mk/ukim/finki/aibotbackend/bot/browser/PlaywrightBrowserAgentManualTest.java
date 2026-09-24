package mk.ukim.finki.aibotbackend.bot.browser;

import mk.ukim.finki.aibotbackend.config.BotProperties;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

@Disabled("manual - needs a logged in browser profile")
public class PlaywrightBrowserAgentManualTest {
    @Test
    void printSnapshot() throws InterruptedException {

        BotProperties botProperties = new BotProperties(15, false);
        PlaywrightBrowserAgent agent = new PlaywrightBrowserAgent(botProperties, "./.playwright-profile");

        try {
            agent.start();
            agent.navigateTo("https://www.threads.com/@vesy_mina");

            Thread.sleep(3000);

            agent.scrollDown();
            agent.scrollDown();

            PageSnapshot snapshot = agent.snapshot();

            System.out.println("URL: " + snapshot.url());
            System.out.println("TITLE: " + snapshot.title());
            System.out.println("---------- DOM CONTENT ----------");
            System.out.println(snapshot.domContent());
        }
        finally {
            agent.close();
        }
    }
}
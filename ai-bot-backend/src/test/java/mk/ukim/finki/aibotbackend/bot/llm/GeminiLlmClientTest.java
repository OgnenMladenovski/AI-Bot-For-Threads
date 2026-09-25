package mk.ukim.finki.aibotbackend.bot.llm;

import static org.assertj.core.api.Assertions.assertThat;
import java.util.List;
import mk.ukim.finki.aibotbackend.bot.browser.PageSnapshot;
import mk.ukim.finki.aibotbackend.model.enums.BotActionType;
import org.junit.jupiter.api.Test;

public class GeminiLlmClientTest {
    private final GeminiLlmClient client = new GeminiLlmClient(
            "https://example.com", "test-key", "test-model"
    );

    @Test
    void testParsesCleanJson() {
        BotDecision decision = client.parseDecision("""
            {"goalReached": false, "rationale": "new posts on screen",
             "action": {"type": "EXTRACT", "target": null, "value": null, "reasoning": "posts are visible"}}
            """);

        assertThat(decision.goalReached()).isFalse();
        assertThat(decision.action().type()).isEqualTo(BotActionType.EXTRACT);
        assertThat(decision.action().target()).isNull();
        assertThat(decision.rationale()).isEqualTo("new posts on screen");
    }

    @Test
    void testParsesJsonWrappedInText() {
        BotDecision decision = client.parseDecision("""
            Here is my answer:
            ```json
            {"goalReached": false, "rationale": "need to click",
             "action": {"type": "CLICK", "target": "#12", "value": null, "reasoning": "the login button"}}
            ```
            """);

        assertThat(decision.action().type()).isEqualTo(BotActionType.CLICK);
        assertThat(decision.action().target()).isEqualTo("#12");
    }

    @Test
    void testGoalReached() {
        BotDecision decision = client.parseDecision("{\"goalReached\": true, \"rationale\": \"enough posts\"}");

        assertThat(decision.goalReached()).isTrue();
        assertThat(decision.action()).isNull();
    }

    @Test
    void testBrokenAnswerFallsBackToWait() {
        assertThat(client.parseDecision("this is not json at all").action().type()).isEqualTo(BotActionType.WAIT);
        assertThat(client.parseDecision("{\"goalReached\": false, \"action\": {\"type\": \"DANCE\"}}").action().type()).isEqualTo(BotActionType.WAIT);
        assertThat(client.parseDecision("").action().type()).isEqualTo(BotActionType.WAIT);
    }

    @Test
    void testStopsWhenRepeatingTheSameAction() {
        BotAction click = new BotAction(BotActionType.CLICK, "#5", null, "clicking");
        PageSnapshot snapshot = new PageSnapshot("https://www.threads.com", "Threads", "[POSTS]", null);

        BotDecision decision = client.decideNextAction(snapshot, "collect posts", List.of(click, click, click));

        assertThat(decision.goalReached()).isTrue();
        assertThat(decision.action()).isNull();
    }
}
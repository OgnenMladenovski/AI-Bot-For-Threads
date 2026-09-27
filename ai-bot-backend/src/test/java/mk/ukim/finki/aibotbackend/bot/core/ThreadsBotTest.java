package mk.ukim.finki.aibotbackend.bot.core;

import mk.ukim.finki.aibotbackend.model.domain.ExtractionTarget;
import mk.ukim.finki.aibotbackend.model.enums.TargetType;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ThreadsBotTest {

    private final ThreadsBot bot = new ThreadsBot(null, null, null, null, null, "user", "password");

    private String goalFor(TargetType type, String value) {
        return bot.buildGoal(new ExtractionTarget(type, value, null));
    }

    @Test
    void profileGoalHoldsTheProfileUrl() {
        String goal = goalFor(TargetType.PROFILE, "@vesy_mina");
        assertTrue(goal.contains("https://www.threads.com/@vesy_mina"));
    }

    @Test
    void profileGoalIsTheSameWithAndWithoutTheAtSign() {
        assertEquals(goalFor(TargetType.PROFILE, "@vesy_mina"), goalFor(TargetType.PROFILE, "vesy_mina"));
    }

    @Test
    void hashtagGoalEncodesTheHashAndAsksForTags() {
        String goal = goalFor(TargetType.HASHTAG, "македонија");
        assertTrue(goal.contains("q=%23"));
        assertTrue(goal.contains("serp_type=tags"));
    }

    @Test
    void keywordGoalEncodesTheSpaceAndAsksForTheDefaultSearch() {
        String goal = goalFor(TargetType.KEYWORD, "скопски мостови");
        assertTrue(goal.contains("+"));
        assertTrue(goal.contains("serp_type=default"));
    }

    @Test
    void feedUrlGoalUsesTheUrlAsItIs() {
        String goal = goalFor(TargetType.FEED_URL, "https://www.threads.com/search?q=test");
        assertTrue(goal.contains("https://www.threads.com/search?q=test"));
    }

    @Test
    void goalTellsTheModelHowManyExtractRoundsToDo() {
        assertTrue(goalFor(TargetType.PROFILE, "vesy_mina").contains("EXTRACT 5 times"));
    }
}
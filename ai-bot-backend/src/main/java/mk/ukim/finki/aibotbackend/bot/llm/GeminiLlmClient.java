package mk.ukim.finki.aibotbackend.bot.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.aibotbackend.bot.browser.PageSnapshot;
import mk.ukim.finki.aibotbackend.model.enums.BotActionType;
import mk.ukim.finki.aibotbackend.model.exception.BotExecutionException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;

@Component
public class GeminiLlmClient implements LlmClient{

    //Rules for the model
    private static final String SYSTEM_PROMPT = """
        You are a bot that collects publicly visible posts from the Threads website.
        On every step you get a compact description of the current page and you choose ONE action.

        Allowed actions:
        NAVIGATE - go to a URL (target = the URL)
        CLICK    - click an element (target = the number from [ELEMENTS], for example "#12")
        TYPE     - type into a field (target = the number, value = the text)
        SCROLL   - scroll down so more posts load
        WAIT     - wait when the page is still loading
        EXTRACT  - extract the posts that are visible right now
        LOGIN    - log in when the page shows a login wall
        FINISH   - stop, nothing more to do

        Rules:
        - If the page shows a login wall, answer LOGIN.
        - If [POSTS] holds posts you have not extracted yet, answer EXTRACT.
        - Right after EXTRACT, answer SCROLL so new posts load.
        - Never use an element number that is not listed in [ELEMENTS].
        - Set goalReached to true when you have collected enough posts or scrolling brings nothing new.

        Answer with JSON only, no markdown fences, in exactly this shape:
        {"goalReached": false, "rationale": "why", "action": {"type": "SCROLL", "target": null, "value": null, "reasoning": "why this action"}}
        """;

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String model;

    public GeminiLlmClient(@Value("${llm.api-url}") String apiUrl, @Value("${llm.api-key}") String apiKey, @Value("${llm.model}") String model) {
        this.model = model;
        this.restClient = RestClient
                .builder()
                .baseUrl(apiUrl)
                .defaultHeader("x-goog-api-key", apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        //The API takes one input string combining the system prompt and the user prompt
        Map<String, Object> body = Map.of(
                "model", model,
                "input", systemPrompt + "\n\n" + userPrompt
        );

        //Returns a POST response
        String response = restClient
                .post()
                .body(body)
                .retrieve()
                .body(String.class);

        return extractText(response);
    }

    private String extractText(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            StringBuilder text = new StringBuilder();

            //Gemini answers in steps (thinking and output) but we only need the output
            for (JsonNode step : root.path("steps")) {
                if (!"model_output".equals(step.path("type").asText())) {
                    continue;
                }
                for (JsonNode content : step.path("content")) {
                    if ("text".equals(content.path("type").asText())) {
                        text.append(content.path("text").asText());
                    }
                }
            }

            return text.toString().trim();
        }
        catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            throw new BotExecutionException("Could not read the Gemini response.", exception);
        }
    }

    @Override
    public BotDecision decideNextAction(PageSnapshot snapshot, String goal, List<BotAction> history) {
        if (isRepeatingItself(history)) {
            return new BotDecision(null, true, "The last three actions were the same, stopping.");
        }

        String answer = complete(SYSTEM_PROMPT, buildUserPrompt(snapshot, goal, history));
        return parseDecision(answer);
    }

    private boolean isRepeatingItself(List<BotAction> history) {
        if (history.size() < 3) {
            return false;
        }

        BotAction last = history.get(history.size() - 1);
        BotAction secondLast = history.get(history.size() - 2);
        BotAction thirdLast = history.get(history.size() - 3);

        //Checks if the last 3 actions were the same
        if (last.type() != secondLast.type() || last.type() != thirdLast.type()) {
            return false;
        }

        //Scrolling more than 3 times is accepted, because scrolling multiple times doesn't mean the bot is stuck
        //Clicking more than 3 times means the bot is stuck
        if (last.type() == BotActionType.SCROLL) {
            return false;
        }

        return true;
    }

    private String buildUserPrompt(PageSnapshot snapshot, String goal, List<BotAction> history) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("GOAL: ").append(goal).append("\n\n");
        prompt.append("CURRENT URL: ").append(snapshot.url()).append("\n");
        prompt.append("PAGE TITLE: ").append(snapshot.title()).append("\n\n");
        prompt.append("ACTIONS SO FAR:\n");

        if (history.isEmpty()) {
            prompt.append("none, this is the first step\n");
        }
        else {
            //Only takes the last 10 actions so that it doesn't waste tokens
            int from = Math.max(0, history.size() - 10);
            for (int i = from; i < history.size(); i++) {
                BotAction action = history.get(i);
                prompt.append(i + 1).append(". ").append(action.type());
                if (action.target() != null) {
                    prompt.append(" -> ").append(action.target());
                }
                prompt.append("\n");
            }
        }

        prompt.append("\nPAGE:\n").append(snapshot.domContent());
        return prompt.toString();
    }

    BotDecision parseDecision(String answer) {
        try {
            JsonNode root = objectMapper.readTree(stripToJson(answer));

            if (root.path("goalReached").asBoolean(false)) {
                return new BotDecision(null, true, root.path("rationale").asText(""));
            }

            JsonNode actionNode = root.path("action");
            BotActionType type = BotActionType.valueOf(actionNode.path("type").asText().toUpperCase());

            //Building the new BotAction
            BotAction action = new BotAction(
                    type,
                    textOrNull(actionNode, "target"),
                    textOrNull(actionNode, "value"),
                    actionNode.path("reasoning").asText("")
            );

            return new BotDecision(action, false, root.path("rationale").asText(""));
        }
        catch (RuntimeException | com.fasterxml.jackson.core.JsonProcessingException exception) {
            //A broken answer costs one step but the session is still active
            BotAction wait = new BotAction(BotActionType.WAIT, null, null, "Could not parse the model answer.");
            return new BotDecision(wait, false, "Unparsable answer: " + answer);
        }
    }

    private String stripToJson(String answer) {
        int start = answer.indexOf('{');
        int end = answer.lastIndexOf('}');

        if (start < 0 || end <= start) {
            throw new BotExecutionException("The model answer contains no JSON: " + answer);
        }

        //Takes only the contents of the JSON (everything between {})
        return answer.substring(start, end + 1);
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode value = node.path(field);

        //If the JSON field is missing or empty it returns null
        if (value.isMissingNode() || value.isNull() || value.asText().isBlank()) {
            return null;
        }

        return value.asText();
    }
}

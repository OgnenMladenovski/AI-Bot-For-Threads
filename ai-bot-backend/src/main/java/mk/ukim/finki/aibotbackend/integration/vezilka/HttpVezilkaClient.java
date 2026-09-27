package mk.ukim.finki.aibotbackend.integration.vezilka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.aibotbackend.model.enums.DonationStatus;
import mk.ukim.finki.aibotbackend.model.exception.VezilkaIntegrationException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Component
public class HttpVezilkaClient implements VezilkaClient{

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public HttpVezilkaClient(VezilkaProperties vezilkaProperties) {
        //The key comes from .env through vezilka.api-key, without it Vezilka returns 401
        this.restClient = RestClient
                .builder()
                .baseUrl(vezilkaProperties.baseUrl())
                .defaultHeader("X-Donation-Api-Key", vezilkaProperties.apiKey())
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public DonationReceipt submitTextDonation(TextDonationRequest request) {
        //Map with a list of items that will be donated to Vezilka
        Map<String, Object> body = Map.of(
                "items", List.of(Map.of(
                        "source_url", request.sourceUrl(),
                        "text", request.content(),
                        "page_title", request.title(),
                        "page_language", "mk"
                ))
        );

        //Connecting to Vezilka Donations
        String response;
        try {
            response = restClient
                    .post()
                    .uri("/api/public/v1/donations/text/")
                    .body(body)
                    .retrieve()
                    .body(String.class);
        }
        catch (RestClientException exception) {
            throw new VezilkaIntegrationException("Could not submit the donation to Vezilka.", exception);
        }

        try {
            //The decision whether the donation has been accepted is inside the result
            JsonNode result = objectMapper.readTree(response).path("results").path(0);
            String status = result.path("status").asText("");

            //A duplicate is not a failure because the language corpus may already count that as done
            if (!status.equalsIgnoreCase("accepted") && !result.path("deduped").asBoolean(false)) {
                throw new VezilkaIntegrationException("Vezilka rejected the donation: " + result.path("rejectionReason").asText("unknown"));
            }

            return new DonationReceipt(result.path("id").asText(null), status);
        }
        catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            throw new VezilkaIntegrationException("Could not read the Vezilka response.", exception);
        }
    }

    @Override
    public DonationStatus checkStatus(String vezilkaReference) {
        //Connecting to see the status of the donation
        String response;
        try {
            response = restClient
                    .get()
                    .uri("/api/public/v1/donations/" + vezilkaReference + "/")
                    .retrieve()
                    .body(String.class);
        }
        catch (RestClientException exception) {
            throw new VezilkaIntegrationException("Could not read the donation status from Vezilka.", exception);
        }

        try {
            //Checking the status
            String status = objectMapper.readTree(response).path("status").asText("");

            if (status.equalsIgnoreCase("accepted")) {
                return DonationStatus.ACCEPTED;
            }
            if (status.equalsIgnoreCase("rejected")) {
                return DonationStatus.REJECTED;
            }

            return DonationStatus.FAILED;
        }
        catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            throw new VezilkaIntegrationException("Could not read the Vezilka response.", exception);
        }
    }
}

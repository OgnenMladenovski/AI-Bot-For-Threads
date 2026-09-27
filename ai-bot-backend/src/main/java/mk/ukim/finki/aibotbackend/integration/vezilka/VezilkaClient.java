package mk.ukim.finki.aibotbackend.integration.vezilka;

import mk.ukim.finki.aibotbackend.model.enums.DonationStatus;

/**
 * The integration seam towards <a href="https://doniraj.vezilka.ai">doniraj.vezilka.ai</a>.
 *
 * <p>Implemented by {@link HttpVezilkaClient} over the public donation API,
 * configured through {@link VezilkaProperties}. Throw
 * {@code VezilkaIntegrationException} when communication fails.</p>
 */
public interface VezilkaClient {
    /**
     * Submits one text donation and returns Vezilka's receipt for it.
     */
    DonationReceipt submitTextDonation(TextDonationRequest request);

    /**
     * Checks what happened to a previously submitted donation.
     *
     * @param vezilkaReference the reference from the {@link DonationReceipt}
     */
    DonationStatus checkStatus(String vezilkaReference);
}

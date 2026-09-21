package mk.ukim.finki.aibotbackend.service.domain.impl;

import java.util.List;
import java.util.Optional;
import mk.ukim.finki.aibotbackend.integration.vezilka.VezilkaClient;
import mk.ukim.finki.aibotbackend.model.domain.DonationBatch;
import mk.ukim.finki.aibotbackend.model.domain.ExtractedPost;
import mk.ukim.finki.aibotbackend.model.enums.DonationStatus;
import mk.ukim.finki.aibotbackend.model.exception.DonationBatchNotFoundException;
import mk.ukim.finki.aibotbackend.model.exception.InvalidDonationStateException;
import mk.ukim.finki.aibotbackend.repository.DonationBatchRepository;
import mk.ukim.finki.aibotbackend.service.domain.DonationService;
import mk.ukim.finki.aibotbackend.service.domain.ExtractedPostService;
import org.springframework.stereotype.Service;

@Service
public class DonationServiceImpl implements DonationService {
    private final DonationBatchRepository donationBatchRepository;
    private final ExtractedPostService extractedPostService;
    private final VezilkaClient vezilkaClient;

    public DonationServiceImpl(
        DonationBatchRepository donationBatchRepository,
        ExtractedPostService extractedPostService,
        VezilkaClient vezilkaClient
    ) {
        this.donationBatchRepository = donationBatchRepository;
        this.extractedPostService = extractedPostService;
        this.vezilkaClient = vezilkaClient;
    }

    @Override
    public List<DonationBatch> findAll() {
        return donationBatchRepository.findAll();
    }

    @Override
    public Optional<DonationBatch> findById(Long id) {
        return donationBatchRepository.findById(id);
    }

    @Override
    public DonationBatch createBatch(List<Long> postIds) {
        List<ExtractedPost> list = extractedPostService.findAllById(postIds);
        for(ExtractedPost list_item : list)
        {
            if(list_item.getDonationBatch() != null)
            {
                throw new IllegalArgumentException("Post " + list_item.getId() + " is already donated.");
            }
        }
        DonationBatch batch = donationBatchRepository.save(new DonationBatch(DonationStatus.DRAFT));
        for(ExtractedPost list_item : list)
        {
            list_item.setDonationBatch(batch);
        }
        extractedPostService.saveAll(list);
        return batch;
    }

    @Override
    public DonationBatch approve(Long id) {
        DonationBatch donationBatch = findById(id).orElseThrow(() -> new DonationBatchNotFoundException(id));
        if(donationBatch.getStatus() != DonationStatus.DRAFT)
        {
            throw new InvalidDonationStateException(id, donationBatch.getStatus());
        }
        donationBatch.setStatus(DonationStatus.APPROVED);
        return donationBatchRepository.save(donationBatch);
    }

    @Override
    public DonationBatch submit(Long id) {
        // TODO(student): Build a TextDonationRequest from the batch content, call
        //  vezilkaClient.submitTextDonation, store the receipt reference, stamp
        //  submittedAt, set the status to SUBMITTED and save. Consider publishing
        //  a DonationBatchSubmittedEvent afterwards.
        throw new UnsupportedOperationException("TODO(student): Implement DonationService.submit().");
    }

    @Override
    public void refreshSubmittedStatuses() {
        // TODO(student): For every batch in status SUBMITTED, call
        //  vezilkaClient.checkStatus(batch.getVezilkaReference()) and update the status.
        throw new UnsupportedOperationException("TODO(student): Implement DonationService.refreshSubmittedStatuses().");
    }
}

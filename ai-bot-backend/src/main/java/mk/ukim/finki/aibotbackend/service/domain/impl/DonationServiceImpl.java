package mk.ukim.finki.aibotbackend.service.domain.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import mk.ukim.finki.aibotbackend.integration.vezilka.DonationReceipt;
import mk.ukim.finki.aibotbackend.integration.vezilka.TextDonationRequest;
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
        DonationBatch donationBatch = findById(id).orElseThrow(() -> new DonationBatchNotFoundException(id));
        if(donationBatch.getStatus() != DonationStatus.APPROVED)
        {
            throw new InvalidDonationStateException(id, donationBatch.getStatus());
        }
        if(donationBatch.getPosts().isEmpty())
        {
            throw new IllegalArgumentException("The donation batch with id " + id + " has no posts.");
        }

        //All the posts go into one paragraph because short separate sentences often get rejected
        StringBuilder content = new StringBuilder();
        for(ExtractedPost post : donationBatch.getPosts())
        {
            //Only the posts that are at least 50% Macedonian go into the corpus
            if(post.getMacedonianConfidence() == null || post.getMacedonianConfidence() < 0.5)
            {
                continue;
            }
            content.append(post.getContent()).append("\n\n");
        }

        if(content.isEmpty())
        {
            throw new IllegalArgumentException("The donation batch with id " + id + " has no Macedonian posts.");
        }

        DonationReceipt receipt = vezilkaClient.submitTextDonation(new TextDonationRequest(
                "Threads posts, batch " + id,
                content.toString().trim(),
                donationBatch.getPosts().getFirst().getSourceUrl()
        ));

        //vezilkaReference = id
        donationBatch.setVezilkaReference(receipt.reference());
        donationBatch.setSubmittedAt(LocalDateTime.now());
        donationBatch.setStatus(DonationStatus.SUBMITTED);
        return donationBatchRepository.save(donationBatch);
    }

    @Override
    public void refreshSubmittedStatuses() {
        List<DonationBatch> submitted = donationBatchRepository.findAllByStatus(DonationStatus.SUBMITTED);
        for(DonationBatch donationBatch : submitted)
        {
            if(donationBatch.getVezilkaReference() == null)
            {
                continue;
            }

            DonationStatus status = vezilkaClient.checkStatus(donationBatch.getVezilkaReference());

            if(status == DonationStatus.SUBMITTED)
            {
                //Batch status stays SUBMITTED until Vezilka decides (next hour)
                continue;
            }

            donationBatch.setStatus(status);
            donationBatchRepository.save(donationBatch);
        }
    }
}

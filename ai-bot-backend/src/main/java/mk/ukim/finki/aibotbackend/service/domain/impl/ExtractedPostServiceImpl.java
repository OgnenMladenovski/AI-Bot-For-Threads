package mk.ukim.finki.aibotbackend.service.domain.impl;

import java.util.List;
import java.util.Optional;
import mk.ukim.finki.aibotbackend.model.domain.ExtractedPost;
import mk.ukim.finki.aibotbackend.model.dto.PostFilterDto;
import mk.ukim.finki.aibotbackend.repository.ExtractedPostRepository;
import mk.ukim.finki.aibotbackend.service.domain.ExtractedPostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class ExtractedPostServiceImpl implements ExtractedPostService {
    private final ExtractedPostRepository extractedPostRepository;

    public ExtractedPostServiceImpl(ExtractedPostRepository extractedPostRepository) {
        this.extractedPostRepository = extractedPostRepository;
    }

    @Override
    public Page<ExtractedPost> findAll(PostFilterDto filter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Specification<ExtractedPost> spec = Specification.where(null);

        if (filter.sessionId() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("session").get("id"), filter.sessionId()));
        }
        if (filter.socialNetwork() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("session").get("socialNetwork"), filter.socialNetwork()));
        }
        if (filter.minMacedonianConfidence() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("macedonianConfidence"), filter.minMacedonianConfidence()));
        }
        if (filter.donated() != null) {
            spec = spec.and((root, query, cb) -> filter.donated()
                    ? cb.isNotNull(root.get("donationBatch"))
                    : cb.isNull(root.get("donationBatch")));
        }
        if (filter.search() != null && !filter.search().isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("content")), "%" + filter.search().toLowerCase() + "%"));
        }

        return extractedPostRepository.findAll(spec, pageable);
    }

    @Override
    public Optional<ExtractedPost> findById(Long id) {
        return extractedPostRepository.findById(id);
    }

    @Override
    public List<ExtractedPost> findAllById(List<Long> ids) {
        return extractedPostRepository.findAllById(ids);
    }

    @Override
    public List<ExtractedPost> saveAll(List<ExtractedPost> posts) {
        return extractedPostRepository.saveAll(posts);
    }

    @Override
    public Optional<ExtractedPost> deleteById(Long id) {
        Optional<ExtractedPost> extractedPost = extractedPostRepository.findById(id);
        extractedPost.ifPresent(extractedPostRepository::delete);
        return extractedPost;
    }
}

package com.copilot.rssi.service.impl;

import com.copilot.rssi.dto.request.UpdateRecommendationRequest;
import com.copilot.rssi.dto.response.RecommendationResponse;
import com.copilot.rssi.entity.Recommendation;
import com.copilot.rssi.exception.ResourceNotFoundException;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.repository.RecommendationRepository;
import com.copilot.rssi.service.interfaces.AuditService;
import com.copilot.rssi.service.interfaces.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final EntityMapper mapper;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public List<RecommendationResponse> getAll() {
        return recommendationRepository.findAll().stream()
                .map(mapper::toRecommendationResponse)
                .toList();
    }

    @Override
    @Transactional
    public RecommendationResponse updateStatus(Long id, UpdateRecommendationRequest request, String username) {
        Recommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recommandation non trouvée"));
        rec.setStatus(request.getStatus());
        Recommendation saved = recommendationRepository.save(rec);
        auditService.log(username, "UPDATE_RECOMMENDATION", "Recommendation", id,
                "Statut changé en " + request.getStatus());
        return mapper.toRecommendationResponse(saved);
    }
}

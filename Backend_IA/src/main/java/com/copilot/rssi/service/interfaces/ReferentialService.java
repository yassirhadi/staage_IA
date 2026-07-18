package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.dto.response.ReferentialResponse;
import com.copilot.rssi.entity.Referential;

import java.util.List;

public interface ReferentialService {
    List<ReferentialResponse> getAll();
    List<ReferentialResponse> getActive();
    ReferentialResponse getById(Long id);
    ReferentialResponse create(Referential referential);
    ReferentialResponse update(Long id, Referential referential);
    void delete(Long id);
}

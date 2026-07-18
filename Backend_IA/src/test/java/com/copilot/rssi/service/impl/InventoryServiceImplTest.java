package com.copilot.rssi.service.impl;

import com.copilot.rssi.dto.response.DocumentResponse;
import com.copilot.rssi.dto.response.InventoryScanResponse;
import com.copilot.rssi.entity.Document;
import com.copilot.rssi.entity.Folder;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.repository.AssetRepository;
import com.copilot.rssi.repository.DocumentRepository;
import com.copilot.rssi.repository.FolderRepository;
import com.copilot.rssi.service.interfaces.AuditService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private AiIntegrationServiceImpl aiIntegrationService;

    @Mock
    private EntityMapper entityMapper;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private InventoryServiceImpl service;

    @TempDir
    Path tempDir;

    @Test
    void scanFolderUsesLatestMatchingFolderAndDocumentWhenPathsAreDuplicated() throws Exception {
        Path sampleDir = Files.createDirectories(tempDir.resolve("sample"));
        Path sampleFile = Files.createFile(sampleDir.resolve("notes.txt"));
        Files.writeString(sampleFile, "sample content");

        Folder folder = new Folder();
        folder.setId(10L);
        folder.setPath(sampleDir.toAbsolutePath().toString());

        when(folderRepository.findFirstByPathOrderByIdDesc(anyString())).thenReturn(Optional.of(folder));
        when(documentRepository.findFirstByFilePathOrderByIdDesc(anyString())).thenReturn(Optional.empty());
        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(folderRepository.save(any(Folder.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(entityMapper.toDocumentResponse(any(Document.class))).thenReturn(DocumentResponse.builder().build());
        doNothing().when(auditService).log(anyString(), anyString(), anyString(), any(), anyString());

        InventoryScanResponse response = service.scanFolder(sampleDir.toAbsolutePath().toString());

        assertEquals(1, response.getFilesScanned());
        assertEquals(1, response.getFilesCreated());
    }
}

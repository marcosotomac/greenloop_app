package com.greenloop.greenloop.report.domain;

import com.greenloop.greenloop.report.infrastructure.ReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @InjectMocks
    private ReportService reportService;

    private Report report;
    private LocalDateTime createdAt;

    @BeforeEach
    void setUp() {
        createdAt = LocalDateTime.now();
        report = new Report();
        report.setId(1L);
        report.setTitle("Test Report");
        report.setDescription("Test Description");
        report.setStatus(Status.GOOD);
        report.setImageUrl("http://example.com/image.jpg");
        report.setAuthor("Test Author");
        report.setCreatedAt(createdAt);
        report.setComments("Initial comments");
        report.setReviewer("Initial Reviewer");
    }

    @Test
    void getAllReports_ShouldReturnAllReports() {
        // Given
        List<Report> expectedReports = Arrays.asList(report);
        when(reportRepository.findAll()).thenReturn(expectedReports);

        // When
        List<Report> actualReports = reportService.getAllReports();

        // Then
        assertThat(actualReports).isEqualTo(expectedReports);
        verify(reportRepository).findAll();
    }

    @Test
    void getReportById_ExistingId_ShouldReturnReport() {
        // Given
        when(reportRepository.findById(1L)).thenReturn(Optional.of(report));

        // When
        Optional<Report> result = reportService.getReportById(1L);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(report);
        verify(reportRepository).findById(1L);
    }

    @Test
    void getReportById_NonExistingId_ShouldReturnEmpty() {
        // Given
        when(reportRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Report> result = reportService.getReportById(999L);

        // Then
        assertThat(result).isEmpty();
        verify(reportRepository).findById(999L);
    }

    @Test
    void createReport_ShouldSetCreatedAtAndSaveReport() {
        // Given
        Report newReport = new Report();
        newReport.setTitle("New Report");
        newReport.setDescription("New Description");

        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> {
            Report saved = invocation.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        // When
        Report savedReport = reportService.createReport(newReport);

        // Then
        assertThat(savedReport.getId()).isEqualTo(2L);
        assertThat(savedReport.getTitle()).isEqualTo("New Report");
        assertThat(savedReport.getCreatedAt()).isNotNull();
        verify(reportRepository).save(newReport);
    }

    @Test
    void updateReport_ExistingId_ShouldUpdateAndReturnReport() {
        // Given
        Report updatedReport = new Report();
        updatedReport.setTitle("Updated Title");
        updatedReport.setDescription("Updated Description");
        updatedReport.setStatus(Status.EXCELLENT);
        updatedReport.setImageUrl("http://example.com/updated.jpg");
        updatedReport.setAuthor("Updated Author");
        updatedReport.setComments("Updated Comments");
        updatedReport.setReviewer("Updated Reviewer");

        when(reportRepository.findById(1L)).thenReturn(Optional.of(report));
        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Report result = reportService.updateReport(1L, updatedReport);

        // Then
        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getDescription()).isEqualTo("Updated Description");
        assertThat(result.getStatus()).isEqualTo(Status.EXCELLENT);
        assertThat(result.getImageUrl()).isEqualTo("http://example.com/updated.jpg");
        assertThat(result.getAuthor()).isEqualTo("Updated Author");
        assertThat(result.getComments()).isEqualTo("Updated Comments");
        assertThat(result.getReviewer()).isEqualTo("Updated Reviewer");
        assertThat(result.getUpdatedAt()).isNotNull();
        assertThat(result.getCreatedAt()).isEqualTo(createdAt); // CreatedAt should remain unchanged
        verify(reportRepository).findById(1L);
        verify(reportRepository).save(report);
    }

    @Test
    void updateReport_NonExistingId_ShouldThrowException() {
        // Given
        Report updatedReport = new Report();
        when(reportRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reportService.updateReport(999L, updatedReport);
        });

        assertThat(exception.getMessage()).isEqualTo("Report not found with id 999");
        verify(reportRepository).findById(999L);
        verify(reportRepository, never()).save(any());
    }

    @Test
    void deleteReport_ExistingId_ShouldDeleteReport() {
        // Given
        when(reportRepository.existsById(1L)).thenReturn(true);
        doNothing().when(reportRepository).deleteById(1L);

        // When
        reportService.deleteReport(1L);

        // Then
        verify(reportRepository).existsById(1L);
        verify(reportRepository).deleteById(1L);
    }

    @Test
    void deleteReport_NonExistingId_ShouldThrowException() {
        // Given
        when(reportRepository.existsById(999L)).thenReturn(false);

        // When/Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reportService.deleteReport(999L);
        });

        assertThat(exception.getMessage()).isEqualTo("Report not found with id 999");
        verify(reportRepository).existsById(999L);
        verify(reportRepository, never()).deleteById(any());
    }
}

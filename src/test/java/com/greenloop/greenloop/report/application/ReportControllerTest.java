package com.greenloop.greenloop.report.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenloop.greenloop.config.SecurityConfig;
import com.greenloop.greenloop.jwt.JwtService;
import com.greenloop.greenloop.report.domain.Report;
import com.greenloop.greenloop.report.domain.ReportService;
import com.greenloop.greenloop.report.domain.Status;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ReportController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE,
    classes = {SecurityConfig.class}))
@AutoConfigureMockMvc(addFilters = false)
public class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ReportService reportService;

    @MockitoBean
    private JwtService jwtService;

    private Report report;

    @BeforeEach
    void setUp() {
        report = new Report();
        report.setId(1L);
        report.setTitle("Test Report");
        report.setDescription("Test Description");
        report.setStatus(Status.GOOD);
        report.setImageUrl("http://example.com/image.jpg");
        report.setAuthor("Test Author");
        report.setCreatedAt(LocalDateTime.now());
        report.setComments("Test Comments");
        report.setReviewer("Test Reviewer");
    }

    @Test
    @WithMockUser
    void getAllReports_ShouldReturnAllReports() throws Exception {
        // Given
        when(reportService.getAllReports()).thenReturn(Arrays.asList(report));

        // When & Then
        mockMvc.perform(get("/reports")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].title", is("Test Report")))
                .andExpect(jsonPath("$[0].description", is("Test Description")))
                .andExpect(jsonPath("$[0].status", is("GOOD")))
                .andExpect(jsonPath("$[0].author", is("Test Author")));

        verify(reportService).getAllReports();
    }

    @Test
    @WithMockUser
    void getReportById_ExistingId_ShouldReturnReport() throws Exception {
        // Given
        when(reportService.getReportById(1L)).thenReturn(Optional.of(report));

        // When & Then
        mockMvc.perform(get("/reports/1")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("Test Report")))
                .andExpect(jsonPath("$.description", is("Test Description")))
                .andExpect(jsonPath("$.status", is("GOOD")))
                .andExpect(jsonPath("$.author", is("Test Author")))
                .andExpect(jsonPath("$.comments", is("Test Comments")))
                .andExpect(jsonPath("$.reviewer", is("Test Reviewer")));

        verify(reportService).getReportById(1L);
    }

    @Test
    @WithMockUser
    void getReportById_NonExistingId_ShouldReturnNotFound() throws Exception {
        // Given
        when(reportService.getReportById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/reports/999")
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(reportService).getReportById(999L);
    }

    @Test
    @WithMockUser
    void createReport_ShouldCreateAndReturnReport() throws Exception {
        // Given
        when(reportService.createReport(any(Report.class))).thenAnswer(invocation -> {
            Report reportToSave = invocation.getArgument(0);
            reportToSave.setId(1L);
            reportToSave.setCreatedAt(LocalDateTime.now());
            return reportToSave;
        });

        // When & Then
        mockMvc.perform(post("/reports")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(report)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("Test Report")))
                .andExpect(jsonPath("$.description", is("Test Description")))
                .andExpect(jsonPath("$.status", is("GOOD")));

        verify(reportService).createReport(any(Report.class));
    }

    @Test
    @WithMockUser
    void updateReport_ExistingId_ShouldUpdateAndReturnReport() throws Exception {
        // Given
        Report updatedReport = new Report();
        updatedReport.setTitle("Updated Report");
        updatedReport.setDescription("Updated Description");
        updatedReport.setStatus(Status.EXCELLENT);

        when(reportService.updateReport(eq(1L), any(Report.class))).thenReturn(updatedReport);

        // When & Then
        mockMvc.perform(put("/reports/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedReport)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Report")))
                .andExpect(jsonPath("$.description", is("Updated Description")))
                .andExpect(jsonPath("$.status", is("EXCELLENT")));

        verify(reportService).updateReport(eq(1L), any(Report.class));
    }

    @Test
    @WithMockUser
    void updateReport_NonExistingId_ShouldReturnNotFound() throws Exception {
        // Given
        Report updatedReport = new Report();
        updatedReport.setTitle("Updated Report");
        updatedReport.setDescription("Updated Description");

        when(reportService.updateReport(eq(999L), any(Report.class)))
                .thenThrow(new RuntimeException("Report not found with id 999"));

        // When & Then
        mockMvc.perform(put("/reports/999")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedReport)))
                .andExpect(status().isNotFound());

        verify(reportService).updateReport(eq(999L), any(Report.class));
    }

    @Test
    @WithMockUser
    void deleteReport_ExistingId_ShouldReturnNoContent() throws Exception {
        // Given
        doNothing().when(reportService).deleteReport(1L);

        // When & Then
        mockMvc.perform(delete("/reports/1")
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(reportService).deleteReport(1L);
    }

    @Test
    @WithMockUser
    void deleteReport_NonExistingId_ShouldReturnNotFound() throws Exception {
        // Given
        doThrow(new RuntimeException("Report not found with id 999"))
                .when(reportService).deleteReport(999L);

        // When & Then
        mockMvc.perform(delete("/reports/999")
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(reportService).deleteReport(999L);
    }
}

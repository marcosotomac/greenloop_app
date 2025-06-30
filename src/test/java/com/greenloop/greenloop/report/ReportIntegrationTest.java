package com.greenloop.greenloop.report;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenloop.greenloop.jwt.JwtService;
import com.greenloop.greenloop.report.domain.Report;
import com.greenloop.greenloop.report.domain.Status;
import com.greenloop.greenloop.report.infrastructure.ReportRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for easier testing
public class ReportIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReportRepository reportRepository;

    @MockBean
    private JwtService jwtService; // Mock JwtService to bypass security

    private Report testReport;

    @BeforeEach
    void setUp() {
        // Clear any previous data
        reportRepository.deleteAll();

        // Create a test report
        testReport = new Report();
        testReport.setTitle("Integration Test Report");
        testReport.setDescription("Integration Test Description");
        testReport.setStatus(Status.GOOD);
        testReport.setImageUrl("http://example.com/test-image.jpg");
        testReport.setAuthor("Integration Test Author");
        testReport.setCreatedAt(LocalDateTime.now());
        testReport.setComments("Integration Test Comments");
        testReport.setReviewer("Integration Test Reviewer");

        // Save the test report
        testReport = reportRepository.save(testReport);
    }

    @AfterEach
    void tearDown() {
        reportRepository.deleteAll();
    }

    @Test
    @WithMockUser
    void getAllReports_ShouldReturnAllReports() throws Exception {
        mockMvc.perform(get("/reports")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Integration Test Report")))
                .andExpect(jsonPath("$[0].description", is("Integration Test Description")))
                .andExpect(jsonPath("$[0].status", is("GOOD")));
    }

    @Test
    @WithMockUser
    void getReportById_ExistingId_ShouldReturnReport() throws Exception {
        mockMvc.perform(get("/reports/{id}", testReport.getId())
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Integration Test Report")))
                .andExpect(jsonPath("$.description", is("Integration Test Description")))
                .andExpect(jsonPath("$.status", is("GOOD")))
                .andExpect(jsonPath("$.author", is("Integration Test Author")));
    }

    @Test
    @WithMockUser
    void getReportById_NonExistingId_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/reports/{id}", 999L)
                .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void createReport_ShouldCreateAndReturnReport() throws Exception {
        Report newReport = new Report();
        newReport.setTitle("New Integration Test Report");
        newReport.setDescription("New Integration Test Description");
        newReport.setStatus(Status.EXCELLENT);
        newReport.setImageUrl("http://example.com/new-test-image.jpg");
        newReport.setAuthor("New Integration Test Author");
        newReport.setComments("New Integration Test Comments");
        newReport.setReviewer("New Integration Test Reviewer");

        mockMvc.perform(post("/reports")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newReport)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("New Integration Test Report")))
                .andExpect(jsonPath("$.description", is("New Integration Test Description")))
                .andExpect(jsonPath("$.status", is("EXCELLENT")))
                .andExpect(jsonPath("$.createdAt").isNotEmpty());

        // Verify the report was saved to the database
        assertThat(reportRepository.findAll()).hasSize(2);
    }

    @Test
    @WithMockUser
    void updateReport_ExistingId_ShouldUpdateReport() throws Exception {
        Report updatedReport = new Report();
        updatedReport.setTitle("Updated Integration Test Report");
        updatedReport.setDescription("Updated Integration Test Description");
        updatedReport.setStatus(Status.EXCELLENT);
        updatedReport.setImageUrl("http://example.com/updated-image.jpg");
        updatedReport.setAuthor("Updated Author");
        updatedReport.setComments("Updated Comments");
        updatedReport.setReviewer("Updated Reviewer");

        mockMvc.perform(put("/reports/{id}", testReport.getId())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedReport)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Integration Test Report")))
                .andExpect(jsonPath("$.description", is("Updated Integration Test Description")))
                .andExpect(jsonPath("$.status", is("EXCELLENT")))
                .andExpect(jsonPath("$.updatedAt").isNotEmpty());

        // Verify the report was updated in the database
        Optional<Report> savedReport = reportRepository.findById(testReport.getId());
        assertThat(savedReport).isPresent();
        assertThat(savedReport.get().getTitle()).isEqualTo("Updated Integration Test Report");
        assertThat(savedReport.get().getDescription()).isEqualTo("Updated Integration Test Description");
        assertThat(savedReport.get().getStatus()).isEqualTo(Status.EXCELLENT);
    }

    @Test
    @WithMockUser
    void deleteReport_ExistingId_ShouldDeleteReport() throws Exception {
        mockMvc.perform(delete("/reports/{id}", testReport.getId())
                .with(csrf()))
                .andExpect(status().isNoContent());

        // Verify the report was deleted from the database
        Optional<Report> deletedReport = reportRepository.findById(testReport.getId());
        assertThat(deletedReport).isEmpty();
    }

    @Test
    @WithMockUser
    void deleteReport_NonExistingId_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(delete("/reports/{id}", 999L)
                .with(csrf()))
                .andExpect(status().isNotFound());
    }
}

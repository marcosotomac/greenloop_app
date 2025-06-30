package com.greenloop.greenloop.report.domain;

import com.greenloop.greenloop.report.infrastructure.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Optional<Report> getReportById(Long id) {
        return reportRepository.findById(id);
    }

    public Report createReport(Report report) {
        report.setCreatedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }

    public Report updateReport(Long id, Report updatedReport) {
        return reportRepository.findById(id).map(report -> {
            report.setTitle(updatedReport.getTitle());
            report.setDescription(updatedReport.getDescription());
            report.setStatus(updatedReport.getStatus());
            report.setImageUrl(updatedReport.getImageUrl());
            report.setAuthor(updatedReport.getAuthor());
            report.setUpdatedAt(LocalDateTime.now());
            report.setComments(updatedReport.getComments());
            report.setReviewer(updatedReport.getReviewer());
            return reportRepository.save(report);
        }).orElseThrow(() -> new RuntimeException("Report not found with id " + id));
    }

    public void deleteReport(Long id) {
        if (reportRepository.existsById(id)) {
            reportRepository.deleteById(id);
        } else {
            throw new RuntimeException("Report not found with id " + id);
        }
    }
}

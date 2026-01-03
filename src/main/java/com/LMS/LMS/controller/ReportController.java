package com.LMS.LMS.controller;

import com.LMS.LMS.dto.PurchaseOrderDTO;
import com.LMS.LMS.dto.ReportResponse;
import com.LMS.LMS.dto.StockStatusDTO;
import com.LMS.LMS.dto.report.CategoryMetricDTO;
import com.LMS.LMS.dto.report.DailyUsageDTO;
import com.LMS.LMS.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/report")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // ==================================================================================
    // 1. DASHBOARD & BASIC METRICS
    // ==================================================================================

    @GetMapping("/basic-stats")
    public ResponseEntity<ReportResponse> getBasicReport() {
        ReportResponse report = reportService.generateBasicReport();
        return ResponseEntity.ok(report);
    }

    // ==================================================================================
    // 2. STOCK & INVENTORY REPORTS
    // ==================================================================================

    @GetMapping("/stock-status")
    public ResponseEntity<List<StockStatusDTO>> getInventoryStockStatus(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page) {

        List<StockStatusDTO> data = reportService.getInventoryStockStatus(category, page);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<StockStatusDTO>> getLowStockAlerts(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page) {

        List<StockStatusDTO> data = reportService.getLowStockAlerts(category, page);
        return ResponseEntity.ok(data);
    }

    // ==================================================================================
    // 3. PURCHASE ORDER HISTORY (New Requirement)
    // ==================================================================================

    @GetMapping("/purchase-history")
    public ResponseEntity<List<PurchaseOrderDTO>> getPurchaseOrderHistory(
            @RequestParam(required = false) Map<String, String> filters) {

        // Passing all query params as a map (e.g., ?startDate=2024-01-01&vendor=Global)
        List<PurchaseOrderDTO> data = reportService.getPurchaseOrderHistory(filters);
        return ResponseEntity.ok(data);
    }

    // ==================================================================================
    // 4. GENERIC FILE EXPORT (PDF/Excel)
    // ==================================================================================

    /**
     * Universal Export Endpoint.
     * Usage: /api/v1/admin/report/export/generic?reportKey=inventory-stock&format=PDF
     */
    @GetMapping("/export/generic")
    public ResponseEntity<byte[]> exportGenericReport(
            @RequestParam String reportKey,
            @RequestParam(required = false) Map<String, String> filters,
            @RequestParam(defaultValue = "PDF") String format) {

        try {
            // Generate the file bytes from the service
            byte[] fileBytes = reportService.generateReportFile(reportKey, filters, format);

            HttpHeaders headers = new HttpHeaders();

            // Set Content-Type based on format
            if ("PDF".equalsIgnoreCase(format)) {
                headers.setContentType(MediaType.APPLICATION_PDF);
            } else {
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            }

            // Generate a dynamic filename (e.g., INVENTORY-STOCK_Report_1719292.pdf)
            String filename = String.format("%s_Report_%d.%s",
                    reportKey.toUpperCase(),
                    System.currentTimeMillis(),
                    format.toLowerCase());

            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(fileBytes.length);

            return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);

        } catch (UnsupportedOperationException e) {
            // Return 400 if they ask for a report key that doesn't exist
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // NAAC 4.2.4 Endpoint
    @GetMapping("/naac/daily-usage")
    public ResponseEntity<List<DailyUsageDTO>> getDailyUsage(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        // You can pass dummy dates or parse them
        // For now, let's assume the service handles defaults or you pass null
        return ResponseEntity.ok(reportService.getDailyUsageStats(null, null));
    }

    // NAAC 4.2.3 Endpoint
    @GetMapping("/naac/category-stats")
    public ResponseEntity<List<CategoryMetricDTO>> getCategoryStats() {
        return ResponseEntity.ok(reportService.getCategoryUsageStats());
    }

    // ==================================================================================
    // 5. LEGACY EXPORTS (Kept for backward compatibility)
    // ==================================================================================

    @GetMapping("/export/activity-summary")
    public ResponseEntity<byte[]> exportActivitySummaryPdf() {
        try {
            byte[] pdfBytes = reportService.generateActivitySummaryPdf();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "LMS_Activity_Summary_" + System.currentTimeMillis() + ".pdf");
            headers.setContentLength(pdfBytes.length);
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
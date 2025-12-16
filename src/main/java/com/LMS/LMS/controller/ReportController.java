package com.LMS.LMS.controller;

import com.LMS.LMS.dto.ReportResponse;
import com.LMS.LMS.dto.StockStatusDTO;
import com.LMS.LMS.dto.PurchaseOrderDTO; // CRITICAL: New Import
import com.LMS.LMS.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/report")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/basic-stats")
    public ResponseEntity<ReportResponse> getBasicReport() {
        ReportResponse report = reportService.generateBasicReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/stock-status")
    public ResponseEntity<List<StockStatusDTO>> getInventoryStockStatus(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page) {

        List<StockStatusDTO> data = reportService.getInventoryStockStatus(category, page);
        return ResponseEntity.ok(data);
    }

    // --- NEW ENDPOINT: Low Stock Alerts ---
    @GetMapping("/low-stock")
    public ResponseEntity<List<StockStatusDTO>> getLowStockAlerts(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page) {

        List<StockStatusDTO> data = reportService.getLowStockAlerts(category, page);
        return ResponseEntity.ok(data);
    }

    // --- NEW ENDPOINT: Purchase Order History ---
    @GetMapping("/purchase-history")
    public ResponseEntity<List<PurchaseOrderDTO>> getPurchaseOrderHistory(
            @RequestParam(required = false) Map<String, String> filters) {

        // The service method handles fetching dummy or real data based on the filters
        List<PurchaseOrderDTO> data = reportService.getPurchaseOrderHistory(filters);
        return ResponseEntity.ok(data);
    }


    // --- CRITICAL NEW GENERIC EXPORT ENDPOINT ---
    /**
     * GET /api/v1/admin/report/export/generic?reportKey={key}&format={format}
     */
    @GetMapping("/export/generic")
    public ResponseEntity<byte[]> exportGenericReport(
            @RequestParam String reportKey,
            @RequestParam(required = false) Map<String, String> filters,
            @RequestParam(defaultValue = "PDF") String format) {

        try {
            byte[] fileBytes = reportService.generateReportFile(reportKey, filters, format);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);

            // Set dynamic filename based on key
            String filename = String.format("%s_Report_%d.%s", reportKey.toUpperCase(), System.currentTimeMillis(), format.toLowerCase());
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(fileBytes.length);

            return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // Original export endpoint (kept for compatibility)
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
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
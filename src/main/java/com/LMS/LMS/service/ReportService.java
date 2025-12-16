package com.LMS.LMS.service;

import com.LMS.LMS.dto.PurchaseOrderDTO; // NEW: Assume this DTO exists
import com.LMS.LMS.dto.ReportResponse;
import com.LMS.LMS.dto.StockStatusDTO;
import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.BorrowRecord;
import com.LMS.LMS.model.BorrowStatus;
import com.LMS.LMS.model.ReservationStatus;
import com.LMS.LMS.repository.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate; // New import for PurchaseOrderDTO

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream; // New import for dummy data

@Service
public class ReportService {

    // Low stock threshold constant
    private static final int LOW_STOCK_THRESHOLD = 5;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository; // CRITICAL: Assume this repository exists


    // Requirement 10: Generate comprehensive basic report (Dashboard Metrics)
    public ReportResponse generateBasicReport() {
        // ... (existing generateBasicReport logic remains the same) ...
        List<Book> allBooks = bookRepository.findAll();
        List<BorrowRecord> allBorrowRecords = borrowRepository.findAll();

        long totalStudents = studentRepository.count();
        long totalBooksInStock = allBooks.stream().mapToLong(Book::getTotalStock).sum();
        long totalAvailableBooks = allBooks.stream().mapToLong(Book::getAvailableStock).sum();

        long totalBooksIssued = allBorrowRecords.stream()
                .filter(r -> r.getStatus() == BorrowStatus.ISSUED)
                .count();

        long totalBooksOverdue = allBorrowRecords.stream()
                .filter(r -> r.getStatus() == BorrowStatus.OVERDUE)
                .count();

        long totalPendingReservations = reservationRepository.findByStatus(ReservationStatus.PENDING).size();

        Map<String, Long> booksReadCount = allBorrowRecords.stream()
                .filter(r -> r.getStatus() == BorrowStatus.RETURNED || r.getStatus() == BorrowStatus.OVERDUE)
                .collect(Collectors.groupingBy(BorrowRecord::getBookId, Collectors.counting()));

        Map<String, Long> studentBorrowCount = allBorrowRecords.stream()
                .filter(r -> r.getStatus() == BorrowStatus.RETURNED || r.getStatus() == BorrowStatus.OVERDUE || r.getStatus() == BorrowStatus.ISSUED)
                .collect(Collectors.groupingBy(BorrowRecord::getStudentId, Collectors.counting()));

        return ReportResponse.builder()
                .totalStudents(totalStudents)
                .totalBooksInStock(totalBooksInStock)
                .totalAvailableBooks(totalAvailableBooks)
                .totalBooksIssued(totalBooksIssued)
                .totalBooksOverdue(totalBooksOverdue)
                .totalPendingReservations(totalPendingReservations)
                .booksReadCount(booksReadCount)
                .studentBorrowCount(studentBorrowCount)
                .build();
    }

    // --- NEW REPORT IMPLEMENTATION: Low Stock Alerts ---
    public List<StockStatusDTO> getLowStockAlerts(String category, int page) {
        List<Book> allBooks = bookRepository.findAll();

        return allBooks.stream()
                // 1. Filter by Low Stock: Use the consistent availableStock field.
                .filter(book -> book.getAvailableStock() <= LOW_STOCK_THRESHOLD)

                // 2. Apply optional category filter
                .filter(book -> category == null || category.isEmpty() || book.getCategory().equalsIgnoreCase(category))

                // 3. Map to DTO
                .map(book -> {
                    long total = book.getTotalStock();
                    long available = book.getAvailableStock();
                    long issued = total - available;
                    long missing = 0;

                    return StockStatusDTO.builder()
                            .bookId(book.getId())
                            .title(book.getTitle())
                            .author(book.getAuthor())
                            .category(book.getCategory())
                            .totalCopies(total)
                            .availableCopies(available)
                            .issuedCopies(issued)
                            .missingCopies(missing)
                            .physicalStock(total - missing)
                            .build();

                }).collect(Collectors.toList());
    }


    // --- REPORT IMPLEMENTATION: Inventory Stock Status Report ---
    public List<StockStatusDTO> getInventoryStockStatus(String category, int page) {
        // ... (existing getInventoryStockStatus logic remains the same) ...
        List<Book> allBooks = bookRepository.findAll();

        return allBooks.stream()
                .filter(book -> category == null || category.isEmpty() || book.getCategory().equalsIgnoreCase(category))
                .map(book -> {
                    long total = book.getTotalStock();
                    long available = book.getAvailableStock();
                    long issued = total - available;
                    long missing = 0;
                    return StockStatusDTO.builder()
                            .bookId(book.getId())
                            .title(book.getTitle())
                            .author(book.getAuthor())
                            .category(book.getCategory())
                            .totalCopies(total)
                            .availableCopies(available)
                            .issuedCopies(issued)
                            .missingCopies(missing)
                            .physicalStock(total - missing)
                            .build();

                }).collect(Collectors.toList());
    }

    // --- NEW REPORT IMPLEMENTATION: Purchase Order History (Req 9) ---
    public List<PurchaseOrderDTO> getPurchaseOrderHistory(Map<String, String> filters) {
        // NOTE: In a real app, you would query purchaseOrderRepository.findAll()
        // and apply date/vendor filters from the 'filters' map.

        // --- DUMMY IMPLEMENTATION FOR IMMEDIATE FUNCTIONALITY ---
        if (purchaseOrderRepository == null) {
            return generateDummyPurchaseOrders();
        }

        // --- REAL IMPLEMENTATION (If you have a PO model) ---
        // List<PurchaseOrder> orders = purchaseOrderRepository.findAll(getFilters(filters));
        // return orders.stream().map(this::mapToPurchaseOrderDTO).collect(Collectors.toList());

        return generateDummyPurchaseOrders(); // Keep dummy data for compilation/testing
    }

    private List<PurchaseOrderDTO> generateDummyPurchaseOrders() {
        // Generates 10 dummy records
        return IntStream.range(1, 11).mapToObj(i ->
                PurchaseOrderDTO.builder()
                        .orderId("PO-2024-" + String.format("%03d", i))
                        .vendorName(i % 3 == 0 ? "Global Books Inc." : "Local Distributor")
                        .orderDate(LocalDate.now().minusDays(i * 10))
                        .itemCount((long) (i * 15))
                        .totalCost(500.00 + (i * 15.50))
                        .status(i % 4 == 0 ? "PENDING" : (i % 3 == 0 ? "CANCELLED" : "RECEIVED"))
                        .build()
        ).collect(Collectors.toList());
    }


    // --- GENERIC PDF EXPORT LOGIC (Strategy Pattern) ---
    public byte[] generateReportFile(String reportKey, Map<String, String> filters, String format) throws Exception {

        if ("inventory-stock".equalsIgnoreCase(reportKey)) {
            String category = filters != null ? filters.get("category") : null;
            List<StockStatusDTO> data = getInventoryStockStatus(category, 0);
            if ("PDF".equalsIgnoreCase(format)) {
                return generateInventoryStockPdf(data, "LMS-AI Inventory Stock Status Report");
            }
        } else if ("low-stock".equalsIgnoreCase(reportKey)) {
            String category = filters != null ? filters.get("category") : null;
            List<StockStatusDTO> data = getLowStockAlerts(category, 0);
            if ("PDF".equalsIgnoreCase(format)) {
                return generateInventoryStockPdf(data, "LMS-AI Low Stock Alert Report (Threshold: " + LOW_STOCK_THRESHOLD + ")");
            }
        } else if ("purchase-order-history".equalsIgnoreCase(reportKey)) { // <-- NEW REPORT KEY
            List<PurchaseOrderDTO> data = getPurchaseOrderHistory(filters);
            if ("PDF".equalsIgnoreCase(format)) {
                return generatePurchaseOrderPdf(data, "LMS-AI Purchase Order History Report");
            }
        }

        throw new UnsupportedOperationException("Report type or format not yet supported: " + reportKey);
    }

    /**
     * DEDICATED PDF GENERATOR for Stock Status Reports (Reused for Inventory & Low Stock).
     */
    private byte[] generateInventoryStockPdf(List<StockStatusDTO> data, String reportTitle) throws Exception {

        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {

            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);

            float yPosition = 750;
            final float margin = 50;
            final int line_height = 15;
            final float table_width = 500;

            // --- 1. Draw Title and Headers (Initial Page) ---
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 18);
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText(reportTitle);
            yPosition -= 40;

            contentStream.newLineAtOffset(0, -30);
            yPosition -= 30;

            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
            float x = margin;
            contentStream.newLineAtOffset(x, yPosition);

            contentStream.showText("BOOK TITLE");
            contentStream.newLineAtOffset(180, 0);
            contentStream.showText("TOTAL");
            contentStream.newLineAtOffset(60, 0);
            contentStream.showText("AVAILABLE");
            contentStream.newLineAtOffset(70, 0);
            contentStream.showText("ISSUED");
            contentStream.newLineAtOffset(60, 0);
            contentStream.showText("MISSING");

            contentStream.endText();
            contentStream.drawLine(margin, yPosition - 5, margin + table_width, yPosition - 5);
            yPosition -= line_height;


            // --- 2. Write Data Rows ---
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 10);
            contentStream.setLeading(line_height);

            contentStream.newLineAtOffset(margin, yPosition);

            for (StockStatusDTO dto : data) {
                if (yPosition < 50) {
                    contentStream.endText();
                    contentStream.close();
                    page = new PDPage();
                    document.addPage(page);
                    contentStream = new PDPageContentStream(document, page);
                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA, 10);
                    contentStream.setLeading(line_height);
                    yPosition = 750;
                    contentStream.newLineAtOffset(margin, yPosition);
                }

                contentStream.showText(dto.getTitle().length() > 30 ? dto.getTitle().substring(0, 30) + "..." : dto.getTitle());
                contentStream.newLineAtOffset(180, 0);
                contentStream.showText(String.valueOf(dto.getTotalCopies()));
                contentStream.newLineAtOffset(60, 0);
                contentStream.showText(String.valueOf(dto.getAvailableCopies()));
                contentStream.newLineAtOffset(70, 0);
                contentStream.showText(String.valueOf(dto.getIssuedCopies()));
                contentStream.newLineAtOffset(60, 0);
                contentStream.showText(String.valueOf(dto.getMissingCopies()));
                contentStream.newLineAtOffset(-370, -line_height);
                yPosition -= line_height;
            }

            contentStream.endText();
            contentStream.close();

            document.save(bos);
            return bos.toByteArray();
        }
    }

    /**
     * DEDICATED PDF GENERATOR for Purchase Order History Report.
     */
    private byte[] generatePurchaseOrderPdf(List<PurchaseOrderDTO> data, String reportTitle) throws Exception {

        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {

            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);

            float yPosition = 750;
            final float margin = 50;
            final int line_height = 15;
            final float table_width = 500;

            // --- 1. Draw Title and Headers ---
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 18);
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText(reportTitle);
            yPosition -= 40;

            contentStream.newLineAtOffset(0, -30);
            yPosition -= 30;

            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
            float x = margin;
            contentStream.newLineAtOffset(x, yPosition);

            contentStream.showText("ORDER ID");
            contentStream.newLineAtOffset(80, 0);
            contentStream.showText("VENDOR");
            contentStream.newLineAtOffset(120, 0);
            contentStream.showText("DATE");
            contentStream.newLineAtOffset(70, 0);
            contentStream.showText("ITEMS");
            contentStream.newLineAtOffset(60, 0);
            contentStream.showText("COST");
            contentStream.newLineAtOffset(60, 0);
            contentStream.showText("STATUS");

            contentStream.endText();
            contentStream.drawLine(margin, yPosition - 5, margin + table_width, yPosition - 5);
            yPosition -= line_height;


            // --- 2. Write Data Rows ---
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 10);
            contentStream.setLeading(line_height);

            contentStream.newLineAtOffset(margin, yPosition);

            for (PurchaseOrderDTO dto : data) {
                if (yPosition < 50) {
                    contentStream.endText();
                    contentStream.close();
                    page = new PDPage();
                    document.addPage(page);
                    contentStream = new PDPageContentStream(document, page);
                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA, 10);
                    contentStream.setLeading(line_height);
                    yPosition = 750;
                    contentStream.newLineAtOffset(margin, yPosition);
                }

                // Show data
                contentStream.showText(dto.getOrderId());
                contentStream.newLineAtOffset(80, 0);
                contentStream.showText(dto.getVendorName().length() > 18 ? dto.getVendorName().substring(0, 15) + "..." : dto.getVendorName());
                contentStream.newLineAtOffset(120, 0);
                contentStream.showText(dto.getOrderDate().toString());
                contentStream.newLineAtOffset(70, 0);
                contentStream.showText(String.valueOf(dto.getItemCount()));
                contentStream.newLineAtOffset(60, 0);
                contentStream.showText(String.format("$%.2f", dto.getTotalCost()));
                contentStream.newLineAtOffset(60, 0);
                contentStream.showText(dto.getStatus());

                // Move the cursor down for the next line
                contentStream.newLineAtOffset(-450, -line_height); // Total X offset is 80+120+70+60+60+60 = 450
                yPosition -= line_height;
            }

            contentStream.endText();
            contentStream.close();

            document.save(bos);
            return bos.toByteArray();
        }
    }


    // Original method (kept for compatibility)
    public byte[] generateActivitySummaryPdf() throws Exception {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        String content = "Library Activity Report\n\n";
        bos.write(content.getBytes());
        return bos.toByteArray();
    }
}
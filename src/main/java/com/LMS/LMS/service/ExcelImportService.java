package com.LMS.LMS.service;

import com.LMS.LMS.model.Book;
import com.LMS.LMS.repository.BookRepository;
import com.LMS.LMS.util.ExcelHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ExcelImportService {

    @Autowired
    private BookRepository bookRepository;

    /**
     * Requirement 9: Acquisition & Inventory Management
     * Process Excel file to import books along with physical shelf mapping.
     */
    public void saveBooksFromExcel(MultipartFile file) {
        try {
            // CRITICAL STEP 1: Parse the file.
            // The ExcelHelper.excelToBooks method must be updated to handle the new columns.
            List<Book> books = ExcelHelper.excelToBooks(file.getInputStream());

            if (books.isEmpty()) {
                throw new IllegalArgumentException("The uploaded Excel file contains no valid book data rows.");
            }

            // 1. Finalize Book Data (Assign unique IDs and double-check stock)
            books.forEach(book -> {
                // Requirement 1: Assign unique user-facing ID
                if (book.getBookId() == null || book.getBookId().isEmpty()) {
                    book.setBookId("BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                }

                // Initialize available stock to match total stock for new imports
                book.setAvailableStock(book.getTotalStock());
            });

            // 2. Save all books to MongoDB (Bulk insertion)
            bookRepository.saveAll(books);
            System.out.println("Successfully imported " + books.size() + " books with shelf mapping.");

        } catch (IOException e) {
            System.err.println("FATAL I/O ERROR: " + e.getMessage());
            throw new RuntimeException("Failed to read Excel file stream: " + e.getMessage(), e);

        } catch (RuntimeException e) {
            System.err.println("EXCEL DATA PROCESSING ERROR: " + e.getMessage());
            throw new RuntimeException("Excel data validation failed. Ensure 'Shelf Code' and 'Rack Number' columns exist: " + e.getMessage(), e);
        }
    }
}
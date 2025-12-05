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
    BookRepository bookRepository;

    public void saveBooksFromExcel(MultipartFile file) {

        try {
            // CRITICAL STEP 1: Process the InputStream to get a list of Book objects
            // This is where POI processing happens, which can throw RuntimeExceptions (e.g., data type mismatch)
            List<Book> books = ExcelHelper.excelToBooks(file.getInputStream());

            // Check if any data was parsed before proceeding
            if (books.isEmpty()) {
                System.out.println("Excel parsed successfully, but no valid rows with data found.");
                throw new IllegalArgumentException("The uploaded Excel file contains no valid book data rows.");
            }

            // 1. Assign unique bookId (Requirement 1)
            books.forEach(book -> {
                // Generate and assign the unique ID
                book.setBookId("BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            });

            // 2. Save all books to MongoDB
            bookRepository.saveAll(books);
            System.out.println("Successfully imported and saved " + books.size() + " books to MongoDB.");

        } catch (IOException e) {
            // Catches file I/O errors (e.g., inability to read the file stream)
            System.err.println("FATAL I/O ERROR during Excel import: " + e.getMessage());
            throw new RuntimeException("Failed to read Excel file stream: " + e.getMessage(), e);

        } catch (RuntimeException e) {
            // Catches errors thrown by ExcelHelper (parsing issues like NumberFormatException)
            System.err.println("EXCEL DATA PROCESSING ERROR: " + e.getMessage());
            // Re-throw with context to inform the Controller/Frontend
            throw new RuntimeException("Excel data validation failed. Check cell formats or required columns: " + e.getMessage(), e);
        }
    }
}
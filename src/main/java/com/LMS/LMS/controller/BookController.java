package com.LMS.LMS.controller;

import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.Reservation;
import com.LMS.LMS.service.BookService;
import com.LMS.LMS.service.ExcelImportService;
import com.LMS.LMS.service.ReservationService;
import com.LMS.LMS.util.ExcelHelper;
import org.springframework  .beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.Workbook; // Only need this one import
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class BookController {

    @Autowired
    BookService bookService;

    @Autowired
    ExcelImportService excelImportService;

    @Autowired
    ReservationService reservationService;

    // --- ADMIN Endpoints (Role: ADMIN) ---

    // ADMIN Endpoint: Download Excel Template
    // ADMIN Endpoint: Download Excel Template
    @GetMapping("/admin/books/download-template")
    public ResponseEntity<byte[]> downloadExcelTemplate() {
        String filename = "LMS_Book_Inventory_Template.xlsx";

        try {
            // 1. Get the final, closed file content as a byte array
            byte[] bytes = ExcelHelper.generateBookTemplateBytes(); // <--- CALL THE NEW METHOD

            HttpHeaders headers = new HttpHeaders();

            // 2. Set necessary headers
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(bytes.length);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            // 3. Return the response
            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);

        } catch (RuntimeException e) { // Catch the RuntimeException thrown by the helper
            System.err.println("Error downloading Excel template: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // Requirement 1: Upload Excel and initialize stock
    @PostMapping("/admin/books/import-excel")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        String message;

        if (ExcelHelper.hasExcelFormat(file)) {
            try {
                excelImportService.saveBooksFromExcel(file);
                message = "Uploaded the book inventory file successfully: " + file.getOriginalFilename();
                return ResponseEntity.status(HttpStatus.OK).body(message);
            } catch (Exception e) {
                // Log the exception details
                message = "Could not upload the file: " + file.getOriginalFilename() + "! Error: " + e.getMessage();
                return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(message);
            }
        }
        message = "Please upload an Excel file (*.xlsx)!";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
    }

    // CREATE (Add New Book Manually)
    @PostMapping("/admin/books")
    public ResponseEntity<Book> addBook(@RequestBody Book book) {
        Book newBook = bookService.createBook(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(newBook);
    }

    // READ (Get single book by ID - for management page)
    @GetMapping("/admin/books/{bookId}")
    public ResponseEntity<Book> getBookById(@PathVariable String bookId) {
        Book book = bookService.getBookByBookId(bookId);
        return ResponseEntity.ok(book);
    }

    // UPDATE
    @PutMapping("/admin/books/{bookId}")
    public ResponseEntity<Book> updateBook(@PathVariable String bookId, @RequestBody Book bookDetails) {
        Book updatedBook = bookService.updateBook(bookId, bookDetails);
        return ResponseEntity.ok(updatedBook);
    }

    // DELETE
    @DeleteMapping("/admin/books/{bookId}")
    public ResponseEntity<Void> deleteBook(@PathVariable String bookId) {
        bookService.deleteBook(bookId);
        return ResponseEntity.noContent().build();
    }
    // --- Shared Endpoints (Public/Student Access) ---

    // Requirement 6: Get all available books (Public access)
    @GetMapping("/books/available")
    public ResponseEntity<List<Book>> getAvailableBooks() {
        List<Book> availableBooks = bookService.getAllAvailableBooks();
        return ResponseEntity.ok(availableBooks);
    }

    // Requirement 2: Search any book by keyword (Public/Student access)
    @GetMapping("/books/search")
    public ResponseEntity<List<Book>> searchBooks(@RequestParam String keyword) {
        List<Book> books = bookService.searchBooks(keyword);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/admin/books/search")
    public ResponseEntity<List<Book>> searchAllBooksAdmin(@RequestParam(required = false) String keyword) {
        // This calls the BookService's general search method, which searches across all books
        List<Book> books = bookService.searchBooks(keyword);
        return ResponseEntity.ok(books);
    }

    // --- STUDENT Endpoints (Role: STUDENT) ---

    // Requirement 7: Student places a reservation
    @PostMapping("/student/books/reserve/{bookId}")
    public ResponseEntity<Reservation> placeReservation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String bookId) {

        // Use username as studentId for authenticated students
        String studentId = userDetails.getUsername();
        Reservation reservation = reservationService.placeReservation(bookId, studentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }
}
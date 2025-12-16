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
import org.springframework.security.access.prepost.PreAuthorize; // Added PreAuthorize import
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/books") // Base mapping for admin book functions
@PreAuthorize("hasAuthority('ROLE_ADMIN')") // Set default security for the admin base path
public class BookController {

    @Autowired
    BookService bookService;

    @Autowired
    ExcelImportService excelImportService;

    @Autowired
    ReservationService reservationService;

    // --- ADMIN Endpoints (Role: ADMIN) ---

    // ADMIN Endpoint: Download Excel Template (URL: /api/v1/admin/books/download-template)
    // NOTE: This endpoint inherits @PreAuthorize("hasAuthority('ROLE_ADMIN')") from the class level
    @GetMapping("/download-template")
    public ResponseEntity<byte[]> downloadExcelTemplate() {
        String filename = "LMS_Book_Inventory_Template.xlsx";

        try {
            // 1. Get the final, closed file content as a byte array
            byte[] bytes = ExcelHelper.generateBookTemplateBytes(); // CRITICAL: Ensure this helper method is working

            HttpHeaders headers = new HttpHeaders();

            // 2. Set necessary headers
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(bytes.length);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            // 3. Return the response
            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);

        } catch (Exception e) { // Catch broader exception if helper throws checked or unchecked
            System.err.println("Error downloading Excel template: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Requirement 1: Upload Excel and initialize stock (URL: /api/v1/admin/books/import-excel)
    @PostMapping("/import-excel")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        String message;

        if (ExcelHelper.hasExcelFormat(file)) {
            try {
                excelImportService.saveBooksFromExcel(file);
                message = "Uploaded the book inventory file successfully: " + file.getOriginalFilename();
                return ResponseEntity.status(HttpStatus.OK).body(message);
            } catch (Exception e) {
                message = "Could not upload the file: " + file.getOriginalFilename() + "! Error: " + e.getMessage();
                return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(message);
            }
        }
        message = "Please upload an Excel file (*.xlsx)!";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
    }

    // CREATE (Add New Book Manually) (URL: /api/v1/admin/books)
    @PostMapping // NOTE: Removed redundant '/admin/books' from mapping since it's in the RequestMapping
    public ResponseEntity<Book> addBook(@RequestBody Book book) {
        Book newBook = bookService.createBook(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(newBook);
    }

    // READ (Get single book by ID - for management page) (URL: /api/v1/admin/books/{bookId})
    @GetMapping("/{bookId}") // NOTE: Removed redundant '/admin/books'
    public ResponseEntity<Book> getBookById(@PathVariable String bookId) {
        Book book = bookService.getBookByBookId(bookId);
        return ResponseEntity.ok(book);
    }

    // UPDATE (URL: /api/v1/admin/books/{bookId})
    @PutMapping("/{bookId}") // NOTE: Removed redundant '/admin/books'
    public ResponseEntity<Book> updateBook(@PathVariable String bookId, @RequestBody Book bookDetails) {
        Book updatedBook = bookService.updateBook(bookId, bookDetails);
        return ResponseEntity.ok(updatedBook);
    }

    // DELETE (URL: /api/v1/admin/books/{bookId})
    @DeleteMapping("/{bookId}") // NOTE: Removed redundant '/admin/books'
    public ResponseEntity<Void> deleteBook(@PathVariable String bookId) {
        bookService.deleteBook(bookId);
        return ResponseEntity.noContent().build();
    }

    // ADMIN search (URL: /api/v1/admin/books/search)
    @GetMapping("/search") // NOTE: Kept /search for clarity
    public ResponseEntity<List<Book>> searchAllBooksAdmin(@RequestParam(required = false) String keyword) {
        List<Book> books = bookService.searchBooks(keyword);
        return ResponseEntity.ok(books);
    }

    // --- Shared/Student Endpoints (These need individual mapping to override the class @RequestMapping) ---

    // Get all available books (Public access) (URL: /api/v1/books/available)
    // NOTE: This endpoint uses the root URL to be accessible by students/public users
    @GetMapping("/api/v1/books/available") // Full path required to override class mapping
    @PreAuthorize("permitAll()") // Allow public access (or ROLE_STUDENT/ROLE_ADMIN)
    public ResponseEntity<List<Book>> getAvailableBooks() {
        List<Book> availableBooks = bookService.getAllAvailableBooks();
        return ResponseEntity.ok(availableBooks);
    }

    // Search any book by keyword (Public/Student access) (URL: /api/v1/books/search)
    @GetMapping("/api/v1/books/search") // Full path required to override class mapping
    @PreAuthorize("permitAll()") // Allow public access
    public ResponseEntity<List<Book>> searchBooks(@RequestParam String keyword) {
        List<Book> books = bookService.searchBooks(keyword);
        return ResponseEntity.ok(books);
    }


    // Requirement 7: Student places a reservation (URL: /api/v1/student/books/reserve/{bookId})
    @PostMapping("/api/v1/student/books/reserve/{bookId}") // Full path required
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Reservation> placeReservation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String bookId) {

        String studentId = userDetails.getUsername();
        Reservation reservation = reservationService.placeReservation(bookId, studentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }
}
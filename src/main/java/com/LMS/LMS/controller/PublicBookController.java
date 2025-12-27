package com.LMS.LMS.controller;

import com.LMS.LMS.model.Book;
import com.LMS.LMS.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/books") // Shared public path
public class PublicBookController {

    @Autowired
    private BookService bookService;

    /**
     * GET /api/v1/books/available
     * (Renamed concept: "Student Catalog")
     * Returns ALL books (including stock=0) so students can Place Hold.
     */
    @GetMapping("/available")
    public ResponseEntity<List<Book>> getStudentCatalog(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isEmpty()) {
            // Re-use your existing search logic if you have it
            return ResponseEntity.ok(bookService.searchBooks(keyword));
        }
        return ResponseEntity.ok(bookService.getAllBooksForCatalog());
    }

    // Endpoint for viewing details of a specific book (needed for Student View)
    @GetMapping("/{bookId}")
    public ResponseEntity<Book> getBookDetail(@PathVariable String bookId) {
        return ResponseEntity.ok(bookService.getBookByBookId(bookId));
    }
}
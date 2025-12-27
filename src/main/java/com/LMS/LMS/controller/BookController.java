package com.LMS.LMS.controller;

import com.LMS.LMS.model.Book;
import com.LMS.LMS.service.BookService;
import com.LMS.LMS.service.ExcelImportService;
import com.LMS.LMS.util.ExcelHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/books")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class BookController {

    @Autowired
    BookService bookService;

    @Autowired
    ExcelImportService excelImportService;

    @GetMapping("/download-template")
    public ResponseEntity<byte[]> downloadExcelTemplate() {
        String filename = "LMS_Book_Inventory_Template.xlsx";
        try {
            byte[] bytes = ExcelHelper.generateBookTemplateBytes();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(bytes.length);

            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{bookId}")
    public ResponseEntity<Book> getBookById(@PathVariable String bookId) {
        return ResponseEntity.ok(bookService.getBookByBookId(bookId));
    }

    @PostMapping("/import-excel")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        if (ExcelHelper.hasExcelFormat(file)) {
            try {
                excelImportService.saveBooksFromExcel(file);
                return ResponseEntity.ok("Uploaded successfully: " + file.getOriginalFilename());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body("Upload failed: " + e.getMessage());
            }
        }
        return ResponseEntity.badRequest().body("Please upload an Excel file!");
    }

    @PostMapping
    public ResponseEntity<Book> addBook(@RequestBody Book book) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.createBook(book));
    }

    @PutMapping("/{bookId}")
    public ResponseEntity<Book> updateBook(@PathVariable String bookId, @RequestBody Book bookDetails) {
        return ResponseEntity.ok(bookService.updateBook(bookId, bookDetails));
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<Void> deleteBook(@PathVariable String bookId) {
        bookService.deleteBook(bookId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchAllBooksAdmin(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(bookService.searchBooks(keyword));
    }
}
package com.LMS.LMS.service;

import com.LMS.LMS.exception.BookNotFoundException;
import com.LMS.LMS.exception.ResourceNotFoundException;
import com.LMS.LMS.model.Book;
import com.LMS.LMS.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    // Requirement 6: Get all available books
    public List<Book> getAllAvailableBooks() {
        return bookRepository.findAll().stream()
                .filter(Book::isAvailable)
                .toList();
    }

    public List<Book> getAllBooksForCatalog() {
        // Return ALL books so students can see and reserve out-of-stock items
        return bookRepository.findAll();
    }

    // Requirement 2: Search books by keyword (title/author/ISBN/BookId)
    public List<Book> searchBooks(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return bookRepository.findAll();
        }

        // Try searching by the unique BookId first
        return bookRepository.findByBookId(keyword)
                .map(List::of)
                .orElseGet(() ->
                        // Fallback to title/author search
                        bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(keyword, keyword)
                );
    }


    // CREATE
    public Book createBook(Book book) {
        if (bookRepository.findByBookId(book.getBookId()).isPresent()) {
            throw new IllegalArgumentException("Book ID already exists in the system.");
        }
        // Generate unique ID and set initial stock
        book.setBookId("BK-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        book.setAvailableStock(book.getTotalStock());
        return bookRepository.save(book);
    }

    // READ (Helper already exists: public Book getBookByBookId(String bookId))

    // UPDATE
    public Book updateBook(String bookId, Book bookDetails) {
        // 1. Fetch the existing book
        Book existingBook = bookRepository.findByBookId(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));

        // 2. Calculate the difference in stock (CRITICAL FIX HERE)
        long stockChange = bookDetails.getTotalStock() - existingBook.getTotalStock();

        // 3. Update availableStock based on the change
        if (stockChange != 0) {
            // Only update availableStock if the totalStock changed
            existingBook.setAvailableStock(existingBook.getAvailableStock() + stockChange);
        }

        // 4. Update core fields
        existingBook.setTotalStock(bookDetails.getTotalStock());
        existingBook.setTitle(bookDetails.getTitle());
        // ... (update other fields) ...

        return bookRepository.save(existingBook);
    }

    // DELETE
    public void deleteBook(String bookId) {
        Book book = getBookByBookId(bookId);
        // Important: Should ideally check if the book is currently borrowed before deleting
        if (book.getAvailableStock() != book.getTotalStock()) {
            throw new IllegalStateException("Cannot delete book. Some copies are currently issued or reserved.");
        }
        bookRepository.delete(book);
    }


    // Helper to get a book by its unique system ID
    public Book getBookByBookId(String bookId) {
        return bookRepository.findByBookId(bookId)
                .orElseThrow(() -> new BookNotFoundException("Book not found with ID: " + bookId));
    }

    // Helper for transactional updates (used by BorrowService)
    public Book updateBookStock(String bookId, long delta) { // FIX 1: Change delta to long
        Book book = getBookByBookId(bookId);

        // FIX 2: Change the local variable to long
        long newAvailableStock = book.getAvailableStock() + delta;

        // Validation
        if (newAvailableStock < 0) {
            throw new IllegalStateException("Cannot issue book, stock would fall below zero.");
        }

        // Check against total stock (both are now long)
        if (newAvailableStock > book.getTotalStock()) {
            newAvailableStock = book.getTotalStock(); // Prevent stock overflow on return
        }

        book.setAvailableStock(newAvailableStock);
        return bookRepository.save(book);
    }

    // =========================================================================
    // NEW LOGIC FOR ACQUISITIONS (Requirement 9)
    // =========================================================================

    /**
     * Adds new copies of a book to the inventory.
     * If the book exists (by ISBN), it updates the stock. If not, it creates a new Book record.
     * @param isbn The International Standard Book Number
     * @param title The title (used for new creation)
     * @param quantity The number of copies received
     * @return The updated or newly created Book object.
     */
    public Book addStockFromAcquisition(String isbn, String title, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity to add must be positive.");
        }

        Optional<Book> existingBookOpt = bookRepository.findByIsbn(isbn);

        if (existingBookOpt.isPresent()) {
            // Case 1: Book already exists (Update Stock)
            Book existingBook = existingBookOpt.get();
            existingBook.setTotalStock(existingBook.getTotalStock() + quantity);
            existingBook.setAvailableStock(existingBook.getAvailableStock() + quantity);
            return bookRepository.save(existingBook);
        } else {
            // Case 2: New book title (Create New Book)
            Book newBook = new Book();
            newBook.setTitle(title);
            newBook.setIsbn(isbn);
            newBook.setTotalStock(quantity);
            newBook.setAvailableStock(quantity);

            // Note: Other fields (Author, Category, Price) should be set in a proper DTO
            // if this method were called directly, but for now we'll rely on the defaults/nulls.

            // Assign a new internal BookId
            newBook.setBookId("BK-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());

            return bookRepository.save(newBook);
        }
    }
}
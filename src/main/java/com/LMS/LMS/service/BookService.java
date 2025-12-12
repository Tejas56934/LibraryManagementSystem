package com.LMS.LMS.service;


import com.LMS.LMS.exception.BookNotFoundException;
import com.LMS.LMS.model.Book;
import com.LMS.LMS.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

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
            throw new IllegalArgumentException("Book ID already exists.");
        }
        // Generate unique ID and set initial stock
        book.setBookId("BK-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        book.setAvailableStock(book.getTotalStock());
        return bookRepository.save(book);
    }

    // READ (Helper already exists: public Book getBookByBookId(String bookId))

    // UPDATE
    public Book updateBook(String bookId, Book bookDetails) {
        Book existingBook = getBookByBookId(bookId);

        // Calculate change in stock to update availableStock correctly
        int stockChange = bookDetails.getTotalStock() - existingBook.getTotalStock();

        existingBook.setTitle(bookDetails.getTitle());
        existingBook.setAuthor(bookDetails.getAuthor());
        existingBook.setIsbn(bookDetails.getIsbn());
        existingBook.setCategory(bookDetails.getCategory());
        existingBook.setPrice(bookDetails.getPrice());

        // Update total stock and adjust available stock accordingly
        existingBook.setTotalStock(bookDetails.getTotalStock());
        existingBook.setAvailableStock(existingBook.getAvailableStock() + stockChange);

        if (existingBook.getAvailableStock() < 0) {
            existingBook.setAvailableStock(0); // Should ideally never be negative
        }

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
    public Book updateBookStock(String bookId, int delta) {
        Book book = getBookByBookId(bookId);
        int newAvailableStock = book.getAvailableStock() + delta;

        if (newAvailableStock < 0) {
            throw new IllegalStateException("Cannot issue book, stock is zero.");
        }
        if (newAvailableStock > book.getTotalStock()) {
            newAvailableStock = book.getTotalStock(); // Prevent stock overflow on return
        }

        book.setAvailableStock(newAvailableStock);
        return bookRepository.save(book);
    }
}
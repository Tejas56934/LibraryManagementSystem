package com.LMS.LMS.repository;

import com.LMS.LMS.model.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
// Make sure Optional is imported!

@Repository
public interface BookRepository extends MongoRepository<Book, String> {

    // Existing methods that were mentioned:
    Optional<Book> findByBookId(String bookId);

    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);

    // =========================================================================
    // FIX: METHOD REQUIRED FOR ACQUISITION SERVICE (Requirement 9)
    // =========================================================================

    /**
     * Finds a Book entity by its International Standard Book Number (ISBN).
     * This is crucial for checking if a purchased book is new or an existing title.
     */
    Optional<Book> findByIsbn(String isbn);

    // You may also need a method to search by ISBN, though the above one is for the service logic.
}
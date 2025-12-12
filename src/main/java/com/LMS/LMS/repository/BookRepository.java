package com.LMS.LMS.repository;

import com.LMS.LMS.model.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends MongoRepository<Book, String> {
    // For searching by the unique, user-facing book ID (Requirement 2)
    Optional<Book> findByBookId(String bookId);

    // For general search functionality
    // This allows searching across title or author (case-insensitive)
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);
}
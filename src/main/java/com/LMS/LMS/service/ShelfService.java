// backend/com/LMS/LMS/service/ShelfService.java (NEW FILE)

package com.LMS.LMS.service;

import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.Shelf;
import com.LMS.LMS.repository.BookRepository;
import com.LMS.LMS.repository.ShelfRepository;
import com.LMS.LMS.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ShelfService {

    @Autowired
    private ShelfRepository shelfRepository;

    @Autowired
    private BookRepository bookRepository;

    // --- CRUD Operations for Shelf Management (Admin Tools) ---

    public Shelf createShelf(Shelf shelf) {
        return shelfRepository.save(shelf);
    }

    public List<Shelf> getAllShelves() {
        return shelfRepository.findAll();
    }

    public Shelf getShelfByCode(String shelfCode) {
        return shelfRepository.findByShelfCode(shelfCode)
                .orElseThrow(() -> new ResourceNotFoundException("Shelf not found with code: " + shelfCode));
    }

    // --- Core "Find Book" Location Logic ---

    /**
     * Retrieves the physical map coordinates for a given book ID.
     * @param bookId The user-facing ID of the book.
     * @return The Shelf entity containing mapX and mapY coordinates.
     */
    public Shelf findBookLocation(String bookId) {
        // 1. Find the Book entity to get its shelfCode
        Optional<Book> bookOpt = bookRepository.findByBookId(bookId);

        if (bookOpt.isEmpty()) {
            throw new ResourceNotFoundException("Book not found with ID: " + bookId);
        }

        String shelfCode = bookOpt.get().getShelfCode();

        if (shelfCode == null || shelfCode.isEmpty()) {
            throw new ResourceNotFoundException("Book location not mapped. ShelfCode is missing for book: " + bookId);
        }

        // 2. Find the Shelf entity using the shelfCode to get coordinates
        return shelfRepository.findByShelfCode(shelfCode)
                .orElseThrow(() -> new ResourceNotFoundException("Shelf map coordinates not found for code: " + shelfCode));
    }

    /**
     * NOTE: For the "Find Book" navigation (like Google Maps), a full implementation
     * would include a pathfinding method here that calculates the shortest route
     * from a start point (e.g., 'Aisle Entrance') to the Shelf coordinates (mapX, mapY).
     * For now, we return the target location.
     */
}
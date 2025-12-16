// backend/com/LMS/LMS/controller/ShelfController.java (NEW FILE)

package com.LMS.LMS.controller;

import com.LMS.LMS.model.Shelf;
import com.LMS.LMS.service.ShelfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/shelf")

public class ShelfController {

    @Autowired
    private ShelfService shelfService;

    // --- Public/Student Endpoint (Used by the "Find Book" feature) ---

    /**
     * GET /api/v1/shelf/location/{bookId}
     * Retrieves the map coordinates for a specific book. Accessible by all authenticated users.
     */
    @GetMapping("/location/{bookId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Shelf> findBookLocation(@PathVariable String bookId) {
        Shelf location = shelfService.findBookLocation(bookId);
        return ResponseEntity.ok(location);
    }

    // --- Admin Endpoints (For setting up and maintaining the map) ---

    /**
     * POST /api/v1/shelf/admin (Creates a new shelf definition)
     */
    @PostMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Shelf> createShelf(@RequestBody Shelf shelf) {
        Shelf newShelf = shelfService.createShelf(shelf);
        return ResponseEntity.status(HttpStatus.CREATED).body(newShelf);
    }

    /**
     * GET /api/v1/shelf/admin (Retrieves all shelf definitions for map rendering)
     */
    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Shelf>> getAllShelves() {
        List<Shelf> shelves = shelfService.getAllShelves();
        return ResponseEntity.ok(shelves);
    }
}
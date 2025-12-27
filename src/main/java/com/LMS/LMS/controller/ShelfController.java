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
@RequestMapping("/api/v1/shelf") // Base path is now shared
public class ShelfController {

    @Autowired
    private ShelfService shelfService;

    /**
     * SHARED: Allows Students and Admins to find a book's coordinates.
     */
    @GetMapping("/location/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Shelf> findBookLocation(@PathVariable String bookId) {
        Shelf location = shelfService.findBookLocation(bookId);
        return ResponseEntity.ok(location);
    }

    /**
     * SHARED: Allows both roles to load the library map layout.
     */
    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Shelf>> getAllShelves() {
        List<Shelf> shelves = shelfService.getAllShelves();
        return ResponseEntity.ok(shelves);
    }

    /**
     * ADMIN ONLY: Restricted to Librarian role for map setup.
     */
    @PostMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Shelf> createShelf(@RequestBody Shelf shelf) {
        Shelf newShelf = shelfService.createShelf(shelf);
        return ResponseEntity.status(HttpStatus.CREATED).body(newShelf);
    }
}
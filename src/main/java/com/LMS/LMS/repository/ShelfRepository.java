// backend/com/LMS/LMS/repository/ShelfRepository.java (NEW FILE)

package com.LMS.LMS.repository;

import com.LMS.LMS.model.Shelf;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShelfRepository extends MongoRepository<Shelf, String> {

    /**
     * Allows searching for the Shelf entity using the unique shelfCode.
     */
    Optional<Shelf> findByShelfCode(String shelfCode);
}
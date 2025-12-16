package com.LMS.LMS.repository;

import com.LMS.LMS.model.Vendor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for CRUD operations on the Vendor collection.
 */
@Repository
public interface VendorRepository extends MongoRepository<Vendor, String> {

    // Spring Data MongoDB automatically provides core CRUD methods (save, findById, findAll, etc.)
}
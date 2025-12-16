package com.LMS.LMS.repository;

import com.LMS.LMS.model.PurchaseOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for CRUD operations on the PurchaseOrder collection.
 */
@Repository
public interface PurchaseOrderRepository extends MongoRepository<PurchaseOrder, String> {

    // You can add custom derived query methods here, e.g.:
    // List<PurchaseOrder> findByVendorId(String vendorId);
    // List<PurchaseOrder> findByStatus(PurchaseOrder.PurchaseOrderStatus status);
}
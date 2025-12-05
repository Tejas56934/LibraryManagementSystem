package com.LMS.LMS.repository;


import com.LMS.LMS.model.BorrowRecord;
import com.LMS.LMS.model.BorrowStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BorrowRepository extends MongoRepository<BorrowRecord, String> {

    List<BorrowRecord> findByStatus(BorrowStatus status);

    // ✅ NEW METHOD: Find records whose status is IN a given list (e.g., ISSUED, OVERDUE)
    List<BorrowRecord> findByStatusIn(List<BorrowStatus> statuses);

    List<BorrowRecord> findByBookIdAndStatus(String bookId, BorrowStatus status);

    List<BorrowRecord> findByStudentId(String studentId);
}

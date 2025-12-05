package com.LMS.LMS.config; // Assuming this is the correct package path

import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.Student;
import com.LMS.LMS.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.domain.Sort.Direction; // Used for index direction (ASC/DESC)
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index; // Used to define the index object
import org.springframework.stereotype.Component;

@Component
public class MongoIndexInitializer implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Initializing MongoDB unique indexes...");

        // This process is essential to guarantee the collection structure before the first write.

        // --- 1. Book Collection Indexes ---
        mongoTemplate.indexOps(Book.class).ensureIndex(
                new Index().on("bookId", Direction.ASC).unique()
        );

        // --- 2. Student Collection Indexes ---
        mongoTemplate.indexOps(Student.class).ensureIndex(
                new Index().on("studentId", Direction.ASC).unique()
        );

        // --- 3. User Collection Indexes (for login/username) ---
        mongoTemplate.indexOps(User.class).ensureIndex(
                new Index().on("username", Direction.ASC).unique()
        );

        System.out.println("MongoDB unique indexes ensured.");
    }
}
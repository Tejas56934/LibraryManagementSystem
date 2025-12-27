package com.LMS.LMS.config;

import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.Transaction;
import com.LMS.LMS.model.User;
import com.LMS.LMS.repository.BookRepository;
import com.LMS.LMS.repository.TransactionRepository;
import com.LMS.LMS.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only run if no transactions exist
        if (transactionRepository.count() > 0) {
            System.out.println("✅ Transactions already exist. Skipping data seeding.");
            return;
        }

        System.out.println("🚀 Seeding Transaction Data for AI Testing...");

        List<Book> books = bookRepository.findAll();
        List<User> users = userRepository.findAll();

        if (books.isEmpty() || users.isEmpty()) {
            System.out.println("❌ Error: Need Books and Users to create transactions!");
            return;
        }

        Random random = new Random();

        // Create 25 Dummy Transactions
        for (int i = 0; i < 25; i++) {
            Book book = books.get(random.nextInt(books.size()));
            User user = users.get(random.nextInt(users.size()));

            Transaction txn = new Transaction();
            txn.setBookId(book.getId()); // Or book.getBookId() depending on your logic
            txn.setBookTitle(book.getTitle());
            txn.setUsername(user.getUsername());

            // Randomize Status: 0=Returned, 1=Issued (On Time), 2=Overdue (Late)
            int scenario = random.nextInt(3);
            LocalDateTime now = LocalDateTime.now();

            if (scenario == 0) {
                // RETURNED (History)
                txn.setStatus("RETURNED");
                txn.setIssueDate(now.minusDays(20));
                txn.setDueDate(now.minusDays(6));
                txn.setReturnDate(now.minusDays(5));
                txn.setFineAmount(0);
                txn.setFinePaid(true);

            } else if (scenario == 1) {
                // ISSUED (Currently borrowed, not late)
                txn.setStatus("ISSUED");
                txn.setIssueDate(now.minusDays(2));
                txn.setDueDate(now.plusDays(12)); // Due in future
                txn.setReturnDate(null);
                txn.setFineAmount(0);
                txn.setFinePaid(false);

            } else {
                // OVERDUE (Late!) - Critical for AI Financial Analysis
                txn.setStatus("ISSUED"); // Still out
                txn.setIssueDate(now.minusDays(30)); // Borrowed long ago
                txn.setDueDate(now.minusDays(10));   // Due 10 days ago
                txn.setReturnDate(null);

                // $1 fine per day late
                txn.setFineAmount(10.0);
                txn.setFinePaid(false);
            }

            transactionRepository.save(txn);
        }

        System.out.println("✅ Successfully created 25 fake transactions!");
    }
}
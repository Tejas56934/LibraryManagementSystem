package com.LMS.LMS.service;

import com.LMS.LMS.model.*;
import com.LMS.LMS.repository.AlertRepository;
import com.LMS.LMS.repository.BorrowRepository;
import com.LMS.LMS.repository.StudentRepository;
import com.LMS.LMS.util.EmailUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private static final long REMINDER_WINDOW_HOURS = 24; // Send reminder if due within 24 hours

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EmailUtil emailUtil;

    @Autowired
    private AlertRepository alertRepository;

    // --- Scheduled Task (Runs every 5 seconds for testing) ---
    @Scheduled(fixedRate = 5000)
    public void checkDueDatesAndSendAlerts() {
        // This process requires @EnableScheduling on the main application class.
        System.out.println("Running scheduled check for active loans and alerts: " + LocalDateTime.now().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm:ss")));

        // Find only loans currently issued (not returned/canceled)
        List<BorrowRecord> issuedRecords = borrowRepository.findByStatus(BorrowStatus.ISSUED);

        for (BorrowRecord record : issuedRecords) {
            long hoursUntilDue = ChronoUnit.HOURS.between(LocalDateTime.now(), record.getDueDate());

            // --- 1. OVERDUE CHECK ---
            if (hoursUntilDue < 0) {
                // If the status is ISSUED but the due date is in the past, it's now OVERDUE.
                sendOverdueNotification(record);
            }
            // --- 2. REMINDER CHECK ---
            else if (hoursUntilDue <= REMINDER_WINDOW_HOURS && !record.isNotificationSent()) {
                // Send reminder if due soon AND we haven't sent the reminder yet.
                sendReminderNotification(record, hoursUntilDue);
            }
        }
    }

    // --- Core Notification Logic ---

    /**
     * Sends external and internal alerts for books that are past the due date.
     */
    private void sendOverdueNotification(BorrowRecord record) {
        Optional<Student> studentOpt = studentRepository.findByStudentId(record.getStudentId());

        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");

            // 1. Update status and save (CRITICAL)
            record.setStatus(BorrowStatus.OVERDUE);
            borrowRepository.save(record);

            String dueString = record.getDueDate().format(formatter);
            String subject = "🚨 URGENT: Your library book is OVERDUE!";
            String body = String.format(
                    "Dear %s,\n\nThe book (ID: %s) was due on %s. Please return it immediately to avoid penalties.",
                    student.getName(), record.getBookId(), dueString
            );

            // 2. External Alerts
            emailUtil.sendEmail(student.getEmail(), subject, body);
            emailUtil.sendExternalNotification(student.getPhoneNumber(), "ALERT: Book ID " + record.getBookId() + " is OVERDUE.");

            // 3. Internal Librarian Alert
            saveLibrarianAlert(record, "OVERDUE", dueString);
        }
    }

    /**
     * Sends external and internal alerts for books nearing their due date.
     */
    private void sendReminderNotification(BorrowRecord record, long hoursUntilDue) {
        Optional<Student> studentOpt = studentRepository.findByStudentId(record.getStudentId());

        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();

            String subject = "Reminder: Your library book is due soon!";
            String body = String.format(
                    "Dear %s,\n\nThis is a reminder that the book (ID: %s) is due in approximately %d hours.",
                    student.getName(), record.getBookId(), hoursUntilDue
            );

            // 1. External Alerts
            emailUtil.sendEmail(student.getEmail(), subject, body);
            emailUtil.sendExternalNotification(student.getPhoneNumber(), "Reminder: Book ID " + record.getBookId() + " due soon.");

            // 2. Internal Librarian Alert
            saveLibrarianAlert(record, "REMINDER", hoursUntilDue + " hours");

            // 3. CRITICAL: Mark as sent to prevent repeated reminders every 5 seconds
            record.setNotificationSent(true);
            borrowRepository.save(record);
        }
    }

    /**
     * Saves a persistent alert for the Librarian's AlertsPage.
     */
    private void saveLibrarianAlert(BorrowRecord record, String type, String detail) {
        String message;

        if (type.equals("OVERDUE")) {
            message = String.format("URGENT: Book ID %s is PAST DUE (%s).", record.getBookId(), detail);
        } else if (type.equals("REMINDER")) {
            message = String.format("REMINDER: Book ID %s is due in %s.", record.getBookId(), detail);
        } else {
            // This is likely the spot where the compiler is failing.
            // The original code was: message = String.format("CRITICAL: Book ID %s stock is low.", record.getRelatedId());
            // Since we are passing a BorrowRecord, we can only access its fields.
            message = String.format("CRITICAL: Book ID %s stock is low.", record.getBookId());
        }

        LibrarianAlert alert = new LibrarianAlert();
        alert.setType(type);
        alert.setMessage(message);

        // ✅ FIX: Use a valid field from the BorrowRecord, such as bookId, for the related ID.
        alert.setRelatedId(record.getBookId());

        alertRepository.save(alert);
    }

    // --- Other Triggers ---

    public void triggerLowStockAlert(String bookId, int currentStock) {
        String message = String.format("CRITICAL: Book ID %s stock is low. Only %d copies remain. ACTION REQUIRED.", bookId, currentStock);

        LibrarianAlert alert = new LibrarianAlert();
        alert.setType("LOW_STOCK");
        alert.setMessage(message);
        alert.setRelatedId(bookId);
        alertRepository.save(alert);

        System.out.println("LIBRARIAN AI ALERT SAVED: " + message);
    }

    public void triggerReservationAlert(Reservation reservation) {
        // ... (Logic remains the same, but it should also save a LibrarianAlert here)
        System.out.println("LIBRARIAN ALERT: Reservation fulfilled for student " + reservation.getStudentId());
    }
}
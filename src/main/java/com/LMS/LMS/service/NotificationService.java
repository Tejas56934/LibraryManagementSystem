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
import java.time.ZoneId; // Needed for Instant to LocalDateTime conversion
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
            else if (hoursUntilDue > 0 && hoursUntilDue <= REMINDER_WINDOW_HOURS && !record.isNotificationSent()) {
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
            // Default message for generic alerts not handled above
            message = String.format("ALERT: Borrow record %s related notification.", record.getBookId());
        }

        LibrarianAlert alert = new LibrarianAlert();
        alert.setType(type);
        alert.setMessage(message);
        alert.setRelatedId(record.getBookId());
        alertRepository.save(alert);
    }

    // --- NEW METHOD FOR REQUIREMENT 7 (RESERVATION) ---

    /**
     * Sends notification to the student that their reserved book is READY FOR PICKUP.
     * Called by ReservationService.processReturnedBook().
     */
    public void sendReservationReadyNotification(Reservation reservation) {
        Optional<Student> studentOpt = studentRepository.findByStudentId(reservation.getStudentId());

        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();

            // Format expiry time from Instant to a user-friendly string
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, HH:mm");
            LocalDateTime localExpiry = reservation.getExpiryDate().atZone(ZoneId.systemDefault()).toLocalDateTime();
            String expiryString = localExpiry.format(formatter);

            String subject = "✅ Your Reserved Book is Ready for Pickup!";
            String body = String.format(
                    "Dear %s,\n\nThe book you reserved (ID: %s) is now available for pickup at the library desk. " +
                            "Please pick it up before the hold expires on %s. If not picked up by this time, your reservation will be passed to the next waiting student.",
                    student.getName(), reservation.getBookId(), expiryString
            );

            // 1. External Alerts
            emailUtil.sendEmail(student.getEmail(), subject, body);
            emailUtil.sendExternalNotification(student.getPhoneNumber(), "READY: Reserved book (ID: " + reservation.getBookId() + ") is ready for pickup!");

            // 2. Internal Librarian Alert
            String alertMessage = String.format(
                    "Reservation Ready: Book ID %s is held for student %s. Expires: %s",
                    reservation.getBookId(), student.getName(), expiryString
            );

            LibrarianAlert alert = new LibrarianAlert();
            alert.setType("RESERVATION_READY");
            alert.setMessage(alertMessage);
            alert.setRelatedId(reservation.getBookId());
            alertRepository.save(alert);

            System.out.println("LIBRARIAN ALERT SAVED: " + alertMessage);
        }
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

    // This method is now implicitly handled by the new sendReservationReadyNotification saving the alert.
    // However, if reservation logic needs an independent internal trigger, this placeholder remains.
    public void triggerReservationAlert(Reservation reservation) {
        // This can be used for secondary alerts if the student hasn't picked up the book and it's close to expiry.
        System.out.println("LIBRARIAN ALERT: Reservation fulfilled for student " + reservation.getStudentId());
    }
}
package com.LMS.LMS.util;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;

// CRITICAL FIX 1: Import the correct PhoneNumber class for message creation
import com.twilio.type.PhoneNumber;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value; // CRITICAL FIX 2: Needed for injecting credentials
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;


@Component
public class EmailUtil {

    // --- Injected Email Configuration ---
    @Autowired
    private JavaMailSender mailSender;

    // --- CRITICAL FIX 3: Inject Twilio Configuration using @Value ---
    @Value("${twilio.account-sid:}") // Default empty value if not found
    private String ACCOUNT_SID;

    @Value("${twilio.auth-token:}")
    private String AUTH_TOKEN;

    @Value("${twilio.phone-number:}")
    private String TWILIO_NUMBER;


    // --- 1. Email Sending Logic ---
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Error sending email to " + to + ": " + e.getMessage());
        }
    }

    // --- 2. External Notification (Twilio SMS/WhatsApp) Logic ---
    public boolean sendExternalNotification(String to, String message) {
        // If credentials are empty, revert to simulation mode
        if (TWILIO_NUMBER == null || TWILIO_NUMBER.isEmpty() || ACCOUNT_SID == null || ACCOUNT_SID.isEmpty()) {
            System.out.println("SIMULATING WhatsApp/Text notification to " + to + ": " + message + " (Twilio credentials missing)");
            return true;
        }

        try {
            // Initialize Twilio client using injected credentials
            Twilio.init(ACCOUNT_SID, AUTH_TOKEN);

            // 1. Prepare the sender number with the 'whatsapp:' prefix for WhatsApp routing
            // If you only want SMS, remove the "whatsapp:" prefix.
            String whatsAppSender = "whatsapp:" + TWILIO_NUMBER;

            // 2. Send the message (Twilio requires E.164 format for all numbers)
            Message twilioMessage = Message.creator(
                    new PhoneNumber(to),        // To number (student's phone number)
                    new PhoneNumber(whatsAppSender), // From number (Twilio WhatsApp/SMS enabled number)
                    message                     // The body of the message
            ).create();

            System.out.println("Twilio WhatsApp/SMS sent successfully. SID: " + twilioMessage.getSid());
            return true;

        } catch (Exception e) {
            System.err.println("Error sending Twilio SMS/WhatsApp to " + to + ": " + e.getMessage());
            return false;
        }
    }
}
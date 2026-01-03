package com.LMS.LMS.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*") // Allow React to access
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @PostMapping("/create-order")
    public String createOrder(@RequestBody Map<String, Object> data) {
        try {
            // 1. Initialize Razorpay Client
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            // 2. Parse Amount (Frontend sends amount in Rupees, Razorpay needs Paise)
            int amount = Integer.parseInt(data.get("amount").toString());

            // 3. Create Order Request
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount * 100); // Convert to Paise (e.g., 500 INR -> 50000 paise)
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_123456");

            // 4. Create Order
            Order order = client.orders.create(orderRequest);

            // 5. Return the Order Details to Frontend
            return order.toString();

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"Error creating payment order\"}";
        }
    }
}
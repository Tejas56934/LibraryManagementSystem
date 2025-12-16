package com.LMS.LMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.Instant;

@Data
@Document(collection = "vendors")
public class Vendor {

    @Id
    private String id;

    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private Instant createdAt = Instant.now();

    // Default constructor is required for Spring Data MongoDB
    public Vendor() {}

    // Constructor for easy creation
    public Vendor(String name, String contactPerson, String email, String phone, String address) {
        this.name = name;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }
}
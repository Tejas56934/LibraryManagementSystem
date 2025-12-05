package com.LMS.LMS.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "students")
public class Student {

    @Id
    private String id;

//    @Indexed(unique = true)
    private String studentId;

    private String name;
    private String major;

    @Indexed(unique = true)
    private String email; // For notifications (Requirement 3)

    private String phoneNumber; // For WhatsApp/Text notifications (Requirement 3)
}
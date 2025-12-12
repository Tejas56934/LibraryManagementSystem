package com.LMS.LMS.dto;

import lombok.Data;

@Data
public class FeedbackRequest {
    private String bookTitle;
    private String author;
    private String isbn;
}
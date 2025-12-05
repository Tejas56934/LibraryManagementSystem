package com.LMS.LMS.exception;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// This annotation tells Spring to return an HTTP 404 Not Found status
@ResponseStatus(HttpStatus.NOT_FOUND)
public class BookNotFoundException extends RuntimeException {

    // Constructor that accepts a custom message
    public BookNotFoundException(String message) {
        super(message);
    }
}

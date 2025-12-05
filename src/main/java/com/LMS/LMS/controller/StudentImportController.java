package com.LMS.LMS.controller;

import com.LMS.LMS.service.StudentImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/students") // Note: Base path is the same as StudentController
public class StudentImportController {

    @Autowired
    private StudentImportService studentImportService;

    // This is the endpoint the frontend hits: POST /api/v1/admin/students/import-excel
    @PostMapping("/import-excel")
    public ResponseEntity<String> importStudents(@RequestParam("file") MultipartFile file) {
        if (!file.getContentType().contains("spreadsheetml") && !file.getContentType().contains("excel")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please upload a valid Excel file (.xlsx or .xls).");
        }

        try {
            int count = studentImportService.importStudentsFromExcel(file);
            String message = String.format("Successfully imported %d new student user accounts.", count);
            return ResponseEntity.status(HttpStatus.OK).body(message);
        } catch (RuntimeException e) {
            // This is the error caught by the frontend
            String message = "Import failed: " + e.getMessage();
            // Log the detailed error to the console for debugging
            System.err.println("Student Import Failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(message);
        }
    }
}
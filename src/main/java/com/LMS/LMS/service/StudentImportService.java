package com.LMS.LMS.service;

import com.LMS.LMS.model.Student;
import com.LMS.LMS.util.ExcelHelper;
import com.LMS.LMS.util.ExcelHelper.StudentImportDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
//@Transactional
public class StudentImportService {

    // Inject the service that contains the persistence logic
    @Autowired
    private StudentService studentService;

    public int importStudentsFromExcel(MultipartFile file) {
        try {
            // 1. Parse the file into DTOs (using the helper)
            List<StudentImportDTO> studentDataList = ExcelHelper.excelToStudents(file.getInputStream());

            int studentsSavedCount = 0;

            for (StudentImportDTO dto : studentDataList) {
                try {
                    // 2. Delegate the saving and user creation to the core StudentService
                    studentService.createStudentAndUser(dto.student, dto.initialPassword);
                    studentsSavedCount++;
                } catch (IllegalArgumentException e) {
                    System.err.println("Skipping Student ID " + dto.student.getStudentId() + " due to duplicate entry: " + e.getMessage());
                }
            }

            System.out.println("Import process finished. Saved " + studentsSavedCount + " new students.");
            return studentsSavedCount;

        } catch (IOException e) {
            throw new RuntimeException("Failed to process Excel file stream: " + e.getMessage(), e);
        }
    }
}
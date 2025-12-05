package com.LMS.LMS.controller;

import com.LMS.LMS.dto.StudentRequest;
import com.LMS.LMS.model.Student;
import com.LMS.LMS.repository.StudentRepository;
import com.LMS.LMS.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.LMS.LMS.util.ExcelHelper;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/students") // Admin access only
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentRepository studentRepository;

    // ADMIN: Get all students
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    // ADMIN: Get student by ID
    @GetMapping("/{studentId}")
    public ResponseEntity<Student> getStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(studentService.getStudentByStudentId(studentId));
    }

    // ADMIN: Create a new student using StudentRequest DTO
    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody StudentRequest request) {
        Student student = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(student);
    }

    // ⭐ EXTRA ENDPOINT YOU REQUESTED
    // DIRECT INSERT USING FULL STUDENT MODEL
    @PostMapping("/addStudent")
    public ResponseEntity<?> addStudent(@RequestBody Student request) {

        Student student = new Student();
        student.setStudentId(request.getStudentId());
        student.setName(request.getName());
        student.setMajor(request.getMajor());
        student.setEmail(request.getEmail());
        student.setPhoneNumber(request.getPhoneNumber());

        studentRepository.save(student);

        return ResponseEntity.ok("Student added successfully");
    }

    // ADMIN: Update student
    @PutMapping("/{studentId}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable String studentId,
            @RequestBody StudentRequest request
    ) {
        Student student = studentService.updateStudent(studentId, request);
        return ResponseEntity.ok(student);
    }

    // ADMIN: Delete student
    @DeleteMapping("/{studentId}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String studentId) {
        studentService.deleteStudent(studentId);
        return ResponseEntity.noContent().build();
    }

    // ADMIN: Download Excel Template
    @GetMapping("/download-template")
    public ResponseEntity<byte[]> downloadStudentTemplate() {
        String filename = "LMS_Student_Roster_Template.xlsx";

        try {
            byte[] bytes = ExcelHelper.generateStudentTemplateBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(bytes.length);

            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);

        } catch (RuntimeException e) {
            System.err.println("Error generating Student Roster template: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

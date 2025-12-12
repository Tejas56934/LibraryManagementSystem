package com.LMS.LMS.service;

import com.LMS.LMS.dto.StudentRequest;
import com.LMS.LMS.exception.ResourceNotFoundException;
import com.LMS.LMS.model.Student;
import com.LMS.LMS.model.User;
import com.LMS.LMS.model.UserRole;
import com.LMS.LMS.repository.StudentRepository;
import com.LMS.LMS.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Annotation for transaction management

import java.util.List;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Helper methods (no transaction needed)
    public Student getStudentByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // ADMIN: Create a new student record (Manual single-record creation)
    // Removed @Transactional from here, as it's not strictly needed for a single save.
    public Student createStudent(StudentRequest request) {
        if (studentRepository.findByStudentId(request.getStudentId()).isPresent()) {
            throw new IllegalArgumentException("Student ID already exists.");
        }

        Student student = new Student();
        student.setStudentId(request.getStudentId());
        student.setName(request.getName());
        student.setMajor(request.getMajor());
        student.setEmail(request.getEmail());
        student.setPhoneNumber(request.getPhoneNumber());

        return studentRepository.save(student);
    }

    /**
     * Used by ExcelImportService. Creates a Student record AND the associated User login account.
     * Must be atomic.
     */
    @Transactional // ✅ CRITICAL FIX: Ensures Student save and User save are atomic (both succeed or both fail).
    public Student createStudentAndUser(Student student, String initialPassword) {
        // 1. Check for duplicate ID in both collections
        if (studentRepository.findByStudentId(student.getStudentId()).isPresent() ||
                userRepository.findByUsername(student.getStudentId()).isPresent()) {

            // This exception informs the StudentImportService that this record should be skipped.
            throw new IllegalArgumentException("Student ID or associated User already exists.");
        }

        // 2. Save Student Record
        Student savedStudent = studentRepository.save(student);

        // 3. Create User Account for Login (username = studentId)
        User user = new User();
        user.setUsername(savedStudent.getStudentId());
        user.setPassword(passwordEncoder.encode(initialPassword));
        user.setRole(UserRole.STUDENT);
        userRepository.save(user);

        return savedStudent;
    }


    // ADMIN: Update student details (no transaction needed)
    public Student updateStudent(String studentId, StudentRequest request) {
        Student student = getStudentByStudentId(studentId);

        student.setName(request.getName());
        student.setMajor(request.getMajor());
        student.setEmail(request.getEmail());
        student.setPhoneNumber(request.getPhoneNumber());

        return studentRepository.save(student);
    }

    // ADMIN: Delete student record (no transaction needed)
    public void deleteStudent(String studentId) {
        Student student = getStudentByStudentId(studentId);
        userRepository.delete(userRepository.findByUsername(studentId).orElseThrow()); // Also delete the User login record
        studentRepository.delete(student);
    }
}
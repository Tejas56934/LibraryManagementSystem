package com.LMS.LMS.util;

import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.Student;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.apache.poi.ss.usermodel.DateUtil;



public class ExcelHelper {

    public static String TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    // ------------------------------
    // Universal Method (Fix for Errors)
    // ------------------------------
    public static String getCellValueAsString(Cell cell) {
        if (cell == null) return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();

            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double num = cell.getNumericCellValue();
                    long longNum = (long) num;
                    return (num == longNum) ? String.valueOf(longNum) : String.valueOf(num);
                }

            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());

            case FORMULA:
                return cell.getRichStringCellValue().toString().trim();

            case BLANK:
                return "";

            default:
                return "";
        }
    }

    // ------------------------------
    // Check File Format
    // ------------------------------
    public static boolean hasExcelFormat(MultipartFile file) {
        return TYPE.equals(file.getContentType());
    }

    // ------------------------------
    // BOOK IMPORT
    // ------------------------------
    public static List<Book> excelToBooks(InputStream is) {
        try (Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheet("Book_Inventory_Template");
            if (sheet == null) sheet = workbook.getSheetAt(0);

            List<Book> books = new ArrayList<>();
            Iterator<Row> rows = sheet.iterator();

            if (rows.hasNext()) rows.next(); // Skip header

            while (rows.hasNext()) {
                Row row = rows.next();
                if (row.getCell(0) == null) continue;

                try {
                    Book book = new Book();

                    book.setTitle(getCellValueAsString(row.getCell(0)));
                    book.setAuthor(getCellValueAsString(row.getCell(1)));
                    book.setIsbn(getCellValueAsString(row.getCell(2)));

                    String stockStr = getCellValueAsString(row.getCell(3));
                    int totalStock = stockStr.isEmpty() ? 0 : Integer.parseInt(stockStr);
                    book.setTotalStock(totalStock);
                    book.setAvailableStock(totalStock);

                    book.setCategory(getCellValueAsString(row.getCell(4)));

                    String priceStr = getCellValueAsString(row.getCell(5));
                    double price = priceStr.isEmpty() ? 0 : Double.parseDouble(priceStr);
                    book.setPrice(price);

                    books.add(book);

                } catch (Exception e) {
                    System.err.println("Skipping Book row due to error: " + e.getMessage());
                }
            }
            return books;

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Books: " + e.getMessage());
        }
    }

    // ------------------------------
    // STUDENT IMPORT
    // ------------------------------
    public static class StudentImportDTO {
        public Student student;
        public String initialPassword;

        public StudentImportDTO(Student s, String p) {
            this.student = s;
            this.initialPassword = p;
        }
    }

    public static List<StudentImportDTO> excelToStudents(InputStream is) throws IOException {
        List<StudentImportDTO> list = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheet("Student_Roster");
            if (sheet == null) sheet = workbook.getSheetAt(0);

            Iterator<Row> rows = sheet.iterator();
            if (rows.hasNext()) rows.next(); // skip header

            while (rows.hasNext()) {
                Row row = rows.next();

                try {
                    Student s = new Student();

                    String studentId = getCellValueAsString(row.getCell(0));
                    String name = getCellValueAsString(row.getCell(1));
                    String major = getCellValueAsString(row.getCell(2));
                    String email = getCellValueAsString(row.getCell(3));
                    String phone = getCellValueAsString(row.getCell(4));
                    String password = getCellValueAsString(row.getCell(5));

                    if (studentId.isEmpty() || password.isEmpty()) {
                        System.err.println("Skipping row: Missing ID or Password");
                        continue;
                    }

                    s.setStudentId(studentId);
                    s.setName(name);
                    s.setMajor(major);
                    s.setEmail(email);
                    s.setPhoneNumber(phone);

                    list.add(new StudentImportDTO(s, password));

                } catch (Exception e) {
                    System.err.println("Skipping Student row: " + e.getMessage());
                }
            }
        }
        return list;
    }

    // ------------------------------
    // Header Style
    // ------------------------------
    private static CellStyle getHeaderStyle(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());

        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    // ------------------------------
    // TEMPLATE GENERATION (BOOK)
    // ------------------------------
    public static byte[] generateBookTemplateBytes() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Book_Inventory_Template");
            CellStyle style = getHeaderStyle(workbook);

            String[] headers = {"Title", "Author", "ISBN", "Total Stock", "Category", "Price"};

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(style);
                sheet.autoSizeColumn(i);
            }

            Row demo = sheet.createRow(1);
            demo.createCell(0).setCellValue("Spring Boot Guide");
            demo.createCell(1).setCellValue("Josh Long");
            demo.createCell(2).setCellValue("9781234567890");
            demo.createCell(3).setCellValue(5);
            demo.createCell(4).setCellValue("Tech");
            demo.createCell(5).setCellValue(29.99);

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // ------------------------------
    // TEMPLATE GENERATION (STUDENT)
    // ------------------------------
    public static byte[] generateStudentTemplateBytes() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Student_Roster");
            CellStyle style = getHeaderStyle(workbook);

            String[] headers = {
                    "Student ID", "Full Name", "Major/Department",
                    "Email", "Phone Number", "Initial Password"
            };

            Row header = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(style);
                sheet.autoSizeColumn(i);
            }

            Row demo = sheet.createRow(1);
            demo.createCell(0).setCellValue("S-101");
            demo.createCell(1).setCellValue("Tejas Pandit");
            demo.createCell(2).setCellValue("Computer Science");
            demo.createCell(3).setCellValue("tejas@uni.edu");
            demo.createCell(4).setCellValue("9991234567");
            demo.createCell(5).setCellValue("temp123");

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

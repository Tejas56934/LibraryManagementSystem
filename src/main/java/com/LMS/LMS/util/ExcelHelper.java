package com.LMS.LMS.util;

import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.Student;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.DateUtil;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Utility class for handling Excel operations including template generation
 * and data extraction for Books and Students.
 */
public class ExcelHelper {

    public static String TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    /**
     * Universal Method to handle different cell types (String, Numeric, Boolean, Formula)
     * and return a clean String for parsing.
     */
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
                    // Returns whole number string if no decimals exist to avoid ".0" suffixes
                    return (num == longNum) ? String.valueOf(longNum) : String.valueOf(num);
                }

            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());

            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }

            case BLANK:
                return "";

            default:
                return "";
        }
    }

    /**
     * Validates if the uploaded file is a valid Excel (.xlsx) file.
     */
    public static boolean hasExcelFormat(MultipartFile file) {
        return TYPE.equals(file.getContentType());
    }

    // ---------------------------------------------------------
    // BOOK IMPORT LOGIC (Updated for Shelf/Rack Management)
    // ---------------------------------------------------------

    /**
     * Parses an Excel InputStream into a list of Book objects.
     * Expects 8 columns: Title, Author, ISBN, Stock, Category, Price, Shelf Code, Rack Number.
     */
    public static List<Book> excelToBooks(InputStream is) {
        try (Workbook workbook = new XSSFWorkbook(is)) {

            // Try to find the specific template sheet name, fallback to index 0
            Sheet sheet = workbook.getSheet("Books_Template");
            if (sheet == null) sheet = workbook.getSheetAt(0);

            List<Book> books = new ArrayList<>();
            Iterator<Row> rows = sheet.iterator();

            if (rows.hasNext()) rows.next(); // Skip the header row

            while (rows.hasNext()) {
                Row row = rows.next();

                // Skip completely empty rows based on the Title column
                if (row.getCell(0) == null || getCellValueAsString(row.getCell(0)).isEmpty()) continue;

                try {
                    Book book = new Book();

                    // Column Indices:
                    // 0=Title, 1=Author, 2=ISBN, 3=Stock, 4=Category, 5=Price, 6=Shelf, 7=Rack
                    book.setTitle(getCellValueAsString(row.getCell(0)));
                    book.setAuthor(getCellValueAsString(row.getCell(1)));
                    book.setIsbn(getCellValueAsString(row.getCell(2)));

                    // Parsing Stock (Long)
                    String stockStr = getCellValueAsString(row.getCell(3));
                    long totalStock = stockStr.isEmpty() ? 0L : Long.parseLong(stockStr);
                    book.setTotalStock(totalStock);
                    book.setAvailableStock(totalStock); // Initialize available stock for new arrivals

                    book.setCategory(getCellValueAsString(row.getCell(4)));

                    // Parsing Price (Double)
                    String priceStr = getCellValueAsString(row.getCell(5));
                    double price = priceStr.isEmpty() ? 0.0 : Double.parseDouble(priceStr);
                    book.setPrice(price);

                    // --- INVENTORY MAPPING FIELDS ---
                    // Column 6: Shelf Code (e.g., Aisle-01-S03)
                    if (row.getCell(6) != null) {
                        book.setShelfCode(getCellValueAsString(row.getCell(6)));
                    }

                    // Column 7: Rack Number (e.g., RACK-05)
                    if (row.getCell(7) != null) {
                        book.setRackNumber(getCellValueAsString(row.getCell(7)));
                    }

                    books.add(book);

                } catch (Exception e) {
                    System.err.println("Error parsing Book row " + (row.getRowNum() + 1) + ": " + e.getMessage());
                }
            }
            return books;

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Book Excel: " + e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // STUDENT IMPORT LOGIC
    // ---------------------------------------------------------

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
                if (row.getCell(0) == null) continue;

                try {
                    Student s = new Student();

                    String studentId = getCellValueAsString(row.getCell(0));
                    String name = getCellValueAsString(row.getCell(1));
                    String major = getCellValueAsString(row.getCell(2));
                    String email = getCellValueAsString(row.getCell(3));
                    String phone = getCellValueAsString(row.getCell(4));
                    String password = getCellValueAsString(row.getCell(5));

                    if (studentId.isEmpty() || password.isEmpty()) continue;

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

    // ---------------------------------------------------------
    // TEMPLATE GENERATION
    // ---------------------------------------------------------

    private static CellStyle getHeaderStyle(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());

        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    /**
     * Generates a template for Book inventory with 8 columns.
     */
    public static byte[] generateBookTemplateBytes() {
        String[] HEADERS = { "Title", "Author", "ISBN", "Total Stock", "Category", "Price", "Shelf Code", "Rack Number" };

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Books_Template");
            CellStyle headerStyle = getHeaderStyle(workbook);

            // Create Header Row
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < HEADERS.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(HEADERS[col]);
                cell.setCellStyle(headerStyle);
            }

            // Add a Sample Row to guide the user
            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue("The Pragmatic Programmer");
            sample.createCell(1).setCellValue("Andrew Hunt");
            sample.createCell(2).setCellValue("978-0135957059");
            sample.createCell(3).setCellValue(5);
            sample.createCell(4).setCellValue("Software Engineering");
            sample.createCell(5).setCellValue(39.99);
            sample.createCell(6).setCellValue("A-12-S02");
            sample.createCell(7).setCellValue("RACK-05");

            // Auto-size all columns for readability
            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Book Template", e);
        }
    }

    /**
     * Generates a template for Student roster.
     */
    public static byte[] generateStudentTemplateBytes() {
        String[] HEADERS = { "Student ID", "Full Name", "Major/Department", "Email", "Phone Number", "Initial Password" };

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Student_Roster");
            CellStyle style = getHeaderStyle(workbook);

            Row header = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(HEADERS[i]);
                c.setCellStyle(style);
            }

            // Demo Row
            Row demo = sheet.createRow(1);
            demo.createCell(0).setCellValue("S-101");
            demo.createCell(1).setCellValue("John Doe");
            demo.createCell(2).setCellValue("IT");
            demo.createCell(3).setCellValue("john@university.edu");
            demo.createCell(4).setCellValue("1234567890");
            demo.createCell(5).setCellValue("pass123");

            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Student Template", e);
        }
    }
}
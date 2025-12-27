package com.LMS.LMS.util;

import org.apache.poi.ss.usermodel.Cell;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtil {

    // Helper for ExcelHelper to check date formatting
    public static boolean isCellDateFormatted(Cell cell) {
        return org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell);
    }

    // Format LocalDateTime for reports or Excel strings
    public static String formatLocalDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return dateTime.format(formatter);
    }

    // Standard date format for the Library (e.g., for "Date Added" column)
    public static String getStandardDateString(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
        return dateTime.format(formatter);
    }
}
// backend/com/LMS/LMS/model/Shelf.java (NEW FILE)

package com.LMS.LMS.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "shelves")
public class Shelf {

    @Id
    private String id; // MongoDB default ID

    /**
     * The unique shelf identifier (e.g., Aisle-03-R2-S1). This matches Book.shelfCode.
     */
    @Indexed(unique = true)
    private String shelfCode;

    /**
     * The primary identifier for the larger structural unit holding this shelf.
     * Links to the Rack entity.
     */
    private String rackNumber;

    /**
     * General description of the area (e.g., "Ground Floor, Section B").
     */
    private String locationDescription;

    /**
     * Estimated capacity in books or linear feet (optional).
     */
    private int capacity;

    // --- GEOSPATIAL DATA for "Find Book" Navigation ---

    /**
     * X coordinate for map visualization (e.g., meters from the entrance).
     */
    private double mapX;

    /**
     * Y coordinate for map visualization.
     */
    private double mapY;
}
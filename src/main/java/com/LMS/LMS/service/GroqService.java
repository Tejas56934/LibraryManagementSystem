package com.LMS.LMS.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    // Using Llama-3.3-70b for high intelligence in both chat and analysis
    private final String MODEL_NAME = "llama-3.3-70b-versatile";
    private final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private ObjectMapper objectMapper;

    public String getAIAnalysis(String userQuery, String systemData) {
        // 1. Safety Check for API Key
        if (groqApiKey == null || groqApiKey.isEmpty() || groqApiKey.startsWith("YOUR_KEY")) {
            System.err.println("❌ ERROR: API Key is missing.");
            return "{\"summary\": \"Configuration Error: Groq API Key is missing.\", \"tableData\": []}";
        }

        try {
            // 2. Determine Mode: General Chat OR Data Analysis
            // If systemData is null, empty, or just brackets, we treat it as General Chat.
            boolean isGeneralChat = (systemData == null || systemData.trim().isEmpty() || systemData.equals("[]") || systemData.equals("{}"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("model", MODEL_NAME);
            payload.put("temperature", isGeneralChat ? 0.7 : 0.1); // Higher creativity for chat, lower for data

            ArrayNode messages = payload.putArray("messages");

            // --- DYNAMIC SYSTEM PROMPT ---
            ObjectNode systemMsg = messages.addObject();
            systemMsg.put("role", "system");

            if (isGeneralChat) {
                // MODE: GENERAL CHAT (Conversational)
                // We strictly enforce JSON format so the frontend doesn't break.
                systemMsg.put("content",
                        "You are a friendly and helpful AI Assistant for a Library Management System. " +
                                "Answer the user's question naturally and politely. " +
                                "Strictly output valid JSON with two keys: " +
                                "1. 'summary': Your actual chat response string. " +
                                "2. 'tableData': An empty array []. " +
                                "Do not use Markdown formatting in the JSON."
                );
            } else {
                // MODE: DATA ANALYST (Analytical)
                systemMsg.put("content",
                        "You are a JSON-only Data Analyst. " +
                                "Analyze the provided data and user query. " +
                                "Output strict JSON with keys: 'summary', 'tableHeaders' (string array), 'tableData'. " +
                                "IMPORTANT: 'tableData' must be an ARRAY of OBJECTS matching headers. " +
                                "Example: tableData: [{ \"Student\": \"John\", \"Books\": 5 }]. " +
                                "Do not output Markdown."
                );
            }

            // --- USER MESSAGE CONSTRUCTION ---
            ObjectNode userMsg = messages.addObject();
            userMsg.put("role", "user");

            if (isGeneralChat) {
                // Just send the user's hello/question
                userMsg.put("content", userQuery);
            } else {
                // Send Data + Query
                String safeSystemData = systemData.length() > 15000
                        ? systemData.substring(0, 15000) + "...(truncated)"
                        : systemData;

                String finalContent = "DATA CONTEXT:\n" + safeSystemData +
                        "\n\nUSER QUESTION:\n" + userQuery;
                userMsg.put("content", finalContent);
            }

            // 3. Debug Print
            // System.out.println("🚀 Sending " + (isGeneralChat ? "CHAT" : "ANALYSIS") + " Request...");

            // 4. Send Request
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(payload), headers);
            ResponseEntity<String> response = restTemplate.postForEntity(GROQ_URL, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            String responseContent = root.path("choices").get(0).path("message").path("content").asText();

            // 5. Clean Response (Groq sometimes adds ```json markers)
            responseContent = responseContent.replace("```json", "").replace("```", "").trim();

            return responseContent;

        } catch (HttpClientErrorException e) {
            System.err.println("❌ Groq API Error: " + e.getResponseBodyAsString());
            return "{\"summary\": \"AI Error: " + e.getStatusCode() + "\", \"tableData\": []}";
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"summary\": \"Internal Server Error\", \"tableData\": []}";
        }
    }
}
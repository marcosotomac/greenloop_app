package com.greenloop.greenloop.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GitHubModelsService {

    @Value("${github.models.api-key}")
    private String apiKey;

    @Value("${github.models.base-url}")
    private String baseUrl;

    @Value("${github.models.default-model}")
    private String defaultModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate a response using GitHub Models AI
     */
    public Map<String, String> generateResponse(String prompt) {
        try {
            // Create the request body for GitHub Models API
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", defaultModel);
            requestBody.put("messages", List.of(
                    Map.of("role", "user", "content", prompt)));
            requestBody.put("max_tokens", 1000);
            requestBody.put("temperature", 0.7);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Make the API call
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/chat/completions",
                    HttpMethod.POST,
                    request,
                    String.class);

            // Parse the response
            Map<String, Object> responseBody = objectMapper.readValue(response.getBody(), Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");

            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                String content = (String) message.get("content");

                Map<String, String> result = new HashMap<>();
                result.put("response", content);
                result.put("status", "success");
                result.put("model", "GitHub Models " + defaultModel);

                return result;
            } else {
                Map<String, String> errorResult = new HashMap<>();
                errorResult.put("response", "No se recibió respuesta del modelo");
                errorResult.put("status", "error");
                errorResult.put("model", "GitHub Models " + defaultModel);
                return errorResult;
            }

        } catch (Exception e) {
            Map<String, String> errorResult = new HashMap<>();
            errorResult.put("response", "Lo siento, hubo un error al procesar tu solicitud: " + e.getMessage());
            errorResult.put("status", "error");
            errorResult.put("model", "GitHub Models " + defaultModel);

            return errorResult;
        }
    }

    /**
     * Generate a contextual response for GreenLoop platform
     */
    public Map<String, String> generateContextualResponse(String userMessage, String context) {
        String systemPrompt = String.format("""
                Eres un asistente virtual para GreenLoop, una plataforma de intercambio sostenible.
                Tu objetivo es ayudar a los usuarios con:
                - Intercambio de productos
                - Consejos de sostenibilidad
                - Navegación de la plataforma
                - Construcción de comunidades ecológicas

                Contexto del usuario: %s

                Responde de manera amigable, útil y enfocada en la sostenibilidad.
                Mensaje del usuario: %s
                """, context != null ? context : "Usuario general", userMessage);

        return generateResponse(systemPrompt);
    }

    /**
     * Generate product recommendations
     */
    public Map<String, String> generateProductRecommendations(String userPreferences) {
        String prompt = String.format("""
                Como experto en intercambio sostenible en GreenLoop, genera recomendaciones de productos
                basadas en las siguientes preferencias del usuario:

                %s

                Proporciona 3-5 recomendaciones específicas que promuevan el intercambio sostenible,
                incluyendo:
                - Tipo de producto
                - Beneficios ambientales
                - Consejos de intercambio

                Mantén un tono amigable y motivador hacia la sostenibilidad.
                """, userPreferences);

        return generateResponse(prompt);
    }

    /**
     * Generate sustainability tips
     */
    public Map<String, String> generateSustainabilityTips(String category) {
        String prompt = String.format("""
                Como experto en sostenibilidad para la plataforma GreenLoop, proporciona consejos
                prácticos y accionables sobre: %s

                Incluye:
                - 3-5 tips específicos y fáciles de implementar
                - Beneficios ambientales de cada tip
                - Cómo estos consejos se relacionan con el intercambio de productos

                Mantén un tono inspirador y práctico.
                """, category != null ? category : "sostenibilidad general");

        return generateResponse(prompt);
    }
}
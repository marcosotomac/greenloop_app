package com.greenloop.greenloop.ai.controller;

import com.greenloop.greenloop.ai.dto.AIRequestDto;
import com.greenloop.greenloop.ai.dto.AIResponseDto;
import com.greenloop.greenloop.ai.service.GitHubModelsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    private final GitHubModelsService gitHubModelsService;

    @Autowired
    public AIController(GitHubModelsService gitHubModelsService) {
        this.gitHubModelsService = gitHubModelsService;
    }

    /**
     * General AI chat endpoint
     */
    @PostMapping("/chat")
    public ResponseEntity<AIResponseDto> chat(@RequestBody AIRequestDto request) {
        Map<String, String> result = gitHubModelsService.generateResponse(request.getMessage());

        AIResponseDto response = AIResponseDto.builder()
                .response(result.get("response"))
                .status(result.get("status"))
                .model(result.get("model"))
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Contextual AI response with user context
     */
    @PostMapping("/chat/contextual")
    public ResponseEntity<AIResponseDto> contextualChat(@RequestBody AIRequestDto request) {
        Map<String, String> result = gitHubModelsService.generateContextualResponse(
                request.getMessage(),
                request.getContext());

        AIResponseDto response = AIResponseDto.builder()
                .response(result.get("response"))
                .status(result.get("status"))
                .model(result.get("model"))
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Product recommendations endpoint
     */
    @PostMapping("/recommendations")
    public ResponseEntity<AIResponseDto> getRecommendations(@RequestBody AIRequestDto request) {
        Map<String, String> result = gitHubModelsService.generateProductRecommendations(request.getMessage());

        AIResponseDto response = AIResponseDto.builder()
                .response(result.get("response"))
                .status(result.get("status"))
                .model(result.get("model"))
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Sustainability tips endpoint
     */
    @GetMapping("/sustainability/{category}")
    public ResponseEntity<AIResponseDto> getSustainabilityTips(@PathVariable String category) {
        Map<String, String> result = gitHubModelsService.generateSustainabilityTips(category);

        AIResponseDto response = AIResponseDto.builder()
                .response(result.get("response"))
                .status(result.get("status"))
                .model(result.get("model"))
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * General sustainability tips
     */
    @GetMapping("/sustainability")
    public ResponseEntity<AIResponseDto> getGeneralSustainabilityTips() {
        Map<String, String> result = gitHubModelsService.generateSustainabilityTips(null);

        AIResponseDto response = AIResponseDto.builder()
                .response(result.get("response"))
                .status(result.get("status"))
                .model(result.get("model"))
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "GitHub Models AI",
                "version", "1.0.0"));
    }
}
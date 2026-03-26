package com.lawboard.controller;

import com.lawboard.model.UpgradeRequest;
import com.lawboard.repository.UpgradeRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow requests from the React frontend
public class UpgradeController {

    @Autowired
    private UpgradeRequestRepository repository;

    @PostMapping("/upgrade-request")
    public ResponseEntity<Map<String, Object>> handleUpgradeRequest(@RequestBody UpgradeRequest request) {
        // Save the request to the database
        UpgradeRequest savedRequest = repository.save(request);
        
        System.out.println("Saved new upgrade request for mobile: " + savedRequest.getMobileNumber());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Request saved successfully");
        response.put("id", savedRequest.getId());

        return ResponseEntity.ok(response);
    }
    
    // Endpoint to view all requests (for admin purposes)
    @GetMapping("/upgrade-requests")
    public ResponseEntity<?> getAllRequests() {
        return ResponseEntity.ok(repository.findAll());
    }
}

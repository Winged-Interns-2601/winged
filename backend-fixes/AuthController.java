package com.example.portfolio.controller;

import com.example.portfolio.dto.LoginRequest;
import com.example.portfolio.dto.LoginResponse;
import com.example.portfolio.entity.Employee;
import com.example.portfolio.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Authenticate user
            Employee employee = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
            
            // Generate token
            String token = authService.generateToken(employee);
            
            // Return full employee data with token
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setEmployee(employee); // Full employee object including panNO, aadharNo, etc.
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Invalid credentials: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Employee> register(@RequestBody Employee employee) {
        try {
            // Register new employee
            Employee registeredEmployee = authService.register(employee);
            
            return ResponseEntity.ok(registeredEmployee);
        } catch (RuntimeException e) {
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }
}

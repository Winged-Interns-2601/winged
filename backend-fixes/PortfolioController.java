package com.example.portfolio.controller;

import com.example.portfolio.entity.Employee;
import com.example.portfolio.entity.Portfolio;
import com.example.portfolio.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "http://localhost:4200")
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @PostMapping("/add/{employeeId}")
    public ResponseEntity<Portfolio> addPortfolio(@PathVariable Long employeeId, @RequestBody Portfolio portfolio) {
        try {
            Portfolio savedPortfolio = portfolioService.addPortfolio(employeeId, portfolio);
            return ResponseEntity.ok(savedPortfolio);
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to add portfolio: " + e.getMessage());
        }
    }

    @GetMapping("/get-portfolio/{employeeId}")
    public ResponseEntity<Portfolio> getPortfolio(@PathVariable Long employeeId) {
        try {
            Portfolio portfolio = portfolioService.getPortfolioByEmployeeId(employeeId);
            if (portfolio == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(portfolio);
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to get portfolio: " + e.getMessage());
        }
    }

    @PatchMapping("/update/{portfolioId}")
    public ResponseEntity<Portfolio> updatePortfolio(@PathVariable Long portfolioId, @RequestBody Portfolio portfolio) {
        try {
            Portfolio updatedPortfolio = portfolioService.updatePortfolio(portfolioId, portfolio);
            return ResponseEntity.ok(updatedPortfolio);
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to update portfolio: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{employeeId}")
    public ResponseEntity<String> deletePortfolio(@PathVariable Long employeeId) {
        try {
            portfolioService.deletePortfolio(employeeId);
            return ResponseEntity.ok("Portfolio deleted successfully");
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to delete portfolio: " + e.getMessage());
        }
    }
}

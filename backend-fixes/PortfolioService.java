package com.example.portfolio.service;

import com.example.portfolio.entity.Employee;
import com.example.portfolio.entity.Portfolio;
import com.example.portfolio.repository.EmployeeRepository;
import com.example.portfolio.repository.PortfolioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PortfolioService {

    @Autowired
    private PortfolioRepository portfolioRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;

    public Portfolio addPortfolio(Long employeeId, Portfolio portfolioData) {
        // Find employee
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));
        
        // Check if portfolio already exists
        if (employee.getPortfolio() != null) {
            throw new RuntimeException("Portfolio already exists for employee: " + employeeId);
        }
        
        // Create new portfolio
        Portfolio portfolio = new Portfolio();
        portfolio.setEmployee(employee);
        
        // Set skills (allow empty list)
        List<String> skills = portfolioData.getSkills();
        if (skills != null && !skills.isEmpty()) {
            portfolio.setSkills(skills);
        } else {
            portfolio.setSkills(List.of()); // Empty list instead of null
        }
        
        // Set designation (optional - use employee's designation if not provided)
        String designation = portfolioData.getDesignation();
        if (designation == null || designation.trim().isEmpty()) {
            designation = employee.getDesignation() != null ? employee.getDesignation() : "Developer";
        }
        portfolio.setDesignation(designation);
        
        // Set summary (optional)
        String summary = portfolioData.getSummary();
        if (summary != null && !summary.trim().isEmpty()) {
            portfolio.setSummary(summary);
        }
        
        // Initialize projects as empty list
        portfolio.setProjects(List.of());
        
        // Save portfolio
        Portfolio savedPortfolio = portfolioRepository.save(portfolio);
        
        // Update employee with portfolio reference
        employee.setPortfolio(savedPortfolio);
        employeeRepository.save(employee);
        
        return savedPortfolio;
    }

    public Portfolio getPortfolioByEmployeeId(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));
        
        return employee.getPortfolio();
    }

    public Portfolio updatePortfolio(Long portfolioId, Portfolio portfolioData) {
        Portfolio existingPortfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new RuntimeException("Portfolio not found with ID: " + portfolioId));
        
        // Update skills (allow empty list)
        List<String> skills = portfolioData.getSkills();
        if (skills != null) {
            existingPortfolio.setSkills(skills.isEmpty() ? List.of() : skills);
        }
        
        // Update designation (optional)
        String designation = portfolioData.getDesignation();
        if (designation != null && !designation.trim().isEmpty()) {
            existingPortfolio.setDesignation(designation);
        }
        
        // Update summary (optional)
        String summary = portfolioData.getSummary();
        if (summary != null) {
            existingPortfolio.setSummary(summary);
        }
        
        return portfolioRepository.save(existingPortfolio);
    }

    public void deletePortfolio(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));
        
        Portfolio portfolio = employee.getPortfolio();
        if (portfolio != null) {
            // Remove portfolio reference from employee
            employee.setPortfolio(null);
            employeeRepository.save(employee);
            
            // Delete portfolio
            portfolioRepository.delete(portfolio);
        }
    }
}

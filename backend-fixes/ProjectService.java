package com.example.portfolio.service;

import com.example.portfolio.entity.Employee;
import com.example.portfolio.entity.Portfolio;
import com.example.portfolio.entity.Project;
import com.example.portfolio.repository.EmployeeRepository;
import com.example.portfolio.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private PortfolioService portfolioService;

    public Project addProject(Long employeeId, Project projectData) {
        // Find employee
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));
        
        // Check if employee has portfolio, if not create one
        Portfolio portfolio = employee.getPortfolio();
        if (portfolio == null) {
            // Auto-create portfolio before adding project
            portfolio = portfolioService.addPortfolio(employeeId, new Portfolio());
        }
        
        // Create new project
        Project project = new Project();
        project.setPortfolio(portfolio);
        project.setProjectName(projectData.getProjectName());
        project.setDescription(projectData.getDescription());
        project.setTechStack(projectData.getTechStack());
        project.setSummary(projectData.getSummary());
        project.setImage(projectData.getImage());
        
        // Save project
        return projectRepository.save(project);
    }

    public Project updateProject(Long projectId, Project projectData) {
        Project existingProject = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));
        
        // Update project fields
        if (projectData.getProjectName() != null) {
            existingProject.setProjectName(projectData.getProjectName());
        }
        if (projectData.getDescription() != null) {
            existingProject.setDescription(projectData.getDescription());
        }
        if (projectData.getTechStack() != null) {
            existingProject.setTechStack(projectData.getTechStack());
        }
        if (projectData.getSummary() != null) {
            existingProject.setSummary(projectData.getSummary());
        }
        if (projectData.getImage() != null) {
            existingProject.setImage(projectData.getImage());
        }
        
        return projectRepository.save(existingProject);
    }

    public void deleteProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new RuntimeException("Project not found with ID: " + projectId);
        }
        projectRepository.deleteById(projectId);
    }

    public java.util.List<Project> getProjectsByEmployeeId(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));
        
        Portfolio portfolio = employee.getPortfolio();
        if (portfolio == null) {
            return java.util.List.of(); // Return empty list if no portfolio
        }
        
        return projectRepository.findByPortfolio(portfolio);
    }
}

package com.example.portfolio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    // Get all projects
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }
    
    // Get project by ID
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }
    
    // Create new project
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }
    
    // Update project
    public Optional<Project> updateProject(Long id, Project projectDetails) {
        return projectRepository.findById(id)
            .map(project -> {
                project.setTitle(projectDetails.getTitle());
                project.setTech(projectDetails.getTech());
                project.setImage(projectDetails.getImage());
                return projectRepository.save(project);
            });
    }
    
    // Delete project
    public boolean deleteProject(Long id) {
        return projectRepository.findById(id)
            .map(project -> {
                projectRepository.delete(project);
                return true;
            })
            .orElse(false);
    }
    
    // Initialize default projects if database is empty
    public void initializeDefaultProjects() {
        if (projectRepository.count() == 0) {
            // Create default projects
            Project[] defaultProjects = {
                new Project("Resume Analyzer", "HTML • CSS • JS", "assets/img10.jpg"),
                new Project("Daily Expense Tracker", "Angular • TypeScript", "assets/img9.jpg"),
                new Project("Portfolio Website", "Angular • Tailwind", "assets/img12.jpg"),
                new Project("Task Management App", "React • Node.js • MongoDB", "assets/img13.jpg"),
                new Project("Weather Dashboard", "Vue.js • API • Chart.js", "assets/img14.jpg")
            };
            
            for (Project project : defaultProjects) {
                projectRepository.save(project);
            }
        }
    }
}

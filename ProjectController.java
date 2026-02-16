package com.example.portfolio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular app
public class ProjectController {
    
    @Autowired
    private ProjectService projectService;
    
    // GET all projects
    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }
    
    // GET project by ID
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        Optional<Project> project = projectService.getProjectById(id);
        return project.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    // POST create new project
    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        Project createdProject = projectService.createProject(project);
        return ResponseEntity.ok(createdProject);
    }
    
    // PUT update project
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project projectDetails) {
        Optional<Project> updatedProject = projectService.updateProject(id, projectDetails);
        return updatedProject.map(ResponseEntity::ok)
                             .orElse(ResponseEntity.notFound().build());
    }
    
    // DELETE project
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        boolean deleted = projectService.deleteProject(id);
        return deleted ? ResponseEntity.noContent().build() 
                       : ResponseEntity.notFound().build();
    }
    
    // Initialize default projects (call this once to setup database)
    @PostMapping("/initialize")
    public ResponseEntity<String> initializeProjects() {
        projectService.initializeDefaultProjects();
        return ResponseEntity.ok("Default projects initialized successfully");
    }
}

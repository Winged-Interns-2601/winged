package com.example.portfolio.controller;

import com.example.portfolio.entity.Project;
import com.example.portfolio.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:4200")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping("/add/{employeeId}")
    public ResponseEntity<Project> addProject(@PathVariable Long employeeId, @RequestBody Project project) {
        try {
            Project savedProject = projectService.addProject(employeeId, project);
            return ResponseEntity.ok(savedProject);
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to add project: " + e.getMessage());
        }
    }

    @PatchMapping("/update/{projectId}")
    public ResponseEntity<Project> updateProject(@PathVariable Long projectId, @RequestBody Project project) {
        try {
            Project updatedProject = projectService.updateProject(projectId, project);
            return ResponseEntity.ok(updatedProject);
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to update project: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{projectId}")
    public ResponseEntity<String> deleteProject(@PathVariable Long projectId) {
        try {
            projectService.deleteProject(projectId);
            return ResponseEntity.ok("Project deleted successfully");
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to delete project: " + e.getMessage());
        }
    }

    @GetMapping("/get/{employeeId}")
    public ResponseEntity<List<Project>> getProjectsByEmployeeId(@PathVariable Long employeeId) {
        try {
            List<Project> projects = projectService.getProjectsByEmployeeId(employeeId);
            return ResponseEntity.ok(projects);
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to get projects: " + e.getMessage());
        }
    }
}

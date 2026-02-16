package com.example.portfolio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    // Optional: Find projects by title
    Optional<Project> findByTitle(String title);
    
    // Optional: Find projects by tech stack
    List<Project> findByTechContaining(String tech);
}

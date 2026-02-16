package com.example.portfolio;

import jakarta.persistence.*;

@Entity
@Table(name = "projects")
public class Project {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String tech;
    
    @Column(nullable = false)
    private String image;
    
    // Constructors
    public Project() {}
    
    public Project(String title, String tech, String image) {
        this.title = title;
        this.tech = tech;
        this.image = image;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getTech() {
        return tech;
    }
    
    public void setTech(String tech) {
        this.tech = tech;
    }
    
    public String getImage() {
        return image;
    }
    
    public void setImage(String image) {
        this.image = image;
    }
}

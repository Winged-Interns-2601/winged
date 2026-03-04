package com.example.portfolio.dto;

import com.example.portfolio.entity.Employee;

public class LoginResponse {
    private String token;
    private Employee employee;

    // Constructors
    public LoginResponse() {}

    public LoginResponse(String token, Employee employee) {
        this.token = token;
        this.employee = employee;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }
}

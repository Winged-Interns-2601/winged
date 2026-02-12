package com.example.portfolio.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.Date;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "EmployeeId is required")
    @Column(unique = true, name = "employee_id")
    private Long employeeId;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be 2 to 50 characters")
    @Column(name = "first_name")
    private String firstName;

    @Column(name = "middle_name")
    private String middleName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50)
    @Column(name = "last_name")
    private String lastName;

    @NotBlank(message = "Employee type is required")
    @Column(name = "employee_type")
    private String employeeType;

    @NotBlank(message = "Designation is required")
    private String designation;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "[0-9]{10}", message = "Phone must be 10 digits")
    @Column(unique = true)
    private String phone;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id")
    @JsonManagedReference
    @NotNull(message = "Address is required")
    private Address address;

    @NotNull(message = "Joining date is required")
    @Temporal(TemporalType.DATE)
    @Column(name = "joining_date")
    private Date joiningDate;

    @Temporal(TemporalType.DATE)
    @Column(name = "exit_date")
    private Date exitDate;

    @NotNull(message = "Aadhar number is required")
    @Pattern(regexp = "[0-9]{12}", message = "Aadhar must be 12 digits")
    @Column(unique = true, name = "aadhar_no")
    private String aadharNo;

    @NotNull(message = "PAN number is required")
    @Size(min = 10, max = 10, message = "PAN must be 10 characters")
    @Column(unique = true, name = "pan_no")
    private String panNO;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "portfolio_id")
//    @NotNull(message = "Portfolio is required")
    private Portfolio portfolio;
}

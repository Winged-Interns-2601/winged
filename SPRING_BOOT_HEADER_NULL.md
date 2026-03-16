# Spring Boot: Handling HEADER = null

## 1. REST Controller with @RequestHeader

```java
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    // Method 1: Optional header with default value
    @PatchMapping("/update-by-id/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null) {
            System.out.println("No Authorization header provided");
            // Handle missing header - either allow or reject
            return ResponseEntity.badRequest().body("Authorization header required");
        }
        
        // Process the request
        Employee updated = employeeService.updateEmployee(id, employee);
        return ResponseEntity.ok(updated);
    }

    // Method 2: Using Optional<String>
    @PatchMapping("/update-by-id/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee,
            @RequestHeader("Authorization") Optional<String> authHeader) {
        
        if (!authHeader.isPresent()) {
            System.out.println("Authorization header is null/missing");
            return ResponseEntity.badRequest().body("Authorization header required");
        }
        
        String token = authHeader.get();
        // Validate token and proceed
        Employee updated = employeeService.updateEmployee(id, employee);
        return ResponseEntity.ok(updated);
    }

    // Method 3: Using HttpServletRequest
    @PatchMapping("/update-by-id/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee,
            HttpServletRequest request) {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || authHeader.isEmpty()) {
            System.out.println("Authorization header is null or empty");
            return ResponseEntity.badRequest().body("Authorization header required");
        }
        
        // Process with header
        Employee updated = employeeService.updateEmployee(id, employee);
        return ResponseEntity.ok(updated);
    }
}
```

## 2. Global Exception Handler for Missing Headers

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<String> handleMissingHeader(MissingRequestHeaderException ex) {
        String headerName = ex.getHeaderName();
        String message = String.format("Required header '%s' is missing", headerName);
        return ResponseEntity.badRequest().body(message);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleNullHeader(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body("Header value is null or invalid");
    }
}
```

## 3. Filter for Header Validation

```java
@Component
public class AuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String authHeader = httpRequest.getHeader("Authorization");
        
        if (authHeader == null || authHeader.isEmpty()) {
            System.out.println("HEADER = null detected in filter");
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.getWriter().write("Authorization header required");
            return;
        }
        
        // Validate token and proceed
        chain.doFilter(request, response);
    }
}
```

## 4. Application Properties Configuration

```properties
# application.properties
server.servlet.context-path=/api
logging.level.org.springframework.web=DEBUG
logging.level.com.yourpackage=DEBUG

# Enable detailed error messages
server.error.include-message=always
server.error.include-binding-errors=always
```

## 5. Testing with curl

```bash
# Test with missing header (should return 400/401)
curl -X PATCH http://localhost:8080/api/employees/update-by-id/85 \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","email":"john@example.com"}'

# Test with header
curl -X PATCH http://localhost:8080/api/employees/update-by-id/85 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{"firstName":"John","email":"john@example.com"}'
```

## 6. Console Output Examples

```
# When header is null:
HEADER = null detected in filter
Authorization header is null/missing
No Authorization header provided

# When header is present:
Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Processing update for employee ID: 85
```

## 7. Angular Service Debugging

```typescript
// Add headers to see what's being sent
updateEmployee(id: number, employee: any) {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    
    console.log('Headers being sent:', headers.keys());
    
    return this.http.patch(`${this.API}/update-by-id/${id}`, employee, { 
        headers,
        observe: 'response' 
    });
}
```

## 8. Common Solutions for HEADER = null

1. **Check Frontend**: Ensure Angular is sending the header
2. **CORS Issues**: Add `exposedHeaders` in Spring Boot config
3. **Case Sensitivity**: Headers are case-insensitive but be consistent
4. **Preflight Requests**: Handle OPTIONS requests for CORS

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Content-Type");
    }
}
```

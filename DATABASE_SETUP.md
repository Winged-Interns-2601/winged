# Database Setup for Projects

## Backend Files Created:
1. **Project.java** - JPA Entity for projects table
2. **ProjectRepository.java** - Spring Data repository interface
3. **ProjectService.java** - Business logic for project operations
4. **ProjectController.java** - REST API endpoints

## Database Integration:

### API Endpoints:
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/initialize` - Initialize default projects

### How to Save Projects to Database:

1. **Add the Java files to your Spring Boot project**
2. **Configure application.properties for your database**
3. **Start the Spring Boot backend**
4. **Initialize default projects** (optional):
   ```bash
   curl -X POST http://localhost:8080/api/projects/initialize
   ```

### Frontend Integration:
The Angular projects service now automatically:
- Tries to save/load from database first
- Falls back to localStorage if database is unavailable
- Provides seamless offline/online functionality

### Project Storage:
- **Database**: Primary storage (MySQL/PostgreSQL/H2)
- **localStorage**: Offline fallback
- **API**: http://localhost:8080/api/projects

The system now supports full CRUD operations with database persistence!

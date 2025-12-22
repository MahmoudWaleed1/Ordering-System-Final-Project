# 📦 Ordering System – Final Project

This repository contains the **final ordering system web project**, developed using a **React frontend** and a **Flask backend**.

---

## 📌 GitHub Conventions

### 🔒 Branching Rules
- **Never push directly to `main`**
- All changes must be made through **Pull Requests**
- `main` will be merged **only at the final stage**
- **Delete branches after merging**

---

### 🔁 Pull Request Rules
- Do **not merge without a clear Pull Request**
- Every PR must include:
  - A clear title
  - A short description of changes
  - Screenshots for UI-related updates

---

### 📝 Commit Message Convention
Use the following prefixes for commits:

- `new:` → adding new features  
- `fix:` → fixing bugs  
- `refactor:` → code modification / refactoring  
- `test:` → testing-related changes  
- `docs:` → documentation or comments

## 📁 Project Structure

The project is divided into **Frontend** and **Backend**, each in a separate folder:

## 🔧 Backend Conventions

### 📂 Folder Structure per Feature

-   Each feature should have its **own folder** under `backend/`:
    
    ```bash
    backend/
    ├── users/
    │   ├── __init__.py   # Blueprint
    │   ├── models.py
    │   └── routes.py
    ├── tasks/
    │   ├── __init__.py
    │   ├── models.py
    │   └── routes.py
    └── ...
    ```
    
-   **Blueprints** must be used to register feature routes with a clear URL prefix (e.g., `/api/tasks`, `/api/users`).
    

### 🛠 API Endpoints

-   All endpoints must follow **REST conventions**:
    
    -   GET `/api/feature/` → list all items
 
    -   GET `/api/feature/<id>` → get an item
        
    -   POST `/api/feature/` → create an item
        
    -   PUT `/api/feature/<id>` → update an item
        
    -   DELETE `/api/feature/<id>` → delete an item
        
-   JSON responses should be consistent, using **`id` and `content` (or relevant fields)**.
    
-   Avoid global variables for per-user data; use the database.
    

### 📑 Documentation

-   Maintain **OpenAPI-style documentation** for each feature:
    
    -   List endpoints, methods, request body, responses

        
-   Update documentation **as you implement new endpoints**.    

### ⚡ Best Practices

-   Keep **routes.py** minimal: only handle request logic, call `models.py` for DB operations.
    
-   **models.py** handles all database queries and returns Python-native objects.
    
-   **Blueprints** ensure modular, reusable code.
    
-   Ensure concurrency safety:
    
    -   Don’t store per-request data in globals.
        
    -   Use database for shared data.

- Virtual Environment:
    - Each developer creates their own virtual environment
    - venv/ is ignored by Git
    - Dependencies are installed via requirements.txt

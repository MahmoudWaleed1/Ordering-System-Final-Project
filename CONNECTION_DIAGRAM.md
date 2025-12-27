# System Connection Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│                  http://localhost:3000                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │   Services   │     │
│  │              │  │              │  │              │     │
│  │ - Login      │  │ - BookCard   │  │ - api.ts     │─────┼──┐
│  │ - Register   │  │ - Cart       │  │              │     │  │
│  │ - Books      │  │ - Navbar     │  │              │     │  │
│  │ - Cart       │  │              │  │              │     │  │
│  │ - Orders     │  │              │  │              │     │  │
│  │ - Admin      │  │              │  │              │     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘     │  │
│                                                              │  │
│  ┌──────────────┐  ┌──────────────┐                        │  │
│  │  Contexts   │  │   Helpers    │                        │  │
│  │             │  │              │                        │  │
│  │ - Cart      │  │ - cartStorage│                        │  │
│  │             │  │ - currency   │                        │  │
│  └──────────────┘  └──────────────┘                        │  │
└─────────────────────────────────────────────────────────────┘  │
                                                                 │
                    HTTP Requests (REST API)                    │
                    JSON over HTTP                              │
                                                                 │
┌─────────────────────────────────────────────────────────────┐│
│                    BACKEND (Flask)                            ││
│                  http://localhost:5000                       ││
│                                                               ││
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      ││
│  │   Routes     │  │   Models     │  │     Auth     │      ││
│  │              │  │              │  │              │      ││
│  │ - users_bp   │  │ - get_user   │  │ - JWT        │      ││
│  │ - books_bp   │  │ - create_    │  │ - tokens     │      ││
│  │ - admins_bp  │  │   order      │  │ - decorators │      ││
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      ││
│         │                  │                               ││
│         └──────────────────┘                               ││
│                    │                                        ││
│         ┌──────────▼──────────┐                            ││
│         │   db_connection.py  │                            ││
│         │                     │                            ││
│         │  get_db()           │                            ││
│         └──────────┬──────────┘                            ││
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ MySQL Connector
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    DATABASE (MySQL)                          │
│            Book_Order_Processing_System                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Tables    │  │   Triggers   │  │  Procedures  │     │
│  │              │  │              │  │              │     │
│  │ - user       │  │ - stock      │  │ - sales      │     │
│  │ - book       │  │   update     │  │   reports    │     │
│  │ - order      │  │ - order      │  │ - top        │     │
│  │ - publisher  │  │   confirm    │  │   customers  │     │
│  │ - author     │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Registration/Login
```
Frontend → POST /api/users/register
         → POST /api/users/login
         ↓
Backend → Validate credentials
         ↓
Database → INSERT/SELECT user
         ↓
Backend → Return JWT token
         ↓
Frontend → Store token in session
```

### 2. Browse Books
```
Frontend → GET /api/books/
         ↓
Backend → Query database
         ↓
Database → SELECT * FROM book
         ↓
Backend → Transform & return JSON
         ↓
Frontend → Display books
```

### 3. Add to Cart
```
Frontend → cartStorage.addToCart()
         ↓
Local Storage → Store cart items
         ↓
Frontend → Update UI
```

### 4. Place Order
```
Frontend → POST /api/books/orders
         ↓
Backend → Validate JWT token
         ↓
Database → BEGIN TRANSACTION
         ↓
         → INSERT customer_order
         → INSERT book_order (for each book)
         → UPDATE book (reduce stock)
         → COMMIT
         ↓
Backend → Return order_id
         ↓
Frontend → Clear cart & redirect
```

### 5. Admin Operations
```
Frontend → GET /api/admins/books (with Admin token)
         ↓
Backend → Verify Admin role
         ↓
Database → SELECT/INSERT/UPDATE/DELETE
         ↓
Backend → Return results
         ↓
Frontend → Display admin dashboard
```

## Configuration Files

### Backend Configuration
- `Backend/config.py` - Database credentials, JWT secrets
- `Backend/run.py` - Flask app entry point

### Frontend Configuration
- `Frontend/ordering_system/.env.local` - API URL, Auth secret

### Database Configuration
- `Database/database.sql` - Schema
- `Database/triggers.sql` - Business logic triggers
- `Database/data.sql` - Sample data
- `Database/reports.sql` - Stored procedures

## Ports
- Frontend: `3000`
- Backend: `5000`
- Database: `3306` (default MySQL port)

## Environment Variables

### Backend (.env or config.py)
```python
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=Book_Order_Processing_System
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
AUTH_SECRET=your-auth-secret
NEXTAUTH_URL=http://localhost:3000
```


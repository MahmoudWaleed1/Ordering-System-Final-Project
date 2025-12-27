# Ordering System - Setup Guide

This guide will help you set up and link the Backend, Frontend, and Database together.

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ and npm installed
- MySQL/MariaDB installed and running
- Git (optional)

## Step 1: Database Setup

1. **Start MySQL Server**
   ```bash
   # On Windows (if installed as service, it should be running)
   # On Linux/Mac:
   sudo systemctl start mysql
   # or
   sudo service mysql start
   ```

2. **Create the Database**
   ```bash
   mysql -u root -p
   ```
   
   Then run the SQL scripts in order:
   ```sql
   source Database/database.sql
   source Database/triggers.sql
   source Database/data.sql
   source Database/reports.sql
   ```

   Or manually:
   ```bash
   mysql -u root -p < Database/database.sql
   mysql -u root -p < Database/triggers.sql
   mysql -u root -p < Database/data.sql
   mysql -u root -p < Database/reports.sql
   ```

3. **Verify Database Creation**
   ```sql
   SHOW DATABASES;
   USE Book_Order_Processing_System;
   SHOW TABLES;
   ```

## Step 2: Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd Backend
   ```

2. **Create Virtual Environment (Recommended)**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Database Connection**
   - Edit `Backend/config.py` if needed:
     - Update `DB_HOST`, `DB_USER`, `DB_PASSWORD` if different from defaults
     - Database name should be: `Book_Order_Processing_System`

5. **Run the Backend Server**
   ```bash
   python run.py
   ```
   
   The backend should start on `http://localhost:5000`
   
   Test it by visiting: `http://localhost:5000/health`

## Step 3: Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd Frontend/ordering_system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Create `.env.local` file:
     ```env
     NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
     AUTH_SECRET=your-random-secret-key-here
     NEXTAUTH_URL=http://localhost:3000
     ```
   
   Generate a random secret for AUTH_SECRET:
   ```bash
   # On Linux/Mac
   openssl rand -base64 32
   
   # Or use any random string generator
   ```

4. **Run the Frontend Development Server**
   ```bash
   npm run dev
   ```
   
   The frontend should start on `http://localhost:3000`

## Step 4: Verify Everything is Connected

1. **Test Backend Health**
   - Open browser: `http://localhost:5000/health`
   - Should return: `{"status": "ok"}`

2. **Test Database Connection**
   - Try registering a new user at: `http://localhost:3000/authentication/register`
   - Check if user appears in database:
     ```sql
     USE Book_Order_Processing_System;
     SELECT * FROM user;
     ```

3. **Test Frontend-Backend Connection**
   - Login at: `http://localhost:3000/authentication/login`
   - Browse books at: `http://localhost:3000/books`
   - Add items to cart and checkout

## Default Test Accounts

After running `data.sql`, you can use:

**Admin Account:**
- Username: `admin_alice`
- Password: `hashed_secret_123` (check data.sql for actual hash)

**Customer Accounts:**
- Username: `john_doe`
- Password: `pass123`

**Note:** The passwords in data.sql are hashed. You may need to create new accounts through registration or update the password hashes.

## Troubleshooting

### Backend Issues

1. **Database Connection Error**
   - Check MySQL is running: `mysql -u root -p`
   - Verify database name in `config.py` matches: `Book_Order_Processing_System`
   - Check DB_USER and DB_PASSWORD are correct

2. **Import Errors**
   - Make sure you're in the Backend directory
   - Activate virtual environment
   - Reinstall requirements: `pip install -r requirements.txt`

3. **Port Already in Use**
   - Change port in `run.py`: `app.run(port=5001)`
   - Update frontend `.env.local`: `NEXT_PUBLIC_API_BASE_URL=http://localhost:5001`

### Frontend Issues

1. **API Connection Error**
   - Verify backend is running on port 5000
   - Check `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`
   - Restart frontend after changing env variables

2. **Authentication Issues**
   - Check `AUTH_SECRET` is set in `.env.local`
   - Clear browser cookies and try again

3. **CORS Errors**
   - Backend CORS is configured for `http://localhost:3000`
   - If using different port, update `Backend/app.py` CORS settings

### Database Issues

1. **Table Not Found**
   - Make sure all SQL scripts were run in order
   - Check you're using the correct database: `USE Book_Order_Processing_System;`

2. **Foreign Key Errors**
   - Run scripts in order: database.sql → triggers.sql → data.sql → reports.sql
   - Check data.sql doesn't reference non-existent records

## Project Structure

```
Ordering-System-Final-Project/
├── Backend/                 # Flask Backend
│   ├── app.py              # Main Flask app
│   ├── run.py              # Entry point
│   ├── config.py           # Configuration
│   ├── users/              # User endpoints
│   ├── books/              # Book endpoints
│   ├── admins/             # Admin endpoints
│   └── db/                 # Database connection
├── Frontend/               # Next.js Frontend
│   └── ordering_system/
│       ├── src/
│       └── package.json
└── Database/               # SQL Scripts
    ├── database.sql        # Schema
    ├── triggers.sql        # Triggers
    ├── data.sql           # Sample data
    └── reports.sql        # Stored procedures
```

## API Endpoints

### User Endpoints
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile
- `GET /api/users/orders` - Get user orders

### Book Endpoints
- `GET /api/books/` - Get all books
- `GET /api/books/search` - Search books
- `POST /api/books/orders` - Create order

### Admin Endpoints (Require Admin role)
- `GET /api/admins/books` - List all books
- `POST /api/admins/books` - Create book
- `PUT /api/admins/books/<isbn>` - Update book
- `DELETE /api/admins/books/<isbn>` - Delete book
- `GET /api/admins/publisher-orders` - List publisher orders
- `PUT /api/admins/publisher-orders/<id>/confirm` - Confirm order
- `GET /api/admins/customer-orders` - List customer orders
- `GET /api/admins/reports/*` - Various reports

## Development Tips

1. **Backend Development**
   - Use `debug=True` in `run.py` for auto-reload
   - Check Flask console for errors
   - Use Postman/Thunder Client to test API endpoints

2. **Frontend Development**
   - Use browser DevTools to check network requests
   - Check console for errors
   - React Hot Reload should work automatically

3. **Database Development**
   - Use MySQL Workbench or command line for queries
   - Test triggers and procedures manually
   - Keep backups before major changes

## Production Deployment

For production:
1. Set `FLASK_ENV=production` and `FLASK_DEBUG=False`
2. Use environment variables for secrets
3. Configure proper CORS origins
4. Use a production WSGI server (gunicorn, uWSGI)
5. Set up proper database credentials
6. Configure Next.js for production build

## Support

If you encounter issues:
1. Check all services are running (MySQL, Backend, Frontend)
2. Verify database connection settings
3. Check console/terminal for error messages
4. Verify environment variables are set correctly


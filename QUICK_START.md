# Quick Start Guide

## Prerequisites Check
- [ ] MySQL is installed and running
- [ ] Python 3.8+ is installed
- [ ] Node.js 18+ is installed

## Step 1: Setup Database (One-time setup)

```bash
# Login to MySQL
mysql -u root -p

# Then run these commands in MySQL:
source Database/database.sql
source Database/triggers.sql
source Database/data.sql
source Database/reports.sql
```

Or from command line:
```bash
mysql -u root -p < Database/database.sql
mysql -u root -p < Database/triggers.sql
mysql -u root -p < Database/data.sql
mysql -u root -p < Database/reports.sql
```

## Step 2: Setup Backend

```bash
cd Backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python run.py
```

Backend will run on: http://localhost:5000

## Step 3: Setup Frontend

Open a NEW terminal:

```bash
cd Frontend/ordering_system
npm install

# Create .env.local file with:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
# AUTH_SECRET=your-random-secret-here
# NEXTAUTH_URL=http://localhost:3000

npm run dev
```

Frontend will run on: http://localhost:3000

## Step 4: Test the Application

1. Open browser: http://localhost:3000
2. Register a new account or login
3. Browse books, add to cart, and checkout

## Default Test Accounts

After running data.sql, you can login with:
- Username: `john_doe`
- Password: Check the data.sql file for the actual password hash, or register a new account

## Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database `Book_Order_Processing_System` exists
- Check `Backend/config.py` has correct DB credentials

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`
- Restart frontend after changing env variables

### Database errors
- Make sure all SQL scripts ran successfully
- Verify you're using database: `Book_Order_Processing_System`
- Check MySQL user has proper permissions


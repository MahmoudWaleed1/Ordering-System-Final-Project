# 🚀 How to Run the Ordering System

Complete step-by-step guide to run the entire system.

## 📋 Prerequisites Check

Before starting, make sure you have:
- ✅ MySQL/MariaDB installed and running
- ✅ Python 3.8+ installed
- ✅ Node.js 18+ and npm installed

## Step 1: Setup Database (First Time Only)

### Option A: Using MySQL Command Line

1. **Open MySQL Command Line:**
   ```bash
   mysql -u root -p
   ```
   Enter your MySQL password when prompted.

2. **Run the SQL scripts in order:**
   ```sql
   source Database/database.sql;
   source Database/triggers.sql;
   source Database/data.sql;
   source Database/reports.sql;
   ```

3. **Verify database was created:**
   ```sql
   SHOW DATABASES;
   USE Book_Order_Processing_System;
   SHOW TABLES;
   ```

### Option B: Using Command Line (One-liner)

```bash
# Navigate to project root
cd "C:\Users\abdel\OneDrive\Desktop\College\Database\Ordering-System-Final-Project"

# Run all SQL scripts
mysql -u root -p < Database/database.sql
mysql -u root -p < Database/triggers.sql
mysql -u root -p < Database/data.sql
mysql -u root -p < Database/reports.sql
```

**Note:** You'll be prompted for MySQL password each time.

## Step 2: Start Backend Server

### Option A: Using Python Directly

1. **Open a terminal/command prompt**

2. **Navigate to Backend folder:**
   ```bash
   cd Backend
   ```

3. **Create virtual environment (first time only):**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Install dependencies (first time only):**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the backend server:**
   ```bash
   python run.py
   ```

   You should see:
   ```
   * Running on http://0.0.0.0:5000
   * Debug mode: on
   ```

### Option B: Using the Script (Windows)

1. **Double-click `start_backend.bat`**

   Or from command line:
   ```bash
   start_backend.bat
   ```

### Option C: Using the Script (Linux/Mac)

```bash
chmod +x start_backend.sh
./start_backend.sh
```

**✅ Backend is running when you see:** `Running on http://0.0.0.0:5000`

**Test it:** Open browser to http://localhost:5000/health - should show `{"status": "ok"}`

## Step 3: Start Frontend Server

### Important: Open a NEW terminal/command prompt window!

### Option A: Using npm Directly

1. **Open a NEW terminal/command prompt**

2. **Navigate to Frontend folder:**
   ```bash
   cd Frontend/ordering_system
   ```

3. **Install dependencies (first time only):**
   ```bash
   npm install
   ```

4. **Create environment file:**
   
   Create a file named `.env.local` in `Frontend/ordering_system/` with:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   AUTH_SECRET=your-random-secret-key-here-make-it-long-and-random
   NEXTAUTH_URL=http://localhost:3000
   ```

   **Generate a random secret:**
   - Windows PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))`
   - Linux/Mac: `openssl rand -base64 32`
   - Or use any random string generator

5. **Start the frontend server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ▲ Next.js 16.1.0
   - Local:        http://localhost:3000
   ```

### Option B: Using the Script (Windows)

1. **Double-click `start_frontend.bat`**

   Or from command line:
   ```bash
   start_frontend.bat
   ```

### Option C: Using the Script (Linux/Mac)

```bash
chmod +x start_frontend.sh
./start_frontend.sh
```

**✅ Frontend is running when you see:** `Local: http://localhost:3000`

## Step 4: Access the Application

1. **Open your web browser**

2. **Go to:** http://localhost:3000

3. **You should see the homepage!**

## 🎯 Quick Start (After First Setup)

Once everything is set up, to run the system:

### Terminal 1 - Backend:
```bash
cd Backend
# Activate venv if needed: venv\Scripts\activate (Windows) or source venv/bin/activate (Linux/Mac)
python run.py
```

### Terminal 2 - Frontend:
```bash
cd Frontend/ordering_system
npm run dev
```

## ✅ Verification Checklist

- [ ] MySQL is running
- [ ] Database `Book_Order_Processing_System` exists
- [ ] Backend shows: `Running on http://0.0.0.0:5000`
- [ ] http://localhost:5000/health returns `{"status": "ok"}`
- [ ] Frontend shows: `Local: http://localhost:3000`
- [ ] http://localhost:3000 loads the homepage
- [ ] Can register/login
- [ ] Can browse books
- [ ] Can add to cart

## 🧪 Test the Connection

### Test Backend:
```bash
# In browser or using curl
curl http://localhost:5000/health
# Should return: {"status": "ok"}
```

### Test Database Connection:
```bash
cd Backend
python test_connection.py
# Should show all tests passed ✅
```

### Test Frontend:
1. Open http://localhost:3000
2. Try to register a new account
3. Login and browse books

## 🐛 Troubleshooting

### Backend won't start

**Error: "Module not found"**
```bash
cd Backend
pip install -r requirements.txt
```

**Error: "Can't connect to MySQL"**
- Check MySQL is running
- Verify database name in `Backend/config.py` is `Book_Order_Processing_System`
- Check DB_USER and DB_PASSWORD in `Backend/config.py`

**Error: "Port 5000 already in use"**
- Change port in `Backend/run.py`: `app.run(port=5001)`
- Update frontend `.env.local`: `NEXT_PUBLIC_API_BASE_URL=http://localhost:5001`

### Frontend won't start

**Error: "Module not found"**
```bash
cd Frontend/ordering_system
npm install
```

**Error: "Can't connect to API"**
- Make sure backend is running on port 5000
- Check `.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`
- Restart frontend after changing `.env.local`

**Error: "AUTH_SECRET not set"**
- Create `.env.local` file
- Add `AUTH_SECRET=your-random-secret`

### Database errors

**Error: "Table doesn't exist"**
- Run all SQL scripts in order:
  ```bash
  mysql -u root -p < Database/database.sql
  mysql -u root -p < Database/triggers.sql
  mysql -u root -p < Database/data.sql
  mysql -u root -p < Database/reports.sql
  ```

## 📊 What Should Be Running

When everything is working, you should have:

1. **MySQL Server** - Running in background
2. **Backend Terminal** - Showing Flask server on port 5000
3. **Frontend Terminal** - Showing Next.js server on port 3000
4. **Browser** - Open to http://localhost:3000

## 🎉 You're Ready!

Once both servers are running:
- ✅ Backend: http://localhost:5000
- ✅ Frontend: http://localhost:3000

You can now:
- Register new accounts
- Login
- Browse books
- Add to cart
- Place orders
- View order history
- Access admin dashboard (if logged in as Admin)

## 💡 Tips

1. **Keep both terminals open** - Backend and Frontend need to run simultaneously
2. **Check terminal output** - Errors will show in the terminal
3. **Browser console** - Press F12 to see frontend errors
4. **Backend logs** - Check the Flask terminal for API requests
5. **Database** - Use MySQL Workbench or command line to verify data

## 🛑 To Stop the Servers

- **Backend**: Press `Ctrl+C` in the backend terminal
- **Frontend**: Press `Ctrl+C` in the frontend terminal
- **MySQL**: Usually runs as a service, leave it running

---

**Need help?** Check `SETUP.md` for detailed setup or `QUICK_START.md` for a condensed guide.


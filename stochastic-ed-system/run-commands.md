# Commands to Run Backend and Frontend

## Backend Commands (from stochastic-ed-system directory)

### Activate Virtual Environment and Run Backend:
```bash
cd backend
# Activate virtual environment (venv already exists)
source venv/Scripts/activate  # On Windows with Git Bash
# OR
venv\Scripts\activate.bat     # On Windows CMD
# OR  
venv\Scripts\Activate.ps1     # On Windows PowerShell

# Run the backend server
python app.py
```

## Frontend Commands (from stochastic-ed-system directory)

### Run Frontend Development Server:
```bash
cd frontend
npm run dev
```

## Quick Start (Run Both)

### Terminal 1 - Backend:
```bash
cd stochastic-ed-system/backend
source venv/Scripts/activate
python app.py
```

### Terminal 2 - Frontend:
```bash
cd stochastic-ed-system/frontend  
npm run dev
```

The backend will run on `http://localhost:8000`
The frontend will run on `http://localhost:5173`
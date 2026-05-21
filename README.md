# InsightX AI Sales & Revenue Analytics Dashboard

A futuristic, premium analytics dashboard built with **FastAPI** (Backend) and **Vanilla HTML/CSS/JS** (Frontend).

## Features
- 🚀 **FastAPI Backend**: CRUD operations, file uploads (CSV/Excel), and analytics endpoints.
- 🎨 **Futuristic UI**: Dark theme, glassmorphism, neon effects, and smooth animations.
- 📊 **Dynamic Charts**: Powered by Chart.js with real-time updates.
- 📂 **Data Import**: Drag & drop CSV/Excel upload.
- 📝 **Manual Entry**: Excel-like spreadsheet editor using Handsontable.
- 🤖 **AI Insights**: Simulated smart insights based on your sales data.
- 💬 **AI Chat Widget**: Interactive assistant for quick data queries.
- 📄 **Report Generation**: Export dashboard to PDF or data to CSV.

## Getting Started

### 1. Backend Setup
Make sure you have Python installed.
```bash
cd backend
pip install -r requirements.txt
python main.py
```
The API will run at `http://localhost:8000`.

### 2. Frontend Setup
Open `frontend/index.html` in your browser. (Using a Live Server is recommended for optimal performance).

## File Structure
- `backend/`: FastAPI application, models, and database logic.
- `frontend/`: Dashboard UI, styles, and interactive scripts.
- `data/`: Sample CSV data for testing.
- `insightx.db`: SQLite database (generated automatically).

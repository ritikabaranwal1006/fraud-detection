# 🛡️ Fraud Detection System — Full Stack

XGBoost + FastAPI backend · React + Vite frontend

---

## 📁 Project Structure

```
fraud-detection/
│
├── app/                        ← Backend (FastAPI)
│   ├── __init__.py
│   ├── main.py                 ← API server + /predict endpoint
│   ├── schemas.py              ← Pydantic: Transaction + PredictionResult
│   └── utils.py                ← feature_engineering() pipeline
│
├── models/                     ← Trained ML artifacts (DO NOT DELETE)
│   ├── fraud_model.joblib
│   ├── encoder.joblib
│   └── model_columns.joblib
│
├── dataset/                    ← Training data
│   └── fraudTrain.csv
│
├── scripts/                    ← (Optional) training scripts
│
├── frontend/                   ← React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx            ← Entry point
│       ├── App.jsx
│       ├── index.css           ← Global styles
│       ├── api/
│       │   └── fraudApi.js     ← axios calls to FastAPI
│       ├── components/
│       │   ├── StatsCards.jsx      ← 4 live metric cards
│       │   ├── TransactionForm.jsx ← Input form (9 fields)
│       │   ├── ResultCard.jsx      ← Fraud/Medium/Safe result
│       │   ├── HistoryTable.jsx    ← Session history table
│       │   └── Charts.jsx          ← Doughnut + Bar charts
│       └── pages/
│           └── Dashboard.jsx       ← Main layout page
│
├── requirements.txt
├── README.md
└── TODO.md
```

---

## 🚀 How to Run

### ⚠️ You need TWO terminals open at the same time

---

### Terminal 1 — Backend

```bash
# 1. Go to project root (where requirements.txt is)
cd fraud-detection

# 2. Create virtual environment (first time only)
python -m venv venv

# 3. Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install packages (first time only)
pip install -r requirements.txt

# 5. Start backend
uvicorn app.main:app --reload --port 8000
```

✅ You should see:
```
✅ Model artifacts loaded successfully.
INFO: Uvicorn running on http://127.0.0.1:8000
```

---

### Terminal 2 — Frontend

```bash
# 1. Go to frontend folder
cd fraud-detection/frontend

# 2. Install packages (first time only)
npm install

# 3. Start frontend
npm run dev
```

✅ You should see:
```
VITE ready
➜  Local: http://localhost:5173/
```

---

### 🌐 Open Browser

```
http://localhost:5173
```

---

## 🧪 Test API Directly

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "amt": 249.99,
    "category": "shopping_net",
    "merchant": "Amazon",
    "city_pop": 45000,
    "lat": 40.7128,
    "long": -74.0060,
    "merch_lat": 40.7580,
    "merch_long": -73.9855,
    "trans_date_trans_time": "2024-06-15 14:30:00"
  }'
```

Expected:
```json
{ "is_fraud": false, "probability": 0.043 }
```

---

## ❌ Delete From Your Existing Project

Before using this zip, delete these from your old project:
- `my-vite-app/` folder
- `node_modules/` folder (at root level)
- `package.json` and `package-lock.json` at root level

Keep: `venv/`, `scripts/`, `app/`, `models/`, `dataset/`

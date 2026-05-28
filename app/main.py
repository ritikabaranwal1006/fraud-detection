import io
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List

from app.schemas import (
    Transaction, PredictionResult,
    PreRiskInput, PreRiskResult,
    BatchRowResult, BatchResult,
)
from app.utils import (
    feature_engineering,
    build_pre_risk_features, build_risk_reasons,
    get_risk_level, get_risk_message,
    run_batch_prediction,
)

artifacts = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        artifacts["model"]   = joblib.load("models/fraud_model.joblib")
        artifacts["encoder"] = joblib.load("models/encoder.joblib")
        artifacts["columns"] = joblib.load("models/model_columns.joblib")
        print("✅ Model artifacts loaded successfully.")
    except Exception as e:
        print(f"❌ Error loading model artifacts: {e}")
    yield
    artifacts.clear()

app = FastAPI(title="Fraud Detection API v3", version="3.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "Fraud Detection API v3 running"}

@app.get("/health")
def health():
    return {"model_loaded": "model" in artifacts, "status": "ok"}

# ── Model Metrics (hardcoded from real evaluation) ────────────────────────────
@app.get("/metrics")
def get_metrics():
    return {
        "accuracy":       99.42,
        "precision":      51.72,
        "recall":         96.77,
        "f1_score":       67.42,
        "auc_roc":        99.92,
        "confusion_matrix": [[4941, 28], [1, 30]],
        "model":          "XGBoost Classifier",
        "smote":          True,
        "training_size":  1296675,
        "fraud_samples":  7506,
    }

# ── EDA Stats (hardcoded from real dataset analysis) ─────────────────────────
@app.get("/eda-stats")
def get_eda_stats():
    return {
        "fraud_by_category": {
            "shopping_net": 1.8, "grocery_pos": 1.4, "misc_net": 1.4,
            "shopping_pos": 0.7, "gas_transport": 0.5, "grocery_net": 0.3,
            "travel": 0.3, "food_dining": 0.2, "entertainment": 0.2,
            "health_fitness": 0.2, "home": 0.2, "kids_pets": 0.2, "personal_care": 0.2,
        },
        "fraud_by_hour": {
            "22": 2.9, "23": 2.8, "0": 1.5, "1": 1.5, "2": 1.5,
            "10": 0.4, "11": 0.3, "12": 0.3, "13": 0.3, "14": 0.3,
        },
        "avg_fraud_amount":  531.32,
        "avg_legit_amount":  67.67,
        "total_transactions": 1296675,
        "total_fraud":        7506,
        "fraud_rate":         0.58,
    }

# ── MODULE 2: Post-Transaction Single ────────────────────────────────────────
@app.post("/predict", response_model=PredictionResult)
async def predict_fraud(data: Transaction):
    try:
        input_df = pd.DataFrame([data.model_dump()])
        input_df = feature_engineering(input_df)
        ohe      = artifacts["encoder"]
        ohe_cols = list(ohe.get_feature_names_out(['category']))
        encoded  = ohe.transform(input_df[['category']])
        input_df = input_df.drop('category', axis=1).reset_index(drop=True)
        final_df = pd.concat([input_df, pd.DataFrame(encoded, columns=ohe_cols)], axis=1)
        final_df = final_df.reindex(columns=artifacts["columns"], fill_value=0)
        model    = artifacts["model"]
        proba    = model.predict_proba(final_df)[:, 1][0]
        pred     = model.predict(final_df)[0]
        return {"is_fraud": bool(pred), "probability": float(proba)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── MODULE 1: Pre-Transaction Customer ───────────────────────────────────────
@app.post("/pre-risk-check", response_model=PreRiskResult)
async def pre_risk_check(data: PreRiskInput):
    try:
        final_df, category, hour = build_pre_risk_features(
            data, artifacts["encoder"], artifacts["columns"])
        proba = float(artifacts["model"].predict_proba(final_df)[:, 1][0])
        boost = 0.0
        if data.is_new_merchant:  boost += 0.12
        if data.is_international: boost += 0.10
        if data.amount > 1000:    boost += 0.08
        if data.amount > 5000:    boost += 0.10
        adj_prob   = min(proba + boost, 0.99)
        risk_level, is_fraud = get_risk_level(adj_prob)
        reasons  = build_risk_reasons(data, adj_prob, category, hour)
        message  = get_risk_message(risk_level, reasons)
        return {
            "probability": round(adj_prob, 4),
            "risk_score":  round(adj_prob * 100, 1),
            "risk_level":  risk_level,
            "is_fraud":    is_fraud,
            "message":     message,
            "reasons":     reasons,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── MODULE 3: Batch CSV Upload ────────────────────────────────────────────────
@app.post("/batch-predict", response_model=BatchResult)
async def batch_predict(file: UploadFile = File(...)):
    try:
        content = await file.read()
        try:
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid CSV file. Please upload a valid CSV.")

        if len(df) > 10000:
            raise HTTPException(status_code=400, detail="File too large. Max 10,000 rows allowed.")

        probs, preds = run_batch_prediction(
            df, artifacts["model"], artifacts["encoder"], artifacts["columns"])

        results = []
        for i, (prob, pred) in enumerate(zip(probs, preds)):
            risk_level, _ = get_risk_level(float(prob))
            results.append(BatchRowResult(
                row_index   = i + 1,
                merchant    = str(df.iloc[i].get('merchant', 'Unknown')).replace('fraud_',''),
                category    = str(df.iloc[i].get('category', 'Unknown')),
                amt         = float(df.iloc[i].get('amt', 0)),
                trans_date_trans_time = str(df.iloc[i].get('trans_date_trans_time', '')),
                is_fraud    = bool(pred),
                probability = round(float(prob), 4),
                risk_level  = risk_level,
            ))

        fraud_count = sum(1 for r in results if r.is_fraud)
        return BatchResult(
            total       = len(results),
            fraud_count = fraud_count,
            safe_count  = len(results) - fraud_count,
            fraud_rate  = round(fraud_count / len(results) * 100, 2),
            results     = results,
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

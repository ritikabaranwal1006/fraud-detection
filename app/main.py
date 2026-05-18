import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.schemas import (
    Transaction, PredictionResult,
    PreRiskInput, PreRiskResult
)
from app.utils import (
    feature_engineering,
    build_pre_risk_features,
    build_risk_reasons,
    get_risk_level,
    get_risk_message,
)

# ── Global artifacts store ────────────────────────────────────────────────────
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

app = FastAPI(title="Fraud Detection API — Dual Module", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health routes ─────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"status": "Fraud Detection API v2.0 running", "modules": ["pre-risk-check", "predict"]}

@app.get("/health")
def health():
    return {"model_loaded": "model" in artifacts, "status": "ok"}

# ── MODULE 2: Post-Transaction (existing, unchanged) ─────────────────────────
@app.post("/predict", response_model=PredictionResult)
async def predict_fraud(data: Transaction):
    """Bank analyst: analyze a completed transaction."""
    try:
        input_df = pd.DataFrame([data.model_dump()])
        input_df = feature_engineering(input_df)

        ohe      = artifacts["encoder"]
        ohe_cols = list(ohe.get_feature_names_out(['category']))
        encoded  = ohe.transform(input_df[['category']])
        input_df = input_df.drop('category', axis=1).reset_index(drop=True)
        final_df = pd.concat([input_df, pd.DataFrame(encoded, columns=ohe_cols)], axis=1)
        final_df = final_df.reindex(columns=artifacts["columns"], fill_value=0)

        model      = artifacts["model"]
        proba      = model.predict_proba(final_df)[:, 1][0]
        prediction = model.predict(final_df)[0]

        return {"is_fraud": bool(prediction), "probability": float(proba)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── MODULE 1: Pre-Transaction Risk Check (NEW) ────────────────────────────────
@app.post("/pre-risk-check", response_model=PreRiskResult)
async def pre_risk_check(data: PreRiskInput):
    """Customer: check risk BEFORE making a payment."""
    try:
        final_df, category, hour = build_pre_risk_features(
            data, artifacts["encoder"], artifacts["columns"]
        )

        model      = artifacts["model"]
        proba      = float(model.predict_proba(final_df)[:, 1][0])

        # Apply risk boosters for customer-side factors
        boost = 0.0
        if data.is_new_merchant:   boost += 0.12
        if data.is_international:  boost += 0.10
        if data.amount > 1000:     boost += 0.08
        if data.amount > 5000:     boost += 0.10

        adjusted_prob = min(proba + boost, 0.99)
        risk_score    = round(adjusted_prob * 100, 1)
        risk_level, is_fraud = get_risk_level(adjusted_prob)
        reasons  = build_risk_reasons(data, adjusted_prob, category, hour)
        message  = get_risk_message(risk_level, reasons)

        return {
            "probability": round(adjusted_prob, 4),
            "risk_score":  risk_score,
            "risk_level":  risk_level,
            "is_fraud":    is_fraud,
            "message":     message,
            "reasons":     reasons,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

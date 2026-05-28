from pydantic import BaseModel
from typing import List, Optional

# ── Post-Transaction (Analyst single) ────────────────────────────────────────
class Transaction(BaseModel):
    category: str
    amt: float
    city_pop: int
    lat: float
    long: float
    merch_lat: float
    merch_long: float
    trans_date_trans_time: str
    merchant: str

class PredictionResult(BaseModel):
    is_fraud: bool
    probability: float

# ── Pre-Transaction (Customer) ────────────────────────────────────────────────
class PreRiskInput(BaseModel):
    amount: float
    merchant_name: str
    merchant_category: str
    payment_method: str
    city: str
    is_international: bool
    is_new_merchant: bool

class PreRiskResult(BaseModel):
    probability: float
    risk_score: float
    risk_level: str
    is_fraud: bool
    message: str
    reasons: List[str]

# ── Batch Upload Result ───────────────────────────────────────────────────────
class BatchRowResult(BaseModel):
    row_index: int
    merchant: str
    category: str
    amt: float
    trans_date_trans_time: str
    is_fraud: bool
    probability: float
    risk_level: str

class BatchResult(BaseModel):
    total: int
    fraud_count: int
    safe_count: int
    fraud_rate: float
    results: List[BatchRowResult]

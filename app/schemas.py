from pydantic import BaseModel
from typing import List

# ── Existing Post-Transaction Schema (unchanged) ──────────────────────────────
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

# ── NEW: Pre-Transaction Schema (customer-friendly fields) ────────────────────
class PreRiskInput(BaseModel):
    amount: float                 # Transaction Amount
    merchant_name: str            # Merchant Name
    merchant_category: str        # Merchant Category
    payment_method: str           # credit_card / debit_card / upi / netbanking
    city: str                     # Transaction City
    is_international: bool        # International transaction?
    is_new_merchant: bool         # First time with this merchant?

class PreRiskResult(BaseModel):
    probability: float
    risk_score: float             # 0-100
    risk_level: str               # Low / Medium / High
    is_fraud: bool
    message: str
    reasons: List[str]

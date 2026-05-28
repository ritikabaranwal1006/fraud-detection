import math
import pandas as pd
from datetime import datetime

# ── Post-transaction feature engineering (unchanged) ─────────────────────────
def calculate_distance(row):
    return math.sqrt((row['lat'] - row['merch_lat'])**2 + (row['long'] - row['merch_long'])**2)

def feature_engineering(df):
    def safe_parse_dt(dt_str):
        try:    return pd.to_datetime(dt_str)
        except: return pd.to_datetime('2020-01-01 12:00:00')

    df = df.copy()
    df['trans_date_trans_time'] = df['trans_date_trans_time'].apply(safe_parse_dt)
    df['hour']     = df['trans_date_trans_time'].dt.hour
    df['dow']      = df['trans_date_trans_time'].dt.dayofweek
    df['month']    = df['trans_date_trans_time'].dt.month
    df['distance'] = df.apply(calculate_distance, axis=1)
    df['merchant'] = df['merchant'].str.replace('fraud_', '', regex=False)
    df['amt_per_city_pop'] = df['amt'] / (df['city_pop'] + 1)
    return df[['category','amt','city_pop','distance','hour','dow','month','amt_per_city_pop']]

# ── Pre-transaction helpers ───────────────────────────────────────────────────
CATEGORY_MAP = {
    'Grocery Store':    'grocery_pos',
    'Online Shopping':  'shopping_net',
    'Entertainment':    'entertainment',
    'Fuel / Transport': 'gas_transport',
    'Food & Dining':    'food_dining',
    'Health & Fitness': 'health_fitness',
    'Travel':           'travel',
    'Kids & Pets':      'kids_pets',
    'Personal Care':    'personal_care',
    'Home & Garden':    'home',
    'Miscellaneous':    'misc_net',
}
HIGH_RISK_CATEGORIES = ['shopping_net','misc_net','grocery_pos','entertainment']

def build_pre_risk_features(data, encoder, columns):
    now      = datetime.now()
    category = CATEGORY_MAP.get(data.merchant_category, 'misc_net')
    city_pop = 500 if data.is_international else 50000
    distance = 15.0 if data.is_international else (3.5 if data.is_new_merchant else 0.8)

    row = {
        'amt': data.amount, 'city_pop': city_pop, 'distance': distance,
        'hour': now.hour, 'dow': now.weekday(), 'month': now.month,
        'amt_per_city_pop': data.amount / (city_pop + 1),
    }
    df = pd.DataFrame([row])
    ohe_cols = list(encoder.get_feature_names_out(['category']))
    encoded  = encoder.transform(pd.DataFrame([{'category': category}])[['category']])
    final_df = pd.concat([df, pd.DataFrame(encoded, columns=ohe_cols)], axis=1)
    final_df = final_df.reindex(columns=columns, fill_value=0)
    return final_df, category, now.hour

def build_risk_reasons(data, probability, category, hour):
    reasons = []
    if data.is_new_merchant:   reasons.append("First-time transaction with this merchant")
    if data.is_international:  reasons.append("International transaction detected")
    if data.amount > 500:      reasons.append(f"High transaction amount (₹{data.amount:,.2f})")
    if hour >= 22 or hour <= 5: reasons.append(f"Unusual transaction time ({hour}:00 hrs — late night)")
    if category in HIGH_RISK_CATEGORIES: reasons.append(f"High-risk merchant category: {data.merchant_category}")
    if probability > 0.6:      reasons.append("ML model detected suspicious transaction pattern")
    if not reasons:            reasons.append("No major risk factors detected")
    return reasons

def get_risk_level(probability):
    if probability >= 0.6:   return "High", True
    elif probability >= 0.3: return "Medium", False
    else:                    return "Low", False

def get_risk_message(risk_level, reasons):
    if risk_level == "High":
        return f"⚠️ Warning: This transaction appears risky. {reasons[0]}. We recommend verifying before proceeding."
    elif risk_level == "Medium":
        return "🟡 Caution: This transaction has some risk indicators. Please double-check the merchant details."
    return "✅ This transaction appears safe. No major risk factors were detected."

# ── Batch upload helper ───────────────────────────────────────────────────────
REQUIRED_COLS = {'merchant','category','amt','city_pop','lat','long',
                 'merch_lat','merch_long','trans_date_trans_time'}

def validate_batch_df(df):
    missing = REQUIRED_COLS - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {', '.join(missing)}")
    return True

def run_batch_prediction(df, model, encoder, columns):
    df = df.copy()
    validate_batch_df(df)
    feat = feature_engineering(df)
    ohe_cols = list(encoder.get_feature_names_out(['category']))
    encoded  = encoder.transform(feat[['category']])
    feat2    = feat.drop('category', axis=1).reset_index(drop=True)
    final_df = pd.concat([feat2, pd.DataFrame(encoded, columns=ohe_cols)], axis=1)
    final_df = final_df.reindex(columns=columns, fill_value=0)
    probs    = model.predict_proba(final_df)[:,1]
    preds    = model.predict(final_df)
    return probs, preds

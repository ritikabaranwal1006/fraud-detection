import math
import pandas as pd
from datetime import datetime

# ── Existing feature engineering (unchanged) ─────────────────────────────────
def calculate_distance(row):
    return math.sqrt((row['lat'] - row['merch_lat'])**2 + (row['long'] - row['merch_long'])**2)

def feature_engineering(df):
    def safe_parse_dt(dt_str):
        try:
            return pd.to_datetime(dt_str)
        except:
            return pd.to_datetime('2020-01-01 12:00:00')

    df['trans_date_trans_time'] = df['trans_date_trans_time'].apply(safe_parse_dt)
    df['hour']     = df['trans_date_trans_time'].dt.hour
    df['dow']      = df['trans_date_trans_time'].dt.dayofweek
    df['month']    = df['trans_date_trans_time'].dt.month
    df['distance'] = df.apply(calculate_distance, axis=1)
    df['merchant'] = df['merchant'].str.replace('fraud_', '', regex=False)
    df['amt_per_city_pop'] = df['amt'] / (df['city_pop'] + 1)

    cols_to_keep = ['category', 'amt', 'city_pop', 'distance', 'hour', 'dow', 'month', 'amt_per_city_pop']
    return df[cols_to_keep]


# ── NEW: Pre-transaction feature builder ──────────────────────────────────────
# Category mapping from user-friendly to dataset category names
CATEGORY_MAP = {
    'Grocery Store':      'grocery_pos',
    'Online Shopping':    'shopping_net',
    'Entertainment':      'entertainment',
    'Fuel / Transport':   'gas_transport',
    'Food & Dining':      'food_dining',
    'Health & Fitness':   'health_fitness',
    'Travel':             'travel',
    'Kids & Pets':        'kids_pets',
    'Personal Care':      'personal_care',
    'Home & Garden':      'home',
    'Miscellaneous':      'misc_net',
}

# High-risk categories based on dataset fraud analysis
HIGH_RISK_CATEGORIES = ['shopping_net', 'misc_net', 'grocery_pos', 'entertainment']

def build_pre_risk_features(data, encoder, columns):
    """
    Convert customer-friendly PreRiskInput into ML features
    and return probability + risk reasons.
    """
    now = datetime.now()
    hour  = now.hour
    dow   = now.weekday()
    month = now.month

    # Map user category to dataset category
    category = CATEGORY_MAP.get(data.merchant_category, 'misc_net')

    # Simulate city_pop: international = small/unknown city
    city_pop = 500 if data.is_international else 50000

    # Simulate distance: international = large distance, new merchant = moderate
    if data.is_international:
        distance = 15.0
    elif data.is_new_merchant:
        distance = 3.5
    else:
        distance = 0.8

    amt_per_city_pop = data.amount / (city_pop + 1)

    # Build feature DataFrame matching training columns
    row = {
        'amt':             data.amount,
        'city_pop':        city_pop,
        'distance':        distance,
        'hour':            hour,
        'dow':             dow,
        'month':           month,
        'amt_per_city_pop': amt_per_city_pop,
    }

    import pandas as pd
    df = pd.DataFrame([row])

    # One-hot encode category
    cat_df = pd.DataFrame([{'category': category}])
    ohe_cols = list(encoder.get_feature_names_out(['category']))
    encoded  = encoder.transform(cat_df[['category']])
    cat_encoded = pd.DataFrame(encoded, columns=ohe_cols)
    final_df = pd.concat([df.reset_index(drop=True), cat_encoded], axis=1)
    final_df = final_df.reindex(columns=columns, fill_value=0)

    return final_df, category, hour


def build_risk_reasons(data, probability, category, hour):
    """Generate human-readable reasons for the risk score."""
    reasons = []

    if data.is_new_merchant:
        reasons.append("First-time transaction with this merchant")
    if data.is_international:
        reasons.append("International transaction detected")
    if data.amount > 500:
        reasons.append(f"High transaction amount (₹{data.amount:,.2f})")
    if hour >= 22 or hour <= 5:
        reasons.append(f"Unusual transaction time ({hour}:00 hrs — late night)")
    if category in HIGH_RISK_CATEGORIES:
        reasons.append(f"High-risk merchant category: {data.merchant_category}")
    if probability > 0.6:
        reasons.append("ML model detected suspicious transaction pattern")

    if not reasons:
        reasons.append("No major risk factors detected")

    return reasons


def get_risk_level(probability):
    if probability >= 0.6:
        return "High", True
    elif probability >= 0.3:
        return "Medium", False
    else:
        return "Low", False


def get_risk_message(risk_level, reasons):
    if risk_level == "High":
        return f"⚠️ Warning: This transaction appears risky. {reasons[0] if reasons else 'Multiple suspicious factors detected.'}. We recommend verifying before proceeding."
    elif risk_level == "Medium":
        return f"🟡 Caution: This transaction has some risk indicators. Please double-check the merchant details before payment."
    else:
        return "✅ This transaction appears safe. No major risk factors were detected."

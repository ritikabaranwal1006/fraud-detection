import pandas as pd
import joblib
import os
from sklearn.preprocessing import OneHotEncoder
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import math

# Use the same feature engineering from your notebook
def calculate_distance(row):
    return math.sqrt((row['lat'] - row['merch_lat'])**2 + (row['long'] - row['merch_long'])**2)

def feature_engineering(df):
    df['trans_date_trans_time'] = pd.to_datetime(df['trans_date_trans_time'])
    df['hour'] = df['trans_date_trans_time'].dt.hour
    df['dow'] = df['trans_date_trans_time'].dt.dayofweek
    df['month'] = df['trans_date_trans_time'].dt.month
    df['distance'] = df.apply(calculate_distance, axis=1)
    df['merchant'] = df['merchant'].str.replace('fraud_', '')
    df['amt_per_city_pop'] = df['amt'] / (df['city_pop'] + 1)
    return df

def train():
    # Load data
    train_df = pd.read_csv('dataset/fraudTrain.csv', index_col='Unnamed: 0')
    train_df = feature_engineering(train_df)
    
    features = ['category', 'amt', 'city_pop', 'distance', 'hour', 'dow', 'month', 'amt_per_city_pop']
    target = 'is_fraud'
    
    X_train = train_df[features].copy()
    y_train = train_df[target].copy()
    
    # Encoder
    ohe = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    X_train_ohe = ohe.fit_transform(X_train[['category']])
    ohe_cols = list(ohe.get_feature_names_out(['category']))
    
    X_train = X_train.drop('category', axis=1).reset_index(drop=True)
    X_train = pd.concat([X_train, pd.DataFrame(X_train_ohe, columns=ohe_cols)], axis=1)
    
    # Save column names to ensure the API uses the exact same order later
    model_columns = list(X_train.columns)
    
    # SMOTE
    smote = SMOTE(random_state=42)
    X_res, y_res = smote.fit_resample(X_train, y_train)
    
    # Model
    model = Pipeline(steps=[
        ('scaler', StandardScaler()),
        ('classifier', XGBClassifier(n_estimators=200, max_depth=8, learning_rate=0.1, random_state=42))
    ])
    
    model.fit(X_res, y_res)
    
    # Create models directory if not exists
    os.makedirs('models', exist_ok=True)
    
    # Save artifacts
    joblib.dump(model, 'models/fraud_model.joblib')
    joblib.dump(ohe, 'models/encoder.joblib')
    joblib.dump(model_columns, 'models/model_columns.joblib')
    print("Model training complete and saved to /models")

if __name__ == "__main__":
    train()
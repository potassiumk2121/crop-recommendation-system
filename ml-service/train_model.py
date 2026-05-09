"""
Train a Random Forest classifier for crop recommendation and persist with pickle.

Step-by-step (what this script does):
1. Loads `data/Crop_recommendation.csv` if present; otherwise builds a reproducible synthetic dataset from crop-specific ranges (good for demos and CI).
2. Splits features (N, P, K, temperature, humidity, ph, rainfall) and target label (crop).
3. Trains sklearn RandomForestClassifier with fixed random_state for reproducibility.
4. Evaluates hold-out accuracy and prints a short classification report (optional verbosity).
5. Writes `models/crop_model.pkl` via pickle — loaded by Flask at startup.

Run:  python train_model.py
"""

from __future__ import annotations

import os
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "Crop_recommendation.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "crop_model.pkl"

FEATURE_COLUMNS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

# Rough agronomic ranges per crop for synthetic fallback data (education / portfolio demo).
CROP_PROFILES: dict[str, dict[str, tuple[float, float]]] = {
    "rice": {"N": (75, 100), "P": (35, 50), "K": (35, 50), "temperature": (20, 28), "humidity": (80, 90), "ph": (5.8, 6.8), "rainfall": (180, 250)},
    "maize": {"N": (75, 95), "P": (45, 60), "K": (40, 55), "temperature": (18, 28), "humidity": (55, 75), "ph": (5.8, 6.9), "rainfall": (80, 120)},
    "chickpea": {"N": (35, 50), "P": (65, 80), "K": (75, 90), "temperature": (16, 25), "humidity": (60, 75), "ph": (6.5, 7.8), "rainfall": (60, 100)},
    "kidneybeans": {"N": (15, 30), "P": (55, 70), "K": (20, 35), "temperature": (18, 24), "humidity": (60, 75), "ph": (5.9, 6.8), "rainfall": (65, 110)},
    "pigeonpeas": {"N": (15, 30), "P": (55, 70), "K": (20, 38), "temperature": (18, 37), "humidity": (40, 60), "ph": (5.6, 6.8), "rainfall": (90, 200)},
    "mothbeans": {"N": (35, 50), "P": (55, 70), "K": (20, 35), "temperature": (24, 35), "humidity": (40, 65), "ph": (6.2, 7.8), "rainfall": (35, 60)},
    "mungbean": {"N": (15, 30), "P": (35, 50), "K": (20, 35), "temperature": (25, 35), "humidity": (60, 90), "ph": (6.0, 7.5), "rainfall": (90, 130)},
    "blackgram": {"N": (35, 50), "P": (50, 65), "K": (20, 35), "temperature": (24, 32), "humidity": (60, 75), "ph": (6.5, 7.5), "rainfall": (60, 90)},
    "lentil": {"N": (15, 25), "P": (55, 70), "K": (20, 35), "temperature": (18, 28), "humidity": (40, 60), "ph": (5.5, 6.8), "rainfall": (45, 75)},
    "pomegranate": {"N": (15, 25), "P": (65, 80), "K": (40, 55), "temperature": (18, 25), "humidity": (45, 60), "ph": (5.6, 7.5), "rainfall": (100, 150)},
    "banana": {"N": (90, 115), "P": (75, 90), "K": (45, 60), "temperature": (25, 34), "humidity": (75, 90), "ph": (5.9, 6.9), "rainfall": (95, 120)},
    "mango": {"N": (20, 35), "P": (25, 40), "K": (28, 40), "temperature": (28, 35), "humidity": (50, 75), "ph": (5.4, 6.6), "rainfall": (90, 120)},
    "grapes": {"N": (35, 50), "P": (42, 55), "K": (40, 55), "temperature": (10, 30), "humidity": (80, 90), "ph": (6.0, 6.9), "rainfall": (80, 120)},
    "watermelon": {"N": (95, 110), "P": (5, 18), "K": (40, 55), "temperature": (24, 29), "humidity": (80, 95), "ph": (5.8, 6.9), "rainfall": (40, 60)},
    "melon": {"N": (95, 110), "P": (5, 18), "K": (48, 60), "temperature": (25, 32), "humidity": (85, 95), "ph": (6.0, 7.5), "rainfall": (20, 50)},
    "orange": {"N": (35, 50), "P": (30, 45), "K": (28, 40), "temperature": (10, 30), "humidity": (90, 100), "ph": (6.2, 7.0), "rainfall": (100, 120)},
    "papaya": {"N": (85, 100), "P": (45, 60), "K": (40, 52), "temperature": (24, 34), "humidity": (90, 100), "ph": (5.9, 6.9), "rainfall": (140, 200)},
    "cotton": {"N": (110, 125), "P": (35, 45), "K": (38, 50), "temperature": (23, 32), "humidity": (60, 75), "ph": (5.9, 6.8), "rainfall": (60, 110)},
    "jute": {"N": (75, 95), "P": (45, 55), "K": (38, 50), "temperature": (23, 35), "humidity": (70, 90), "ph": (6.0, 7.8), "rainfall": (200, 265)},
    "coffee": {"N": (90, 100), "P": (40, 52), "K": (42, 55), "temperature": (22, 32), "humidity": (50, 70), "ph": (5.9, 6.9), "rainfall": (100, 200)},
}


def ensure_dirs() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    (BASE_DIR / "data").mkdir(parents=True, exist_ok=True)


def build_synthetic_dataset(rows_per_crop: int = 80, seed: int = 42) -> pd.DataFrame:
    """Create a reproducible synthetic dataset when no CSV exists."""
    rng = np.random.default_rng(seed)
    rows: list[dict] = []

    for crop, ranges in CROP_PROFILES.items():
        for _ in range(rows_per_crop):
            row = {"label": crop}
            for feat, (lo, hi) in ranges.items():
                noise = rng.normal(0, (hi - lo) * 0.08)
                val = float(np.clip(rng.uniform(lo, hi) + noise, lo * 0.85, hi * 1.15))
                row[feat] = round(val, 2)
            rows.append(row)

    return pd.DataFrame(rows)


def load_dataset() -> pd.DataFrame:
    if DATA_PATH.exists():
        df = pd.read_csv(DATA_PATH)
        # Normalize column names (handle common CSV variants).
        df.columns = [c.strip().lower() for c in df.columns]
        rename = {"label": "label"}
        expected = {"n": "N", "p": "P", "k": "K", "temperature": "temperature", "humidity": "humidity", "ph": "ph", "rainfall": "rainfall", "label": "label"}
        df = df.rename(columns={k: v for k, v in expected.items() if k in df.columns})

        missing = set(FEATURE_COLUMNS + ["label"]) - set(df.columns)
        if missing:
            raise ValueError(f"CSV missing columns: {missing}")

        return df[FEATURE_COLUMNS + ["label"]].copy()

    print(f"[train_model] No file at {DATA_PATH}; generating synthetic training data.")
    return build_synthetic_dataset()


def train_and_save(verbose: bool = True) -> None:
    ensure_dirs()
    df = load_dataset()

    X = df[FEATURE_COLUMNS]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=4,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)

    print(f"[train_model] Hold-out accuracy: {acc:.4f}")
    if verbose:
        print(classification_report(y_test, preds, zero_division=0))

    payload = {"model": model, "features": FEATURE_COLUMNS}
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(payload, f)

    print(f"[train_model] Saved model bundle to {MODEL_PATH}")


if __name__ == "__main__":
    train_and_save()

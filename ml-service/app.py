"""
Flask inference API for the Crop Recommendation ML service.

Endpoints:
  GET  /health   — readiness check (returns whether model bundle is loaded).
  POST /predict  — expects JSON matching training features; returns predicted crop label + confidence.
"""

from __future__ import annotations

import os
import pickle
from pathlib import Path

import numpy as np
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "crop_model.pkl"

app = Flask(__name__)

_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
_origins = [o.strip() for o in _origins_raw.split(",") if o.strip()]
CORS(app, origins=_origins, supports_credentials=True)

_model_bundle: dict | None = None


def load_model_bundle() -> None:
    """Load pickled RandomForest + feature list."""
    global _model_bundle
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. Run: python train_model.py"
        )
    with open(MODEL_PATH, "rb") as f:
        _model_bundle = pickle.load(f)


@app.route("/health", methods=["GET"])
def health():
    ok = _model_bundle is not None and "model" in _model_bundle
    return jsonify({"status": "ok" if ok else "no_model"}), (200 if ok else 503)


@app.route("/predict", methods=["POST"])
def predict():
    if _model_bundle is None:
        return jsonify({"success": False, "message": "Model not loaded"}), 503

    data = request.get_json(silent=True) or {}
    features = _model_bundle.get("features")
    model = _model_bundle["model"]

    missing = [k for k in features if k not in data]
    if missing:
        return jsonify({"success": False, "message": f"Missing fields: {missing}"}), 400

    try:
        row = np.array([[float(data[k]) for k in features]], dtype=float)
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "All feature values must be numeric"}), 400

    pred = model.predict(row)[0]
    proba = None
    if hasattr(model, "predict_proba"):
        classes = list(model.classes_)
        probs = model.predict_proba(row)[0]
        idx = int(np.argmax(probs))
        proba = {"label": classes[idx], "score": float(probs[idx])}

    return jsonify(
        {
            "success": True,
            "crop": str(pred),
            "confidence": proba["score"] if proba else None,
            "features": {k: float(data[k]) for k in features},
        }
    )


def create_app() -> Flask:
    return app


# Load model during import so Gunicorn/Render serve with a warmed model bundle.
try:
    load_model_bundle()
except FileNotFoundError as exc:
    print(f"[ML service] Startup warning: {exc}")


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_ENV") == "development")

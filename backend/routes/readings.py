from flask import Blueprint, jsonify, request

from extensions import db
from models import Account, BloodPressureRecord
from services.classification import (
    CATEGORY_META,
    RECOMMENDATIONS,
    WARNINGS,
    classify_bp,
    classify_pulse,
    compute_trend,
)
from utils.validators import validate_reading_input

readings_bp = Blueprint("readings", __name__, url_prefix="/api")

DISCLAIMER = (
    "This tool provides general educational information only and is not a substitute for "
    "professional medical advice, diagnosis, or treatment. Always consult a qualified "
    "healthcare provider about your blood pressure and heart health. If you believe you are "
    "having a medical emergency, call your local emergency number immediately."
)


@readings_bp.post("/check")
def check_reading():
    data = request.get_json(silent=True) or {}
    systolic, diastolic, pulse, error = validate_reading_input(data)
    if error:
        return jsonify({"error": "invalid_input", "message": error}), 400

    account = None
    account_id = data.get("account_id")
    if account_id not in (None, "", 0, "0"):
        try:
            account = Account.query.get(int(account_id))
        except (TypeError, ValueError):
            account = None
        if not account:
            return jsonify({"error": "not_found", "message": "Selected account was not found."}), 404

    category = classify_bp(systolic, diastolic)
    age = account.age if account else None
    pulse_status = classify_pulse(pulse, age)

    saved = False
    if account is not None:
        record = BloodPressureRecord(
            account_id=account.id,
            systolic=systolic,
            diastolic=diastolic,
            pulse=pulse,
            category=category,
            pulse_status=pulse_status,
        )
        db.session.add(record)
        db.session.commit()
        saved = True

    meta = CATEGORY_META[category]
    return jsonify({
        "systolic": systolic,
        "diastolic": diastolic,
        "pulse": pulse,
        "category": category,
        "emoji": meta["emoji"],
        "color": meta["color"],
        "pulse_status": pulse_status,
        "age": age,
        "recommendations": RECOMMENDATIONS[category],
        "warnings": WARNINGS[category],
        "disclaimer": DISCLAIMER,
        "saved": saved,
        "account": account.to_dict() if account else None,
    })


@readings_bp.get("/accounts/<int:account_id>/history")
def account_history(account_id):
    account = Account.query.get_or_404(account_id)
    records = list(account.records)  # ascending by created_at via relationship order_by
    trend = compute_trend(records)

    readings = []
    for r in reversed(records):  # newest first for display
        meta = CATEGORY_META[r.category]
        readings.append(r.to_dict(extra={"emoji": meta["emoji"], "color": meta["color"]}))

    return jsonify({
        "account": account.to_dict(),
        "readings": readings,
        "trend": trend,
    })

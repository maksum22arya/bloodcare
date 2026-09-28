"""AHA/ACC blood pressure classification, age-adjusted pulse analysis,
dynamic recommendations/warnings, and trend analysis.

Educational logic only — not medical advice. See DISCLAIMER in routes/readings.py.
"""

# Category metadata: emoji + hex color used to drive the UI badges/status screen.
CATEGORY_META = {
    "normal":   {"emoji": "\U0001F60A", "color": "#22C55E"},  # 😊 green
    "elevated": {"emoji": "\U0001F642", "color": "#EAB308"},  # 🙂 yellow
    "stage1":   {"emoji": "\U0001F61F", "color": "#F97316"},  # 😟 orange
    "stage2":   {"emoji": "\U0001F630", "color": "#EF4444"},  # 😰 red
    "crisis":   {"emoji": "\U0001F6A8", "color": "#B91C1C"},  # 🚨 dark red
}

# Ordered from most to least severe; the first matching rule wins.
RECOMMENDATIONS = {
    "normal": [
        "rec_maintain_diet", "rec_regular_exercise", "rec_routine_checkup",
    ],
    "elevated": [
        "rec_maintain_diet", "rec_regular_exercise", "rec_reduce_salt", "rec_monitor_home",
    ],
    "stage1": [
        "rec_reduce_salt", "rec_regular_exercise", "rec_weight_management",
        "rec_limit_alcohol", "rec_monitor_home",
    ],
    "stage2": [
        "rec_reduce_salt", "rec_dash_diet", "rec_limit_alcohol",
        "rec_reduce_stress", "rec_monitor_home", "rec_consult_doctor_soon",
    ],
    "crisis": [
        "rec_emergency_room", "rec_avoid_exertion", "rec_track_symptoms",
        "rec_medication_adherence", "rec_reduce_stress", "rec_monitor_home",
        "rec_consult_doctor_soon", "rec_limit_caffeine",
    ],
}

WARNINGS = {
    "normal": [],
    "elevated": ["warn_progress_risk"],
    "stage1": ["warn_heart_disease", "warn_stroke"],
    "stage2": ["warn_stroke", "warn_heart_disease", "warn_kidney_disease"],
    "crisis": ["warn_stroke", "warn_heart_disease", "warn_kidney_disease", "warn_emergency"],
}


def classify_bp(systolic: int, diastolic: int) -> str:
    """Modern AHA/ACC classification. Always applies the highest-severity rule."""
    if systolic >= 180 or diastolic >= 120:
        return "crisis"
    if systolic >= 140 or diastolic >= 90:
        return "stage2"
    if 130 <= systolic <= 139 or 80 <= diastolic <= 89:
        return "stage1"
    if 120 <= systolic <= 129 and diastolic < 80:
        return "elevated"
    return "normal"


def get_pulse_range(age):
    """Approximate normal resting-pulse range (bpm), age-adjusted.
    Falls back to the general adult range when age is unknown (no account selected)."""
    if age is None:
        return 60, 100
    if age < 1:
        return 100, 160
    if age < 3:
        return 90, 150
    if age < 6:
        return 80, 140
    if age < 11:
        return 70, 120
    if age < 15:
        return 60, 105
    return 60, 100


def classify_pulse(pulse, age=None):
    if pulse is None:
        return None
    lo, hi = get_pulse_range(age)
    if pulse < lo:
        return "low"
    if pulse > hi:
        return "high"
    return "normal"


def compute_trend(records):
    """records: ascending-by-date list of BloodPressureRecord.
    Compares the latest reading against the average of up to the 3 readings
    before it (combined systolic+diastolic score) to decide direction."""
    if len(records) < 2:
        return {"direction": "stable", "icon": "➡️", "insufficient_data": True}

    latest = records[-1]
    prior = records[-4:-1] if len(records) >= 4 else records[:-1]

    latest_score = latest.systolic + latest.diastolic
    prior_avg = sum(r.systolic + r.diastolic for r in prior) / len(prior)
    diff = latest_score - prior_avg

    if diff <= -5:
        return {"direction": "improving", "icon": "\U0001F4C9", "insufficient_data": False}
    if diff >= 5:
        return {"direction": "worsening", "icon": "\U0001F4C8", "insufficient_data": False}
    return {"direction": "stable", "icon": "➡️", "insufficient_data": False}

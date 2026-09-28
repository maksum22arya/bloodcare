from datetime import date, datetime


def parse_birth_date(value):
    """Parse a 'YYYY-MM-DD' string into a date, or None if invalid."""
    if not value or not isinstance(value, str):
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def validate_account_input(data):
    """Returns (name, birth_date, error_message)."""
    name = (data.get("name") or "").strip()
    birth_date = parse_birth_date(data.get("birth_date"))

    if not name:
        return None, None, "Name is required."
    if len(name) > 120:
        return None, None, "Name is too long."
    if not birth_date:
        return None, None, "A valid birth date (YYYY-MM-DD) is required."
    if birth_date > date.today():
        return None, None, "Birth date cannot be in the future."

    return name, birth_date, None


def validate_reading_input(data):
    """Returns (systolic, diastolic, pulse, error_message)."""
    try:
        systolic = int(data.get("systolic"))
        diastolic = int(data.get("diastolic"))
    except (TypeError, ValueError):
        return None, None, None, "Systolic and diastolic values must be whole numbers."

    pulse_raw = data.get("pulse")
    pulse = None
    if pulse_raw not in (None, ""):
        try:
            pulse = int(pulse_raw)
        except (TypeError, ValueError):
            return None, None, None, "Pulse must be a whole number."

    if not (40 <= systolic <= 300):
        return None, None, None, "Systolic must be between 40 and 300 mmHg."
    if not (20 <= diastolic <= 200):
        return None, None, None, "Diastolic must be between 20 and 200 mmHg."
    if pulse is not None and not (20 <= pulse <= 250):
        return None, None, None, "Pulse must be between 20 and 250 bpm."

    return systolic, diastolic, pulse, None

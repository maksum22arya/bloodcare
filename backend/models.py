from datetime import date, datetime

from extensions import db


class Account(db.Model):
    """A family member profile. No auth, no password — name must be unique."""

    __tablename__ = "accounts"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    records = db.relationship(
        "BloodPressureRecord",
        backref="account",
        cascade="all, delete-orphan",
        order_by="BloodPressureRecord.created_at",
    )

    @property
    def age(self):
        today = date.today()
        b = self.birth_date
        return today.year - b.year - ((today.month, today.day) < (b.month, b.day))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "birth_date": self.birth_date.isoformat(),
            "age": self.age,
        }


class BloodPressureRecord(db.Model):
    """A single saved measurement, only ever created when an account is selected."""

    __tablename__ = "blood_pressure_records"

    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False)
    systolic = db.Column(db.Integer, nullable=False)
    diastolic = db.Column(db.Integer, nullable=False)
    pulse = db.Column(db.Integer, nullable=True)
    category = db.Column(db.String(20), nullable=False)
    pulse_status = db.Column(db.String(10), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self, extra=None):
        data = {
            "id": self.id,
            "account_id": self.account_id,
            "systolic": self.systolic,
            "diastolic": self.diastolic,
            "pulse": self.pulse,
            "category": self.category,
            "pulse_status": self.pulse_status,
            "created_at": self.created_at.isoformat() + "Z",
        }
        if extra:
            data.update(extra)
        return data

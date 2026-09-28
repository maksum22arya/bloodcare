import hmac

from flask import Blueprint, current_app, jsonify, request

from extensions import db
from models import Account
from utils.validators import validate_account_input

accounts_bp = Blueprint("accounts", __name__, url_prefix="/api/accounts")


@accounts_bp.get("")
def list_accounts():
    accounts = Account.query.order_by(Account.name.asc()).all()
    return jsonify([a.to_dict() for a in accounts])


@accounts_bp.post("")
def create_account():
    data = request.get_json(silent=True) or {}
    name, birth_date, error = validate_account_input(data)
    if error:
        return jsonify({"error": "invalid_input", "message": error}), 400

    exists = Account.query.filter(db.func.lower(Account.name) == name.lower()).first()
    if exists:
        return jsonify({"error": "duplicate_name", "message": "An account with this name already exists."}), 409

    account = Account(name=name, birth_date=birth_date)
    db.session.add(account)
    db.session.commit()
    return jsonify(account.to_dict()), 201


@accounts_bp.put("/<int:account_id>")
def update_account(account_id):
    account = Account.query.get_or_404(account_id)
    data = request.get_json(silent=True) or {}
    name, birth_date, error = validate_account_input(data)
    if error:
        return jsonify({"error": "invalid_input", "message": error}), 400

    exists = Account.query.filter(
        db.func.lower(Account.name) == name.lower(), Account.id != account_id
    ).first()
    if exists:
        return jsonify({"error": "duplicate_name", "message": "An account with this name already exists."}), 409

    account.name = name
    account.birth_date = birth_date
    db.session.commit()
    return jsonify(account.to_dict())


@accounts_bp.delete("/<int:account_id>")
def delete_account(account_id):
    data = request.get_json(silent=True) or {}
    submitted_password = data.get("password", "")
    configured_password = current_app.config["DELETE_PASSWORD"]
    if (
        not configured_password
        or not isinstance(submitted_password, str)
        or not hmac.compare_digest(submitted_password, configured_password)
    ):
        return jsonify({
            "error": "invalid_delete_password",
            "message": "Invalid delete password",
        }), 403

    account = Account.query.get_or_404(account_id)
    db.session.delete(account)
    db.session.commit()
    return jsonify({"success": True})

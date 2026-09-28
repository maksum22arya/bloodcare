from flask import Flask, jsonify

from config import Config
from extensions import db
from routes.accounts import accounts_bp
from routes.readings import readings_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    app.register_blueprint(accounts_bp)
    app.register_blueprint(readings_bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({"error": "not_found", "message": "Resource not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(_e):
        return jsonify({"error": "method_not_allowed", "message": "Method not allowed."}), 405

    @app.errorhandler(500)
    def server_error(_e):
        return jsonify({"error": "server_error", "message": "Something went wrong."}), 500

    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=3000, debug=False)

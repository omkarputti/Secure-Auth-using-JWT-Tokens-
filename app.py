# app.py
import os
from datetime import timedelta, datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# ---- Config ----
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-change-me")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=6)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///notes.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Allow local frontends (adjust origins as needed)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000",
                                             "http://localhost:5173",
                                             "http://127.0.0.1:3000",
                                             "http://127.0.0.1:5173",
                                             "*"]}})

db = SQLAlchemy(app)
jwt = JWTManager(app)

# ---- Models ----
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

# Create tables on first run
with app.app_context():
    db.create_all()

# ---- Helpers ----
def user_to_dict(u: User):
    return {"id": u.id, "email": u.email}

def note_to_dict(n: Note):
    return {
        "id": n.id,
        "text": n.text,
        "created_at": n.created_at.isoformat() + "Z"
    }

# ---- Routes ----
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

# --- Auth ---
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(force=True)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already registered"}), 409

    pw_hash = generate_password_hash(password, method="pbkdf2:sha256", salt_length=16)
    user = User(email=email, password_hash=pw_hash)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "registered", "user": user_to_dict(user)}), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "invalid credentials"}), 401

    
    access_token = create_access_token(identity=str(user.id))

    return jsonify({"access_token": access_token, "user": user_to_dict(user)})

# --- Notes (protected by JWT) ---
@app.route("/api/notes", methods=["GET"])
@jwt_required()
def list_notes():
    user_id = get_jwt_identity()
    notes = Note.query.filter_by(user_id=user_id).order_by(Note.created_at.desc()).all()
    return jsonify([note_to_dict(n) for n in notes])

@app.route("/api/notes", methods=["POST"])
@jwt_required()
def create_note():
    user_id = get_jwt_identity()
    data = request.get_json(force=True)
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    note = Note(user_id=user_id, text=text)
    db.session.add(note)
    db.session.commit()
    return jsonify(note_to_dict(note)), 201

@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
@jwt_required()
def delete_note(note_id):
    user_id = get_jwt_identity()
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({"error": "note not found"}), 404
    db.session.delete(note)
    db.session.commit()
    return jsonify({"message": "deleted", "id": note_id})

if __name__ == "__main__":
    # Dev server
    app.run(host="0.0.0.0", port=5000, debug=True)

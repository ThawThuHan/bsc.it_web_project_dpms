from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['JWT_SECRET_KEY'] = 'JWT_SECRET_KEY'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
login_manager = LoginManager(app)
CORS(app, resources={r"/*": {"origins": "*"}})

# Database Models
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    dob = db.Column(db.String(10), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(10), nullable=False)

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    speciality = db.Column(db.String(100), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def create_admin():
    if not User.query.filter_by(username='admin').first():
        hashed_password = bcrypt.generate_password_hash('admin_password').decode('utf-8')
        admin = User(username='admin', email='admin@example.com', password=hashed_password, 
                     full_name='Admin User', phone='1234567890', dob='1990-01-01', role='admin', address='a')
        db.session.add(admin)
        db.session.commit()

@app.before_request
def initialization_db():
    app.before_request_funcs[None].remove(initialization_db)
    with app.app_context():
        db.create_all()
        create_admin()
        print('Database Initilized!')

@app.route("/api/welcome", methods=['GET'])
def welcome():
    return jsonify({"message": "welcome"}), 200

@app.route("/api/register", methods=['POST'])
def register():
    data = request.get_json()
    role = data['role']
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], email=data['email'], password=hashed_password, 
                full_name=data['full_name'], phone=data['phone'], dob=data['dob'], role=role, address=data['address'])
    db.session.add(user)
    db.session.commit()

    if role == 'doctor':
        doctor = Doctor(user_id=user.id, speciality=data['speciality'])
        db.session.add(doctor)
        db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route("/api/login", methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        login_user(user)
        access_token = create_access_token(identity=user.id)
        print(access_token)
        return jsonify({"message": "Logged in successfully", "user_id": user.id, "role": user.role, "token": access_token}), 200
    else:
        return jsonify({"message": "Login failed"}), 401

@app.route("/api/profile/<int:user_id>", methods=['GET', 'PUT'])
@jwt_required()
def profile(user_id):
    # current_user_id = get_jwt_identity()
    # user = User.query.get_or_404(current_user_id)
    user = User.query.get_or_404(user_id)
    if request.method == 'GET':
        profile_data = {
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "dob": user.dob,
            "role": user.role,
            "address": user.address
        }
        if user.role == 'doctor':
            doctor = Doctor.query.filter_by(user_id=user.id).first()
            profile_data["speciality"] = doctor.speciality
        return jsonify(profile_data), 200

    elif request.method == 'PUT':
        data = request.get_json()
        user.username = data['username']
        user.email = data['email']
        user.full_name = data['full_name']
        user.phone = data['phone']
        user.dob = data['dob']
        user.address = data['address']
        if user.role == 'doctor':
            doctor = Doctor.query.filter_by(user_id=user.id).first()
            doctor.speciality = data['speciality']
        db.session.commit()
        return jsonify({"message": "Profile updated successfully"}), 200

@app.route("/api/logout", methods=['POST'])
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route("/api/users", methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    if user.role != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
    users = User.query.all()
    user_data = []
    for user in users:
        user_data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "dob": user.dob,
            "role": user.role,
            "address": user.address
        })
    return jsonify(user_data), 200

@app.route("/api/user/<int:user_id>", methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def manage_user(user_id):
    current_user = User.query.get_or_404(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
    user = User.query.get_or_404(user_id)
    if request.method == 'GET':
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "dob": user.dob,
            "address": user.address,
            "role": user.role
        }
        if user.role == 'doctor':
            doctor = Doctor.query.filter_by(user_id=user.id).first()
            user_data["speciality"] = doctor.speciality
        return jsonify(user_data), 200

    elif request.method == 'PUT':
        data = request.get_json()
        user.username = data['username']
        user.email = data['email']
        user.full_name = data['full_name']
        user.phone = data['phone']
        user.dob = data['dob']
        user.address = data['address']
        if user.role == 'doctor':
            doctor = Doctor.query.filter_by(user_id=user.id).first()
            doctor.speciality = data['speciality']
        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200

    elif request.method == 'DELETE':
        print('hit')
        if user.role == 'doctor':
            Doctor.query.filter_by(user_id=user.id).delete()
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200


if __name__ == '__main__':
    app.run(debug=True)

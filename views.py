from flask import render_template, request, jsonify
from flask_login import login_user
from flask_security import auth_required, current_user, roles_accepted
from models import *

def create_view(app):

    @app.route('/')
    def home():
        return render_template('index.html')
    

    # @app.post("/user-login")
    # def user_login():
        
    #     data = request.get_json()

    #     try:
    #         if not data or 'username' not in data or 'password' not in data:
    #             raise ValueError('Invalid request data')

    #         username = data.get('username')
    #         password = data.get('password')

    #         user = User.query.filter_by(username=username, password=password).first()

    #         if user and user.role == "user":
    #             login_user(user)
    #             return jsonify(message='Login successful', user_id=user.id), 200
    #         else:
    #             return jsonify(message='Invalid username or password'), 401
    #     except Exception as e:
    #         print('Error during login:', e)
    #         return jsonify(message='An error occurred during login'), 500
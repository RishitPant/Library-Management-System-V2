from flask import render_template, request, jsonify
from flask_login import login_user
from flask_security import auth_required, current_user, roles_accepted, SQLAlchemyUserDatastore
from models import *
from flask_security.utils import hash_password
from extensions import db

def create_view(app, user_datastore : SQLAlchemyUserDatastore):

    @app.route('/')
    def home():
        return render_template('index.html')
    

    # @app.route('/register', methods=["GET","POST"])
    # def register():
        # print("called")
        # data = request.get_json()
        # email =  data.get('email')
        # password = data.get('password')
        # role = data.get('role')

        # if not email or not password:
        #     return jsonify({"message": "Invalid Input"})

        # if user_datastore.find_user(email=email):
        #     return jsonify({"message": "User already exists."})
        
        # if role == 'user':
        #     active = True
        
        # try:
        #     user_datastore.create_user(email=email, password=hash_password(password), role=[role], active=active)
        #     db.session.commit()
        #     print("commited")
        # except:
        #     print('Error while creating')
        #     db.session.rollback()
        #     return jsonify({'Message': "Error while creating user"}), 408
        # return jsonify({"message" : "User created"}), 200

    @app.route('/register', methods=["POST"])
    def register():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'user')

        if not email or not password:
            app.logger.error('Invalid input: Email or password missing')
            return jsonify({"message": "Invalid Input"}), 400

        if user_datastore.find_user(email=email):
            app.logger.error('User already exists: %s', email)
            return jsonify({"message": "User already exists."}), 400

        active = True if role == 'user' else False

        try:
            app.logger.info('Creating user: %s', email)
            user_datastore.create_user(email=email, password=hash_password(password), roles=[role], active=active)
            db.session.commit()
            app.logger.info('User created successfully: %s', email)
            return jsonify({"message": "User created"}), 200
        except Exception as e:
            app.logger.error('Error while creating user: %s', e)
            db.session.rollback()
            return jsonify({"message": "Error while creating user"}), 500


    # @app.post("/login")
    # def login():
        
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


    app.route('/logout')
    def logout():
        pass
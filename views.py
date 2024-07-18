from flask import render_template, request, jsonify, url_for, redirect
from flask_login import login_user
from flask_security import auth_required, current_user, roles_accepted, SQLAlchemyUserDatastore
from models import *
from flask_security.utils import hash_password, verify_password
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
            return jsonify({"message": "Invalid Input"}), 400

        if user_datastore.find_user(email=email):
            return jsonify({"message": "User already exists."}), 400

        active = True if role == 'user' else False

        try:
            user_datastore.create_user(email=email, password=hash_password(password), roles=[role], active=active)
            db.session.commit()
            return jsonify({"message": "User created"}), 200
        except:
            db.session.rollback()
            return jsonify({"message": "Error while creating user"}), 500


    @app.route("/user-login", methods=["POST"])
    def user_login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message' : 'Invalid Email or Password'}), 404
        
        user = user_datastore.find_user(email=email)

        if not user:
            return jsonify({'message': 'User does not exist'}), 404
        
        if verify_password(password, user.password):
            login_user(user)
            return jsonify({'token': user.get_auth_token(), 'role': user.roles[0].name, 'id': user.id, 'email': user.email}), 200


    @app.route("/my_books/<int:userid>", methods=["GET", "POST"])
    def my_books(userid):
        try:
            # if not current_user.is_authenticated:
            #     return jsonify(message='Unauthorized access'), 401

            user = User.query.get(userid)
            if not user:
                return jsonify(message='User not found'), 404

            if request.method == "POST":
                action = request.json.get('action')
                book_id = request.json.get('book_id')
                if not action or not book_id:
                    return jsonify(message='Invalid request'), 400

                book_id = int(book_id)
                book = Book.query.get(book_id)

                if not book:
                    return jsonify(message='Book not found'), 404

                if action == 'return':
                    book.is_available = True
                    current_user.books_taken.remove(book)
                    db.session.commit()
                    return jsonify(message=f'Book "{book.name}" returned successfully!', success=True)

                elif action == 'mark_as_completed':
                    complete_book_check = UserBookConnection.query.filter_by(user_id=current_user.id, book_id=book_id).first()
                    if complete_book_check:
                        complete_book_check.is_completed = True
                        db.session.commit()
                        return jsonify(message=f'"{book.name}" is marked as completed!', success=True)
                    else:
                        return jsonify(message='Book connection not found'), 404

                elif action == 'view':
                    return jsonify(redirect_url=url_for('view', bookid=book_id))

            # Handling GET request
            connection = UserBookConnection.query.filter_by(user_id=userid).all()

            user_books = Book.query.join(UserBookConnection).filter(
                UserBookConnection.user_id == current_user.id,
                UserBookConnection.is_completed == False
            ).all()

            all_completed_books = UserBookConnection.query.filter_by(user_id=current_user.id, is_completed=True).all()
            completed_books = [Book.query.get(book.book_id) for book in all_completed_books]

            user_feedbacks = Feedback.query.all()
            book_rating_dict = {}
            for feedback in user_feedbacks:
                reviews = Feedback.query.filter_by(books_id=feedback.books_id).all()
                if reviews:
                    avg_rating = sum(review.rating for review in reviews) / len(reviews)
                else:
                    avg_rating = 0
                book_rating_dict[feedback.books_id] = avg_rating

            response = {
                'user_books': [book.to_dict() for book in user_books],
                'completed_books': [book.to_dict() for book in completed_books],
                'book_rating_dict': book_rating_dict,
                'currentuser': current_user.email
            }

            return jsonify(response)
        except Exception as e:
            app.logger.error(f"Error in my_books route: {e}")
            return jsonify(message='Internal server error'), 500


    @app.route('/<int:bookid>/ratings', methods=["GET", "POST"])
    def book_ratings(bookid):
        if not current_user.is_authenticated:
            return jsonify({'message': 'Unauthorized access'}), 401

        if request.method == 'POST':
            existing_rating = Feedback.query.filter_by(user_id = current_user.id, books_id=bookid).all()

            if existing_rating:
                return jsonify({"message": "Rating already exists"}), 400
            
            rating = request.json.get('rating')

            if not rating:
                return jsonify({"message": 'Rating is required'}), 400

            add_rating = Feedback(user_id=current_user.id, books_id=bookid, rating=rating)
            db.session.add(add_rating)
            db.session.commit()

            return jsonify({"message": 'Rating added successfully'}), 201

        feedbacks = Feedback.query.filter_by(books_id=bookid).all()

        users = []
        for feedback in feedbacks:
            user = User.query.get(feedback.user_id)
            users.append(user.email)
        
        if feedbacks:
            avg_rating = sum(feedback.rating for feedback in feedbacks if feedback.rating is not None) / len(feedbacks) if feedbacks else 0

        feedback_list = [
            {'user': users[i], 'rating': feedbacks[i].rating} for i in range(len(feedbacks))
        ]

        return jsonify({"feedbacks": feedback_list, 'avg_rating': avg_rating, 'bookid': bookid})

    app.route('/logout')
    def logout():
        pass
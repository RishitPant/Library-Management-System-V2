from flask import render_template, request, jsonify, url_for, redirect
from flask_login import login_user
from flask_security import auth_required, current_user, roles_accepted, SQLAlchemyUserDatastore
from models import *
from flask_security.utils import hash_password, verify_password
from extensions import db
import os

current_dir = os.path.abspath(os.path.dirname(__file__))

IMG_UPLOAD_FOLDER = os.path.join(current_dir, 'static', 'images')
PDF_UPLOAD_FOLDER = os.path.join(current_dir, 'static', 'pdf')


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
                    connection = UserBookConnection.query.filter_by(user_id=userid, book_id=book_id).first()
                    if connection:
                        book.is_available = True
                        db.session.delete(connection)
                        db.session.commit()
                        return jsonify(message=f'Book "{book.name}" returned successfully!', success=True)
                    else:
                        return jsonify(message="Book connection not found"), 404

                elif action == 'mark_as_completed':
                    complete_book_check = UserBookConnection.query.filter_by(user_id=current_user.id, book_id=book_id).first()
                    if complete_book_check:
                        complete_book_check.is_completed = True
                        db.session.commit()
                        return jsonify(message=f'"{book.name}" is marked as completed!', success=True)
                    else:
                        return jsonify(message='Book connection not found'), 404

                elif action == 'view':
                    # return jsonify(redirect_url=url_for('view', bookid=book_id))
                    return jsonify({"bookid": book_id}), 200

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
    

    @app.route('/view/<int:bookid>', methods=["GET"])
    def view(bookid):
        if not current_user.is_authenticated:
            return jsonify({"message": "Unauthorised access"}), 401

        book = Book.query.get(bookid)
        if not book:
            return jsonify({"message": "Book not found"}), 404
        
        response = {
            "id": book.id,
            "name": book.name,
            "content": book.content
        }

        return jsonify(response)
    

    @app.route('/buy-book/<int:bookid>', methods=["GET", "POST"])
    def buy_book(bookid):
        # if not current_user.is_authenticated:
        #     pass
        book = Book.query.get(bookid)

        if request.method == "POST":
            if book:
                check_user_bought = UserBookBuy.query.filter_by(userid=current_user.id, bookid=bookid).first()
                if check_user_bought:
                    return jsonify({"message": "Book already bought!"}), 400
                else:
                    user_book_bought = UserBookBuy(userid=current_user.id, bookid=bookid, bought=True)
                    db.session.add(user_book_bought)
                    db.session.commit()
                    return jsonify({"message": "Book bought!"}), 200
            else:
                return jsonify({"message": "Book not found!"}), 400
            
        
        response = {
            "book": {
                "id": book.id,
                "name": book.name
            },
            "userid": current_user.id
        }

        return jsonify(response), 200


    @app.route('/books', methods=["GET", "POST"])
    def books():
        # if not current_user.is_authenticated:
        #     flash('Please log in to access this page.', 'error')
        #     return jsonify(message='Unauthorized access'), 401
        
        count_connection = UserBookConnection.query.filter_by(user_id=current_user.id, is_completed=False).count()

        recommended = Book.query.all()
        sections = Section.query.all()

        user_feedbacks = Feedback.query.all()

        book_rating_dict = {}
        for book in user_feedbacks:
            reviews = Feedback.query.filter_by(books_id=book.books_id).all()
            if len(reviews) > 0:
                avg_rating = sum(review.rating for review in reviews) / len(reviews)
            else:
                avg_rating = 0
            book_rating_dict[book.books_id] = avg_rating

        recommended_books = [book.to_dict() for book in recommended]
        section_list = [section.to_dict() for section in sections]
        user_feedback_list = [feedback.to_dict() for feedback in user_feedbacks]

        # Return the data as a JSON response
        return jsonify(
            user_feedbacks=user_feedback_list,
            recommended=recommended_books,
            sections=section_list,
            book_rating_dict=book_rating_dict,
            count_connection=count_connection
        ), 200
    

    @app.route('/admin_dashboard', methods=["GET", "POST"])
    def admin_dashboard():
        # if not current_user.is_authenticated or current_user.role != 'admin':
        #     flash('Please log in to access this page.', 'error')
        #     return redirect(url_for('home'))

        sections = Section.query.all()
        books = Book.query.all()

        sections_data = [section.to_dict() for section in sections]
        books_data = [book.to_dict() for book in books]

        return jsonify({
            "sections": sections_data,
            "books": books_data,
            "current_user": current_user.email
        }), 200


    @app.route('/add_book', methods=["GET", "POST"])
    def add_book():
        # if not current_user.is_authenticated or current_user.role != 'admin':
        #     flash('Please log in to access this page.', 'error')
        #     return redirect(url_for('home'))

        if request.method == "GET":
            sections = Section.query.all()
            resp = [section.to_dict() for section in sections]
            return jsonify({"sections": resp})

        if request.method == "POST":
            data = request.form
            name = data.get("name")
            authors = data.get("authors")
            num_of_pages = data.get("num_of_pages")
            section_id = int(data.get("section_id"))
            
            if 'content' not in request.files or 'book_img' not in request.files:
                return jsonify({"error": "Content and Book Image files are required"}), 400

            content = request.files['content']
            book_img = request.files['book_img']

            if content.filename == '' or book_img.filename == '':
                return jsonify({"error": "Files must have filenames"}), 400

            # Save files to the respective directories
            book_img_filename = book_img.filename
            content_filename = content.filename
            book_img.save(os.path.join(IMG_UPLOAD_FOLDER, book_img_filename))
            content.save(os.path.join(PDF_UPLOAD_FOLDER, content_filename))

            # Check if book already exists
            existing_book = Book.query.filter_by(name=name).first()
            if existing_book:
                return jsonify({"error": "Book already exists"}), 400

            # Add book to the database
            book = Book(
                name=name,
                authors=authors,
                content=content_filename,
                num_of_pages=num_of_pages,
                section_id=section_id,
                book_img=book_img_filename
            )
            db.session.add(book)
            db.session.commit()
            return jsonify({"message": "Book added successfully"}), 201


    @app.route('/edit-book/<int:id>', methods=["GET", "PUT"])
    def edit_book(id):
        # if not current_user.is_authenticated or current_user.role != 'admin':
        #     flash('Please log in to access this page.', 'error')
        #     return redirect(url_for('home'))

        book = Book.query.get(id)
        if not book:
            return jsonify({"error": "Book not found"}), 404

        if request.method == 'GET':
            sections = Section.query.all()
            return jsonify({
                "book": book.to_dict(),
                "sections": [section.to_dict() for section in sections]
            }), 200

        if request.method == 'PUT':
            data = request.form
            name = data.get("name")
            authors = data.get("authors")
            num_of_pages = data.get("num_of_pages")
            section_id = data.get("section_id")

            check_existing = Book.query.filter(Book.name == name, Book.id != book.id).first()
            if check_existing:
                return jsonify({"error": "Book with same name exists"}), 400

            book.name = name
            book.authors = authors
            book.num_of_pages = num_of_pages
            book.section_id = section_id

            if 'content' in request.files:
                content_file = request.files['content']
                if content_file and hasattr(content_file, 'filename'):
                    content_filename = content_file.filename
                    content_file.save(os.path.join(PDF_UPLOAD_FOLDER, content_filename))
                    book.content = content_filename

            if 'book_img' in request.files:
                book_img_file = request.files['book_img']
                if book_img_file and hasattr(book_img_file, 'filename'):
                    book_img_filename = book_img_file.filename
                    book_img_file.save(os.path.join(IMG_UPLOAD_FOLDER, book_img_filename))
                    book.book_img = book_img_filename

            db.session.commit()

            return jsonify({"message": "Book updated successfully"}), 200



    app.route('/logout')
    def logout():
        pass
from flask import render_template, request, jsonify, send_file, session, redirect, url_for
from flask_login import login_user, login_required
from flask_security import auth_required, current_user, SQLAlchemyUserDatastore, roles_required, roles_accepted
from models import *
from flask_security.utils import hash_password, verify_password
from extensions import db
import datetime
import os
from tasks import create_csv
from celery.result import AsyncResult

current_dir = os.path.abspath(os.path.dirname(__file__))

IMG_UPLOAD_FOLDER = os.path.join(current_dir, 'static', 'images')
PDF_UPLOAD_FOLDER = os.path.join(current_dir, 'static', 'pdf')


def create_view(app, user_datastore : SQLAlchemyUserDatastore, cache):

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"message": "You cannot see this page"}), 403
    
    @app.before_request
    def last_visit():
        if request.endpoint not in ['login', 'static']:
            if current_user.is_authenticated:
                user = User.query.get(current_user.id)
                if user:
                    user.last_visit = datetime.datetime.utcnow()
                    db.session.commit()

    
    @app.route('/start-export')
    def start_export():
        task = create_csv.delay()
        return jsonify({"task_id": task.id})


    @app.route('/get-csv/<task_id>')
    def get_csv(task_id):
        result = AsyncResult(task_id)

        if result.ready():
            return send_file('./user-downloads/file.csv')
        else:
            return "task not ready", 405


    @app.route('/')
    @cache.cached(timeout=3600)
    def home():
        return render_template('index.html')
    

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
            #login_user(user)
            return jsonify({'token': user.get_auth_token(), 'role': user.roles[0].name, 'id': user.id, 'email': user.email}), 200
        else:
            return jsonify({"message": "Wrong password"})


    @app.route("/my_books/<int:userid>", methods=["GET", "POST"])
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def my_books(userid):
        try:
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
                    return jsonify({"bookid": book_id}), 200

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

            print("Book Rating Dict:", book_rating_dict)


            response = {
                'user_books': [book.to_dict() for book in user_books],
                'completed_books': [book.to_dict() for book in completed_books],
                'book_rating_dict': book_rating_dict,
                'currentuser': current_user.email,
                'userid': userid
            }

            return jsonify(response)
        except Exception as e:
            app.logger.error(f"Error in my_books route: {e}")
            return jsonify(message='Internal server error'), 500


    @app.route('/<int:bookid>/ratings', methods=["GET", "POST"])
    @auth_required('token')
    def book_ratings(bookid):
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

        avg_rating = 0
        
        if feedbacks:
            avg_rating = sum(feedback.rating for feedback in feedbacks if feedback.rating is not None) / len(feedbacks) if feedbacks else 0

        feedback_list = [
            {'user': users[i], 'rating': feedbacks[i].rating} for i in range(len(feedbacks))
        ]

        return jsonify({"feedbacks": feedback_list, 'avg_rating': avg_rating, 'bookid': bookid})
    



    @app.route('/view/<int:bookid>', methods=["GET"])
    @auth_required('token')
    @cache.cached(timeout=3600)
    def view(bookid):
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
    @auth_required('token')
    def buy_book(bookid):
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
            else:
                return jsonify({"message": "Book not found!"}), 400

        return jsonify({
                        "message": "Book bought!",
                        "book": {
                            "id": book.id,
                            "name": book.name,
                            "content": book.content
                        },
                        "userid": current_user.id
                    }), 200 


    @app.route('/download/<int:bookid>', methods=["GET"])
    def download_book(bookid):
        book = Book.query.get(bookid)
        if book:
            file_path = os.path.join(current_dir, 'static', 'pdf', book.content)

            return send_file(file_path, as_attachment=True, download_name=book.content)
        else:
            return jsonify({"message": "Book not found!"}), 404


    @app.route('/books', methods=["GET", "POST"])
    @auth_required('token')
    @cache.cached(timeout=3600)
    def books():
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

        return jsonify({
            "user_feedbacks":user_feedback_list,
            "recommended":recommended_books,
            "sections":section_list,
            "book_rating_dict":book_rating_dict,
            "count_connection": count_connection
        }), 200
    

    @app.route('/admin_dashboard', methods=["GET"])
    @auth_required('token')
    @roles_required('admin')
    def admin_dashboard():
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
    @auth_required('token')
    @roles_required('admin')
    def add_book():
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

            book_img_filename = book_img.filename
            content_filename = content.filename
            book_img.save(os.path.join(IMG_UPLOAD_FOLDER, book_img_filename))
            content.save(os.path.join(PDF_UPLOAD_FOLDER, content_filename))

            existing_book = Book.query.filter_by(name=name).first()
            if existing_book:
                return jsonify({"error": "Book already exists"}), 400

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
    @auth_required('token')
    @roles_required('admin')
    def edit_book(id):
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


    @app.route('/edit-section/<int:id>', methods=['GET', 'POST'])
    @auth_required('token')
    @roles_required('admin')
    def edit_section(id):
        section = Section.query.get(id)

        if not section:
            return jsonify({"error": "Book not found"}), 404

        if request.method == "GET":
            return jsonify({"section": section.to_dict()}), 200


        if request.method == "POST":
            data = request.get_json()
            section_name = data.get("section_name")

            check_existing = Section.query.filter(Section.section_name==section_name, Section.id != section.id).first()

            if check_existing:
                return jsonify({"message": "Section already exists"})

            if not check_existing:
                section.section_name = section_name
                db.session.commit()

        return jsonify({"message": "Section edited successfully"}, 200)


    @app.route('/add-section', methods=["GET", "POST"])
    @auth_required('token')
    @roles_required('admin')
    def add_section():
        if request.method == "GET":
            sections = Section.query.all()
            resp = [section.to_dict() for section in sections]
            return jsonify({"sections": resp}), 200

        if request.method == "POST":
            data = request.get_json()
            section_name = data.get("section_name")
            description = data.get("description")

            existing_section = Section.query.filter_by(section_name=section_name).first()

            if existing_section:
                return jsonify({"message": "Section already exists"}), 409
            
            section = Section(section_name=section_name, description=description)
            db.session.add(section)
            db.session.commit()

            return jsonify({"message": "Section added successfully"}), 201

        return jsonify({"message": "Invalid request method"}), 405


    @app.route('/delete-section/<int:id>', methods=["GET", "POST"])
    @auth_required('token')
    @roles_required('admin')
    def delete_section(id):
        section = Section.query.get(id)

        if request.method == "GET":
            return jsonify({"section": section.to_dict()}), 200
        
        if request.method == "POST":
            books = Book.query.filter_by(section_id=section.id).all()
            for book in books:
                db.session.delete(book)

            db.session.delete(section)
            db.session.commit()

        return jsonify({"message": "Section deleted successfully"}), 200
    

    @app.route('/delete-book/<int:id>', methods=["GET", "POST"])
    @auth_required('token')
    @roles_required('admin')
    def delete_book(id):
        book = Book.query.get(id)

        if request.method == "GET":
            return jsonify({"book": book.to_dict()}), 200

        if request.method == "POST":
            UserBookConnection.query.filter_by(book_id=id).delete()
            db.session.commit()
            db.session.delete(book)
            db.session.commit()

        return jsonify({"message": "Book deleted successfully"}), 200


    @app.route('/request_book/<int:book_id>', methods=["GET", "POST"])
    @auth_required('token')
    def request_book(book_id):
        if request.method == "POST":
            action = request.json.get('action')

            if action == "request":
                check_req_count = UserBookRequest.query.all()
                if len(check_req_count) >= 5:
                    return jsonify({"message": "You already have 5 books"}), 200

                requests = UserBookRequest(user_id=current_user.id, book_id=book_id)
                db.session.add(requests)
                db.session.commit()

            return jsonify({"message": "Request added successfully"}), 200


    @app.route('/book_requests', methods=["GET", "POST"])
    @auth_required('token')
    @roles_required('admin')
    def book_requests():
        reqs = UserBookRequest().query.all()

        return jsonify({"requests": [ req.to_dict() for req in reqs ]}), 200
    

    @app.route('/approve_request/<int:request_id>', methods=["GET", "POST"])
    @auth_required('token')
    @roles_required('admin')
    def approve_request(request_id):
        if request.method == "POST":
            user_req = UserBookRequest.query.get(request_id)

            if user_req:
                count_connections = UserBookConnection.query.filter_by(user_id=current_user.id, is_completed=False).count()

                if count_connections < 5:
                    connection = UserBookConnection(user_id=user_req.user_id, book_id=user_req.book_id)
                    db.session.add(connection)
                    user_req.status = 'approved'
                    db.session.delete(user_req)
                    db.session.commit()
                    return jsonify({"message": "Request has been approved"}), 200
                else:
                    db.session.delete(user_req)
                    db.session.commit()
                    return jsonify({"message": "Book borrowing limit reached"}), 400

        return jsonify({"message": "No pending requests"}), 200


    @app.route('/reject_request/<int:request_id>', methods=["GET", "POST"])
    @auth_required('token')
    @roles_required('admin')
    def reject_request(request_id):
        if request.method == "POST":
            user_req = UserBookRequest.query.get(request_id)
            if user_req:
                db.session.delete(user_req)
                db.session.commit()

        return jsonify({"message": "Request rejected"}), 200
    

    @app.route('/search')
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def search():
        query = "%" + request.args.get('query', '').strip().lower() + "%"
        
        book_search = Book.query.filter(Book.name.ilike(query)).all()
        
        section_search = Section.query.filter(Section.section_name.ilike(query)).all()
        section_books_result = []
        for section in section_search:
            search_section_books = Book.query.filter_by(section_id=section.id).all()
            section_books_result.extend(search_section_books)
        
        user_feedbacks = Feedback.query.all()
        book_rating_dict = {}
        for feedback in user_feedbacks:
            book_id = feedback.books_id
            if book_id not in book_rating_dict:
                reviews = Feedback.query.filter_by(books_id=book_id).all()
                if reviews:
                    avg_rating = sum(review.rating for review in reviews) / len(reviews)
                else:
                    avg_rating = 0
                book_rating_dict[book_id] = avg_rating

        return jsonify({
            "book_search": [book.to_dict() for book in book_search],
            "section_books_result": [book.to_dict() for book in section_books_result],
            "book_rating_dict": book_rating_dict
        }), 200


    @app.route('/section/<int:section_id>/', methods=["GET", "POST"])
    @auth_required('token')
    @roles_required('admin')
    def section_books(section_id):
        section = Section.query.get(section_id)
        books = Book.query.filter_by(section_id=section_id).all()

        response = {
            'section':  section.section_name,
            'books': [ book.to_dict() for book in books ]
        }

        return jsonify(response), 200
    

    @app.route('/stats', methods=["GET", "POST"])
    @auth_required('token')
    @roles_required('admin')
    def stats():
        total_books = len(Book.query.all())
        total_sections = len(Section.query.all())
        total_users = len(User.query.all())

        sections = Section.query.all()
        section_names = []
        for section in sections:
            section_names.append(section.section_name)
        books = []
        for section in sections:
            books.append(len(section.books))

        response = {
            'total_books': total_books,
            'total_sections': total_sections,
            'total_users': total_users,
            'section_names': section_names,
            'books': books,
            'section_books': list(zip(section_names, books))
        }

        return jsonify(response), 200


    app.route('/logout')
    def logout():
        session.clear()
        return jsonify({"message": "Logged out successfully!"}), 200
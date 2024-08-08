from extensions import db, security
from flask_security import UserMixin, RoleMixin
from flask_security.models import fsqla_v3 as fsq
from datetime import datetime

fsq.FsModels.set_db_info(db)

class UserBookConnection(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id', ondelete='CASCADE'), primary_key=True)
    is_completed = db.Column(db.Boolean, default=False)
    date_accessed = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='user_books')
    book = db.relationship('Book', back_populates='book_users')


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean)
    fs_uniquifier = db.Column(db.String(), nullable = False)

    user_books = db.relationship('UserBookConnection', back_populates='user')

    # books_taken = db.relationship('Book', secondary='user_book_connection', backref='users_taken', overlaps="books_taken, users_taken")
    feedbacks = db.relationship('Feedback', backref='user')
    book_req_user = db.relationship('UserBookRequest', backref='user')
    books_bought = db.relationship('UserBookBuy', backref='user')
    roles = db.relationship('Role', secondary='user_roles')


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String)


class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))


class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    content = db.Column(db.String(255), nullable=False)
    authors = db.Column(db.String(255), nullable=False)
    date_issued = db.Column(db.DateTime, default=datetime.utcnow)
    is_available = db.Column(db.Boolean, server_default='1')
    num_of_pages = db.Column(db.Integer, nullable=False)
    book_img = db.Column(db.String(255))

    book_users = db.relationship('UserBookConnection', back_populates='book')
    # users = db.relationship('User', secondary='user_book_connection', backref='user_books', overlaps="books_taken, users_taken")
    section_id = db.Column(db.Integer, db.ForeignKey('section.id', ondelete='CASCADE'), nullable=False)
    book_req_book = db.relationship('UserBookRequest', backref='book')
    feedback = db.relationship('Feedback', backref='book')
    users_bought = db.relationship('UserBookBuy', backref='book')
    
    def return_book(self):
        self.return_date = datetime.utcnow()
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'authors': self.authors,
            'book_img': self.book_img,
            'section': self.section.section_name if self.section else None,
            'is_available': self.is_available,
            'section_id': self.section_id
        }

class Section(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    section_name = db.Column(db.String(50), unique=True, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.Text)

    books = db.relationship('Book', backref='section')

    def to_dict(self):
        return {
            'id': self.id,
            'section_name': self.section_name,
            'date_created': self.date_created,
            'description': self.description
        }


class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    rating = db.Column(db.Integer, server_default=None)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))

    books_id = db.Column(db.Integer, db.ForeignKey('book.id', ondelete='CASCADE'))

    def to_dict(self):
        return {
            'id': self.id,
            'rating': self.rating,
        }


class UserBookRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'book_id': self.book_id,
            'status': self.status
        }


class UserBookBuy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    bookid = db.Column(db.Integer, db.ForeignKey('book.id', ondelete='CASCADE'))
    bought = db.Column(db.Boolean, default=False)
from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from extensions import db


def create_data(user_datastore : SQLAlchemyUserDatastore):
    print("### Creating data ###")

    user_datastore.find_or_create_role(name='admin', description='Administrator')
    user_datastore.find_or_create_role(name='user', description='User')

    if not user_datastore.find_user(email='admin@gmail.com'):
        user_datastore.create_user(email='admin@gmail.com', password=hash_password("admin"), active=True, roles=['admin'])

    if not user_datastore.find_user(email='test@gmail.com'):
        user_datastore.create_user(email='test@gmail.com', password=hash_password("test"), active=True, roles=['user'])

    db.session.commit()
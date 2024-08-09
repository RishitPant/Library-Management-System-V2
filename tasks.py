from celery import shared_task
from datetime import datetime, timedelta
from models import User, Book

def send_daily_reminder():
    remind_users = []
    users = User.query.all()
    books = Book.query.all()
    for user in users:
        # Check if the user hasn't visited in 15 days or has an upcoming return date within 7 days
        if user['last_visit'] < datetime.now() - timedelta(days=15):
            remind_users.append(user)
            break
    
from celery import shared_task
from datetime import datetime, timedelta
from models import User, Book
import flask_excel as excel
from mail_service import send_email


@shared_task(ignore_result=True)
def send_daily_reminder(to, sub, message):
    remind_users = []
    users = User.query.all()
    books = Book.query.all()
    for user in users:
        # Check if the user hasn't visited in 15 days or has an upcoming return date within 7 days
        if user['last_visit'] < datetime.now() - timedelta(hours=24):
            remind_users.append(user)
            break
        send_email(to, sub, message)
    return "OK"

@shared_task(ignore_result=False)
def create_csv():
    resource = Book.query.with_entities(Book.name, Book.content, Book.authors, Book.date_issued).all() #Book.return_date)
    csv_out = excel.make_response_from_query_sets(resource, ['name', 'content', 'authors', 'date_issued'], 'csv', file_name='file.csv')

    with open('./user-downloads/file.csv', 'wb') as file:
        file.write(csv_out.data)
    
    return 'file.csv'
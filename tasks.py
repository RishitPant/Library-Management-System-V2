from celery import shared_task
from datetime import datetime, timedelta
from models import User, Book
import flask_excel as excel
from mail_service import send_email


@shared_task(ignore_result=True)
def send_daily_reminder():
    remind_users = []
    users = User.query.all()
    books = Book.query.all()
    for user in users:
        if user.last_visit:
            if user.last_visit < datetime.now() - timedelta(hours=24):
                remind_users.append(user.email)

    if remind_users:
        subject = "Reminder to visit the library"
        for email in remind_users:
            content_body = f"<h1>Hi, {email}</h1><br><p>This is a reminder to visit the Library and read some books!</p>"
            send_email(email, subject, content_body)

    return "Reminders sent"


@shared_task(ignore_result=False)
def create_csv():
    resource = Book.query.with_entities(Book.name, Book.content, Book.authors, Book.date_issued).all() #Book.return_date)
    csv_out = excel.make_response_from_query_sets(resource, ['name', 'content', 'authors', 'date_issued'], 'csv', file_name='file.csv')

    with open('./user-downloads/file.csv', 'wb') as file:
        file.write(csv_out.data)
    
    return 'file.csv'
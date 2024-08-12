from celery import shared_task
from datetime import datetime, timedelta
from models import User, Book
import flask_excel as excel
from mail_service import send_email
from models import *
import os
import csv

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


@shared_task(ignore_result=True)
def send_monthly_activity_report():

    month_start = datetime.utcnow().replace(day=1)
    month_end = (month_start + timedelta(days=32)).replace(day=1)

    books_issued = Book.query.filter(Book.date_issued.between(month_start, month_end)).all()

    books_returned = UserBookConnection.query.filter(
        UserBookConnection.returned.is_(True), UserBookConnection.date_accessed.between(month_start, month_end)).all()

    feedbacks = Feedback.query.filter(Feedback.date.between(month_start, month_end)).all()

    content = f"""
    <html>
    <head><title>Monthly Activity Report - {month_start.strftime('%B %Y')}</title></head>
    <body>
    <h1>Monthly Activity Report ({month_start.strftime('%B %Y')})</h1>
    <h2>Books Issued</h2>
    <ul>
    """
    if books_issued:
        for book in books_issued:
            if book.name and book.authors:
                content += f"<li>{book.name} by {book.authors}</li>"
    else:
        content += "<li>No books issued this month.</li>"

    content += "</ul>"

    content += "<h2>Books Returned</h2><ul>"
    if books_returned:
        for connection in books_returned:
            book = Book.query.get(connection.book_id)
            if book and book.name and book.authors:
                content += f"<li>{book.name} by {book.authors}</li>"
    else:
        content += "<li>No books returned this month.</li>"

    content += "</ul>"

    content += "<h2>Feedbacks Received</h2><ul>"
    if feedbacks:
        for feedback in feedbacks:
            book = Book.query.get(feedback.books_id)
            if book and book.name:
                content += f"<li>{book.name} received a rating of {feedback.rating}</li>"
    else:
        content += "<li>No feedback received this month.</li>"

    content += "</ul>"

    content += "</body></html>"

    librarian_email = "librarian@lms.com"
    subject = f"Monthly Activity Report - {month_start.strftime('%B %Y')}"
    content_body = content
    send_email(librarian_email, subject, content_body)

    return "Monthly report sent"



@shared_task(ignore_result=False)
def export_books_to_csv():
    file_path = './user-downloads/issued_books.csv'

    connections = UserBookConnection.query.join(Book).with_entities(
        Book.name,
        Book.content,
        Book.authors,
        Book.date_issued,
        UserBookConnection.returned
    ).all()

    csv_out = excel.make_response_from_query_sets(
        connections,
        column_names=['name', 'content', 'authors', 'date_issued', 'returned'],
        file_type='csv',
        file_name='issued_books'
    )

    with open(file_path, 'wb') as file:
        file.write(csv_out.data)

    librarian_email = "librarian@example.com"
    subject = "CSV Export Completed"
    content_body = "The export on e-books has been completed successfully. Check your downloads for the CSV file."
    send_email(librarian_email, subject, content_body)

    return 'CSV export completed and email sent'
from flask import Flask
from extensions import db, security, cache
from create_initial_data import create_data
from flask_caching import Cache
import views
from worker import celery_init_app
import flask_excel as excel
from flask_mail import Mail
from tasks import send_daily_reminder
from celery.schedules import crontab


def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = 'catsarereal'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.sqlite3'
    app.config['SECURITY_PASSWORD_SALT'] = 'swaad-anusaar'

    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
    app.config['SECURITY_TOKEN_MAX_AGE'] = 3600
    app.config['SECURITY_LOGIN_WITHOUT_CONFIRMATION'] = True

    app.config['CACHE_TYPE'] = "RedisCache"
    app.config['CACHE_DEFAULT_TIMEOUT'] = 300
    app.config['DEBUG'] = True
    app.config['CACHE_REDIS_PORT'] = 6379

    app.config['MAIL_SERVER'] = 'smtp.google.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USERNAME'] = 'rishitpant100@gmail.com'
    app.config['MAIL_PASSWORD'] = 'hxnt kxjg nxlv pyrg'
    app.config['MAIL_USE_TLS'] = False
    app.config['MAIL_USE_SSL'] = True


    cache.init_app(app)

    db.init_app(app)

    with app.app_context():

        from models import User, Role
        from flask_security import SQLAlchemyUserDatastore

        user_datastore = SQLAlchemyUserDatastore(db, User, Role)

        security.init_app(app, user_datastore)

        db.create_all()

        create_data(user_datastore)

    app.config['WTF_CSRF_CHECK_DEFAULT'] = False
    app.config['SECURITY_CSRF_PROTECT_MECHANISMS'] = []
    app.config['SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS'] = True

    views.create_view(app, user_datastore, cache)

    return app

app = create_app()
celery_app = celery_init_app(app)
excel.init_excel(app)


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Executes every Monday morning at 7:30 a.m.
    sender.add_periodic_task(
        crontab(hour=7, minute=30, day_of_week=1),
        send_daily_reminder.s('Happy Mondays!'),
    )


if __name__ == "__main__":
    app.run(port=8080)
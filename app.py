"""
MLK Tech - Flask Application Entry Point

Run locally:
    flask --app app run --debug

Initialize database:
    flask --app app init-db
"""
import os

from flask import Flask

from config import Config
from extensions import ckeditor, csrf, db, login_manager
from models import Admin, Blog, Course


def create_app(config_class=Config):
    """Application factory."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    ckeditor.init_app(app)
    csrf.init_app(app)

    # User loader for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        from models import Admin
        return Admin.query.get(int(user_id))

    # Register blueprints
    from routes.admin import admin_bp
    from routes.main import main_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(admin_bp)

    # Track public website visitors (excludes /admin routes)
    from tracking import track_visitor
    track_visitor(app)

    # CLI command to create database tables and default admin
    @app.cli.command('init-db')
    def init_db():
        """Create tables and default admin user."""
        with app.app_context():
            db.create_all()
            _create_default_admin(app)
        print('Database initialized successfully.')

    @app.cli.command('seed-data')
    def seed_data():
        """Insert sample courses and blogs (optional demo data)."""
        from seed_data import seed_sample_data
        with app.app_context():
            seed_sample_data()
        print('Sample data seeded successfully.')

    @app.cli.command('upgrade-db')
    def upgrade_db():
        """
        Add new tables/columns for visitor tracking and view counts.
        Safe to run on existing databases — does not delete data.
        """
        from sqlalchemy import inspect, text

        with app.app_context():
            db.create_all()  # Creates visitors table if missing

            inspector = inspect(db.engine)
            columns_to_add = []

            if 'blogs' in inspector.get_table_names():
                blog_cols = [c['name'] for c in inspector.get_columns('blogs')]
                if 'view_count' not in blog_cols:
                    columns_to_add.append(
                        ("blogs", "ALTER TABLE blogs ADD COLUMN view_count INTEGER DEFAULT 0")
                    )

            if 'courses' in inspector.get_table_names():
                course_cols = [c['name'] for c in inspector.get_columns('courses')]
                if 'view_count' not in course_cols:
                    columns_to_add.append(
                        ("courses", "ALTER TABLE courses ADD COLUMN view_count INTEGER DEFAULT 0")
                    )

            for table, sql in columns_to_add:
                try:
                    db.session.execute(text(sql))
                    db.session.commit()
                    print(f'Added view_count to {table}')
                except Exception as e:
                    db.session.rollback()
                    print(f'{table}: {e}')

            print('Database upgrade completed.')

    # Ensure upload folders exist
    with app.app_context():
        for folder in ['blogs', 'courses']:
            path = os.path.join(app.root_path, 'static', 'uploads', folder)
            os.makedirs(path, exist_ok=True)

    return app


def _create_default_admin(app):
    """Create default admin if none exists."""
    if Admin.query.first() is None:
        admin = Admin(username=app.config['ADMIN_USERNAME'])
        admin.set_password(app.config['ADMIN_PASSWORD'])
        db.session.add(admin)
        db.session.commit()
        print(f"Default admin created: {app.config['ADMIN_USERNAME']}")


# Create app instance for `flask --app app` commands
app = create_app()


if __name__ == '__main__':
    app.run(debug=True)

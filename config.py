"""
MLK Tech - Application Configuration
Copy .env.example to .env and update values before running.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration shared across environments."""

    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-change-in-production')

    # Database connection
    # MySQL (production): mysql+pymysql://username:password@host:port/database_name
    # SQLite (local dev fallback): sqlite:///mlktech.db
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'sqlite:///' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mlktech.db')
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {'pool_recycle': 280}

    # File uploads
    UPLOAD_FOLDER = os.path.join('static', 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB max upload size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # CKEditor
    CKEDITOR_SERVE_LOCAL = True
    CKEDITOR_HEIGHT = 400
    CKEDITOR_FILE_UPLOADER = 'admin.upload_ckeditor_image'

    # Admin default (created on init-db if not exists)
    ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

    # Pagination
    BLOGS_PER_PAGE = 6
    COURSES_PER_PAGE = 6
    ADMIN_PER_PAGE = 10

    # Visitor tracking: skip duplicate IP+page within this many minutes
    VISITOR_DEDUP_MINUTES = 30

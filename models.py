"""Database models for MLK Tech."""
import json
from datetime import datetime

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db


class Admin(UserMixin, db.Model):
    """Admin user for dashboard access."""

    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Contact(db.Model):
    """Contact form submissions."""

    __tablename__ = 'contacts'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Blog(db.Model):
    """Blog posts with SEO fields."""

    __tablename__ = 'blogs'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(220), unique=True, nullable=False, index=True)
    excerpt = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(255), nullable=True)
    category = db.Column(db.String(80), nullable=False)
    author = db.Column(db.String(100), nullable=False, default='MLK Tech')
    meta_title = db.Column(db.String(200), nullable=True)
    meta_description = db.Column(db.String(300), nullable=True)
    meta_keywords = db.Column(db.String(300), nullable=True)
    is_published = db.Column(db.Boolean, default=True)
    view_count = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def image_url(self):
        if self.image:
            return f'/static/uploads/blogs/{self.image}'
        return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80'

    @property
    def formatted_date(self):
        return self.created_at.strftime('%b %d, %Y') if self.created_at else ''


class Course(db.Model):
    """Training courses with syllabus stored as JSON."""

    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(220), unique=True, nullable=False, index=True)
    short_description = db.Column(db.Text, nullable=False)
    full_description = db.Column(db.Text, nullable=False)
    duration = db.Column(db.String(50), nullable=False)
    duration_group = db.Column(db.String(20), nullable=False, default='medium')
    fees = db.Column(db.String(50), nullable=False)
    mode = db.Column(db.String(50), nullable=False, default='Online & Offline')
    category = db.Column(db.String(50), nullable=False, default='development')
    image = db.Column(db.String(255), nullable=True)
    modules_json = db.Column(db.Text, nullable=True)
    benefits_json = db.Column(db.Text, nullable=True)
    is_published = db.Column(db.Boolean, default=True)
    view_count = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    enquiries = db.relationship('CourseEnquiry', backref='course', lazy=True)

    @property
    def image_url(self):
        if self.image:
            return f'/static/uploads/courses/{self.image}'
        return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80'

    def get_modules(self):
        if self.modules_json:
            try:
                return json.loads(self.modules_json)
            except json.JSONDecodeError:
                return []
        return []

    def set_modules(self, modules_list):
        self.modules_json = json.dumps(modules_list)

    def get_benefits(self):
        if self.benefits_json:
            try:
                return json.loads(self.benefits_json)
            except json.JSONDecodeError:
                return []
        return []

    def set_benefits(self, benefits_list):
        self.benefits_json = json.dumps(benefits_list)


class CourseEnquiry(db.Model):
    """Course enquiry form submissions."""

    __tablename__ = 'course_enquiries'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    course_name = db.Column(db.String(200), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=True)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Visitor(db.Model):
    """Website visitor analytics log."""

    __tablename__ = 'visitors'

    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), nullable=False, index=True)
    page_url = db.Column(db.String(500), nullable=False)
    user_agent = db.Column(db.String(500), nullable=True)
    page_type = db.Column(db.String(20), nullable=True, index=True)
    visited_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    @property
    def browser_name(self):
        """Extract a simple browser name from user agent string."""
        ua = (self.user_agent or '').lower()
        if 'edg' in ua:
            return 'Edge'
        if 'chrome' in ua:
            return 'Chrome'
        if 'firefox' in ua:
            return 'Firefox'
        if 'safari' in ua:
            return 'Safari'
        if 'opera' in ua or 'opr' in ua:
            return 'Opera'
        return 'Other'

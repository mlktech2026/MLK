"""
Website visitor tracking middleware.
Logs public page visits and increments page view counters.
Admin routes and static files are excluded.
"""
from datetime import datetime, timedelta

from flask import request

from extensions import db
from models import Blog, Course, Visitor


def should_track_request():
    """Return True only for trackable public GET page requests."""
    if request.method != 'GET':
        return False

    path = request.path or ''

    # Skip admin panel, static assets, and uploads
    if path.startswith('/admin') or path.startswith('/static'):
        return False

    # Skip favicon and common bot noise
    if path in ('/favicon.ico', '/robots.txt'):
        return False

    return True


def get_client_ip():
    """Get visitor IP (supports reverse proxy X-Forwarded-For)."""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    return request.remote_addr or '0.0.0.0'


def is_duplicate_visit(ip_address, page_url, minutes=30):
    """
    Prevent duplicate records from the same IP on the same page
    within the configured time window.
    """
    cutoff = datetime.utcnow() - timedelta(minutes=minutes)
    recent = Visitor.query.filter(
        Visitor.ip_address == ip_address,
        Visitor.page_url == page_url,
        Visitor.visited_at >= cutoff,
    ).first()
    return recent is not None


def increment_page_views(endpoint, view_args):
    """Increment view counters for home, blog, and course detail pages."""
    if endpoint == 'main.index':
        # Home views are counted via Visitor records with page_type='home'
        return

    if endpoint == 'main.blog_view' and view_args.get('slug'):
        blog = Blog.query.filter_by(slug=view_args['slug']).first()
        if blog:
            blog.view_count = (blog.view_count or 0) + 1

    if endpoint == 'main.course_detail' and view_args.get('slug'):
        course = Course.query.filter_by(slug=view_args['slug']).first()
        if course:
            course.view_count = (course.view_count or 0) + 1


def get_page_type(endpoint):
    """Map Flask endpoint to analytics page type."""
    mapping = {
        'main.index': 'home',
        'main.blog_view': 'blog',
        'main.course_detail': 'course',
    }
    return mapping.get(endpoint, 'other')


def track_visitor(app):
    """Register before_request handler on the Flask app."""

    @app.before_request
    def _track_visitor():
        if not should_track_request():
            return

        dedup_minutes = app.config.get('VISITOR_DEDUP_MINUTES', 30)
        ip_address = get_client_ip()
        page_url = request.path
        user_agent = (request.user_agent.string or 'Unknown')[:500]

        endpoint = request.endpoint or ''
        view_args = request.view_args or {}
        page_type = get_page_type(endpoint)

        # Always increment page view counters (blog/course detail pages)
        increment_page_views(endpoint, view_args)

        # Skip duplicate visitor log (same IP + page within time window)
        if is_duplicate_visit(ip_address, page_url, dedup_minutes):
            try:
                db.session.commit()  # commit view_count updates
            except Exception:
                db.session.rollback()
            return

        visitor = Visitor(
            ip_address=ip_address,
            page_url=page_url,
            user_agent=user_agent,
            page_type=page_type,
            visited_at=datetime.utcnow(),
        )
        db.session.add(visitor)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()

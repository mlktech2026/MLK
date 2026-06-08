"""
Analytics helper functions for admin dashboard charts.
"""
from datetime import datetime, timedelta

from sqlalchemy import func, extract

from extensions import db
from models import Blog, Course, Visitor


def get_dashboard_stats():
    """Return summary statistics for the admin dashboard."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    total_visitors = Visitor.query.count()
    today_visitors = Visitor.query.filter(Visitor.visited_at >= today_start).count()
    home_views = Visitor.query.filter_by(page_type='home').count()

    most_viewed_blog = Blog.query.order_by(Blog.view_count.desc()).first()
    most_viewed_course = Course.query.order_by(Course.view_count.desc()).first()

    total_blog_views = db.session.query(func.coalesce(func.sum(Blog.view_count), 0)).scalar() or 0
    total_course_views = db.session.query(func.coalesce(func.sum(Course.view_count), 0)).scalar() or 0

    return {
        'total_visitors': total_visitors,
        'today_visitors': today_visitors,
        'home_views': home_views,
        'total_blog_views': int(total_blog_views),
        'total_course_views': int(total_course_views),
        'most_viewed_blog': most_viewed_blog,
        'most_viewed_course': most_viewed_course,
    }


def get_daily_visitors(days=7):
    """Return daily visitor counts for the last N days (for Chart.js)."""
    labels = []
    data = []

    for i in range(days - 1, -1, -1):
        day = datetime.utcnow().date() - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = day_start + timedelta(days=1)

        count = Visitor.query.filter(
            Visitor.visited_at >= day_start,
            Visitor.visited_at < day_end,
        ).count()

        labels.append(day.strftime('%b %d'))
        data.append(count)

    return {'labels': labels, 'data': data}


def get_monthly_visitors(months=6):
    """Return monthly visitor counts for the last N months."""
    labels = []
    data = []

    now = datetime.utcnow()
    for i in range(months - 1, -1, -1):
        # Calculate target month
        month = now.month - i
        year = now.year
        while month <= 0:
            month += 12
            year -= 1

        count = Visitor.query.filter(
            extract('year', Visitor.visited_at) == year,
            extract('month', Visitor.visited_at) == month,
        ).count()

        labels.append(datetime(year, month, 1).strftime('%b %Y'))
        data.append(count)

    return {'labels': labels, 'data': data}


def get_most_viewed_pages(limit=5):
    """Return most visited page URLs from visitor logs."""
    results = (
        db.session.query(Visitor.page_url, func.count(Visitor.id).label('views'))
        .group_by(Visitor.page_url)
        .order_by(func.count(Visitor.id).desc())
        .limit(limit)
        .all()
    )
    return [{'url': r.page_url, 'views': r.views} for r in results]


def get_blog_views_chart(limit=5):
    """Top blogs by view_count for chart."""
    blogs = Blog.query.order_by(Blog.view_count.desc()).limit(limit).all()
    return {
        'labels': [b.title[:30] + ('...' if len(b.title) > 30 else '') for b in blogs],
        'data': [b.view_count or 0 for b in blogs],
    }


def get_course_views_chart(limit=5):
    """Top courses by view_count for chart."""
    courses = Course.query.order_by(Course.view_count.desc()).limit(limit).all()
    return {
        'labels': [c.title[:30] + ('...' if len(c.title) > 30 else '') for c in courses],
        'data': [c.view_count or 0 for c in courses],
    }

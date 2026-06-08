"""
Public-facing routes for MLK Tech website.
Handles pages, contact form, course enquiries, blog & course listings.
"""
import re

from flask import Blueprint, flash, redirect, render_template, request, url_for
from sqlalchemy import or_

from extensions import db
from models import Blog, Contact, Course, CourseEnquiry

main_bp = Blueprint('main', __name__)

# Blog category options (used in templates)
BLOG_CATEGORIES = [
    'AI & ML', 'Web Development', 'Cloud', 'Career',
    'Design', 'Security', 'Marketing', 'Technology'
]

COURSE_CATEGORIES = {
    'development': 'Development',
    'data': 'Data & AI',
    'cloud': 'Cloud & DevOps',
    'design': 'Design & Marketing',
    'security': 'Security',
}


def validate_email(email):
  return re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email)


def validate_phone(phone):
  return re.match(r'^[+]?[\d\s\-()]{7,15}$', phone)


@main_bp.route('/')
def index():
    """Home page with featured courses from database."""
    featured_courses = (
        Course.query.filter_by(is_published=True)
        .order_by(Course.created_at.desc())
        .limit(4)
        .all()
    )
    return render_template('index.html', active_page='home', featured_courses=featured_courses)


@main_bp.route('/about')
def about():
    return render_template('about.html', active_page='about')


@main_bp.route('/services')
def services():
    return render_template('services.html', active_page='services')


@main_bp.route('/courses')
def courses():
    """Course listing with search, filter, and pagination."""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '').strip()
    category = request.args.get('category', 'all')
    duration = request.args.get('duration', 'all')

    query = Course.query.filter_by(is_published=True)

    if search:
        query = query.filter(
            or_(
                Course.title.ilike(f'%{search}%'),
                Course.short_description.ilike(f'%{search}%'),
            )
        )
    if category != 'all':
        query = query.filter_by(category=category)
    if duration != 'all':
        query = query.filter_by(duration_group=duration)

    pagination = query.order_by(Course.created_at.desc()).paginate(
        page=page,
        per_page=6,
        error_out=False,
    )

    return render_template(
        'courses.html',
        active_page='courses',
        courses=pagination.items,
        pagination=pagination,
        search=search,
        category=category,
        duration=duration,
        course_categories=COURSE_CATEGORIES,
    )


@main_bp.route('/course/<slug>', methods=['GET', 'POST'])
def course_detail(slug):
    """Single course page with enquiry form."""
    course = Course.query.filter_by(slug=slug, is_published=True).first_or_404()

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        message = request.form.get('message', '').strip()

        errors = []
        if len(name) < 2:
            errors.append('Please enter a valid name.')
        if not validate_email(email):
            errors.append('Please enter a valid email address.')
        if not validate_phone(phone):
            errors.append('Please enter a valid phone number.')
        if len(message) < 10:
            errors.append('Message must be at least 10 characters.')

        if errors:
            for err in errors:
                flash(err, 'danger')
        else:
            enquiry = CourseEnquiry(
                name=name,
                email=email,
                phone=phone,
                course_name=course.title,
                course_id=course.id,
                message=message,
            )
            db.session.add(enquiry)
            db.session.commit()
            flash('Thank you! Your enquiry has been submitted successfully.', 'success')
            return redirect(url_for('main.course_detail', slug=slug))

    return render_template('course_details.html', active_page='courses', course=course)


@main_bp.route('/blog')
def blog_list():
    """Blog listing with search, category filter, and pagination."""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '').strip()
    category = request.args.get('category', 'all')

    query = Blog.query.filter_by(is_published=True)

    if search:
        query = query.filter(
            or_(
                Blog.title.ilike(f'%{search}%'),
                Blog.excerpt.ilike(f'%{search}%'),
                Blog.author.ilike(f'%{search}%'),
            )
        )
    if category != 'all':
        query = query.filter_by(category=category)

    pagination = query.order_by(Blog.created_at.desc()).paginate(
        page=page,
        per_page=6,
        error_out=False,
    )

    return render_template(
        'blog.html',
        active_page='blog',
        blogs=pagination.items,
        pagination=pagination,
        search=search,
        category=category,
        blog_categories=BLOG_CATEGORIES,
    )


@main_bp.route('/blog/<slug>')
def blog_view(slug):
    """Single blog article with SEO meta tags."""
    blog = Blog.query.filter_by(slug=slug, is_published=True).first_or_404()

    recent_blogs = (
        Blog.query.filter(Blog.id != blog.id, Blog.is_published.is_(True))
        .order_by(Blog.created_at.desc())
        .limit(4)
        .all()
    )

    related_blogs = (
        Blog.query.filter(
            Blog.id != blog.id,
            Blog.category == blog.category,
            Blog.is_published.is_(True),
        )
        .order_by(Blog.created_at.desc())
        .limit(3)
        .all()
    )

    if not related_blogs:
        related_blogs = (
            Blog.query.filter(Blog.id != blog.id, Blog.is_published.is_(True))
            .order_by(Blog.created_at.desc())
            .limit(3)
            .all()
        )

    return render_template(
        'blog_view.html',
        active_page='blog',
        blog=blog,
        recent_blogs=recent_blogs,
        related_blogs=related_blogs,
    )


@main_bp.route('/contact', methods=['GET', 'POST'])
def contact():
    """Contact page with form submission to database."""
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        subject = request.form.get('subject', '').strip()
        message = request.form.get('message', '').strip()

        errors = []
        if len(name) < 2:
            errors.append('Please enter a valid name.')
        if not validate_email(email):
            errors.append('Please enter a valid email address.')
        if not validate_phone(phone):
            errors.append('Please enter a valid phone number.')
        if not subject:
            errors.append('Subject is required.')
        if len(message) < 10:
            errors.append('Message must be at least 10 characters.')

        if errors:
            for err in errors:
                flash(err, 'danger')
        else:
            contact_msg = Contact(
                name=name,
                email=email,
                phone=phone,
                subject=subject,
                message=message,
            )
            db.session.add(contact_msg)
            db.session.commit()
            flash('Thank you! Your message has been sent successfully.', 'success')
            return redirect(url_for('main.contact'))

    return render_template('contact.html', active_page='contact')

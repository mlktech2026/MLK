"""
Admin panel routes - login, dashboard, CRUD for blogs/courses,
contact and enquiry management.
"""
from flask import (
    Blueprint, current_app, flash, jsonify, redirect,
    render_template, request, url_for,
)
from flask_login import current_user, login_required, login_user, logout_user
from extensions import csrf, db
from models import Admin, Blog, Contact, Course, CourseEnquiry
from utils import delete_upload, generate_slug, save_upload, unique_slug

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

BLOG_CATEGORIES = [
    'AI & ML', 'Web Development', 'Cloud', 'Career',
    'Design', 'Security', 'Marketing', 'Technology'
]


@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Admin login with session-based authentication."""
    if current_user.is_authenticated:
        return redirect(url_for('admin.dashboard'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        admin = Admin.query.filter_by(username=username).first()
        if admin and admin.check_password(password):
            login_user(admin)
            flash('Welcome back!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page or url_for('admin.dashboard'))

        flash('Invalid username or password.', 'danger')

    return render_template('admin/login.html')


@admin_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('admin.login'))


@admin_bp.route('/dashboard')
@login_required
def dashboard():
    """Dashboard with counts and latest messages."""
    stats = {
        'contacts': Contact.query.count(),
        'blogs': Blog.query.count(),
        'courses': Course.query.count(),
        'enquiries': CourseEnquiry.query.count(),
    }
    latest_contacts = Contact.query.order_by(Contact.created_at.desc()).limit(5).all()
    latest_enquiries = CourseEnquiry.query.order_by(CourseEnquiry.created_at.desc()).limit(5).all()

    return render_template(
        'admin/dashboard.html',
        stats=stats,
        latest_contacts=latest_contacts,
        latest_enquiries=latest_enquiries,
    )


# --------------------------------------------------------------------------
# Contacts
# --------------------------------------------------------------------------
@admin_bp.route('/contacts')
@login_required
def contacts():
    messages = Contact.query.order_by(Contact.created_at.desc()).all()
    return render_template('admin/contacts.html', messages=messages)


@admin_bp.route('/contacts/delete/<int:contact_id>', methods=['POST'])
@login_required
def delete_contact(contact_id):
    contact = Contact.query.get_or_404(contact_id)
    db.session.delete(contact)
    db.session.commit()
    flash('Contact message deleted.', 'success')
    return redirect(url_for('admin.contacts'))


# --------------------------------------------------------------------------
# Enquiries
# --------------------------------------------------------------------------
@admin_bp.route('/enquiries')
@login_required
def enquiries():
    items = CourseEnquiry.query.order_by(CourseEnquiry.created_at.desc()).all()
    return render_template('admin/enquiries.html', enquiries=items)


@admin_bp.route('/enquiries/delete/<int:enquiry_id>', methods=['POST'])
@login_required
def delete_enquiry(enquiry_id):
    enquiry = CourseEnquiry.query.get_or_404(enquiry_id)
    db.session.delete(enquiry)
    db.session.commit()
    flash('Enquiry deleted.', 'success')
    return redirect(url_for('admin.enquiries'))


# --------------------------------------------------------------------------
# Blogs CRUD
# --------------------------------------------------------------------------
@admin_bp.route('/blogs')
@login_required
def blogs():
    search = request.args.get('search', '').strip()
    query = Blog.query
    if search:
        query = query.filter(Blog.title.ilike(f'%{search}%'))
    all_blogs = query.order_by(Blog.created_at.desc()).all()
    return render_template('admin/blogs.html', blogs=all_blogs, search=search)


@admin_bp.route('/blogs/add', methods=['GET', 'POST'])
@login_required
def add_blog():
    if request.method == 'POST':
        return _save_blog()
    return render_template('admin/blog_form.html', blog=None, categories=BLOG_CATEGORIES)


@admin_bp.route('/blogs/edit/<int:blog_id>', methods=['GET', 'POST'])
@login_required
def edit_blog(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    if request.method == 'POST':
        return _save_blog(blog)
    return render_template('admin/blog_form.html', blog=blog, categories=BLOG_CATEGORIES)


@admin_bp.route('/blogs/delete/<int:blog_id>', methods=['POST'])
@login_required
def delete_blog(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    delete_upload(blog.image, 'blogs')
    db.session.delete(blog)
    db.session.commit()
    flash('Blog deleted successfully.', 'success')
    return redirect(url_for('admin.blogs'))


def _save_blog(blog=None):
    """Shared logic for creating and updating blogs."""
    title = request.form.get('title', '').strip()
    slug = request.form.get('slug', '').strip() or generate_slug(title)
    excerpt = request.form.get('excerpt', '').strip()
    content = request.form.get('content', '').strip()
    category = request.form.get('category', '').strip()
    author = request.form.get('author', 'MLK Tech').strip()
    meta_title = request.form.get('meta_title', '').strip()
    meta_description = request.form.get('meta_description', '').strip()
    meta_keywords = request.form.get('meta_keywords', '').strip()
    is_published = request.form.get('is_published') == 'on'

    if not title or not excerpt or not content or not category:
        flash('Title, excerpt, content, and category are required.', 'danger')
        return render_template('admin/blog_form.html', blog=blog, categories=BLOG_CATEGORIES)

    slug = unique_slug(Blog, slug, blog.id if blog else None)

    if blog is None:
        blog = Blog()
        db.session.add(blog)

    blog.title = title
    blog.slug = slug
    blog.excerpt = excerpt
    blog.content = content
    blog.category = category
    blog.author = author
    blog.meta_title = meta_title or title
    blog.meta_description = meta_description or excerpt[:300]
    blog.meta_keywords = meta_keywords
    blog.is_published = is_published

    if 'image' in request.files:
        try:
            filename = save_upload(request.files['image'], 'blogs')
            if filename:
                if blog.image:
                    delete_upload(blog.image, 'blogs')
                blog.image = filename
        except ValueError as e:
            flash(str(e), 'danger')
            return render_template('admin/blog_form.html', blog=blog, categories=BLOG_CATEGORIES)

    db.session.commit()
    flash('Blog saved successfully.', 'success')
    return redirect(url_for('admin.blogs'))


# --------------------------------------------------------------------------
# Courses CRUD
# --------------------------------------------------------------------------
@admin_bp.route('/courses')
@login_required
def courses():
    search = request.args.get('search', '').strip()
    query = Course.query
    if search:
        query = query.filter(Course.title.ilike(f'%{search}%'))
    all_courses = query.order_by(Course.created_at.desc()).all()
    return render_template('admin/courses.html', courses=all_courses, search=search)


@admin_bp.route('/courses/add', methods=['GET', 'POST'])
@login_required
def add_course():
    if request.method == 'POST':
        return _save_course()
    return render_template('admin/course_form.html', course=None)


@admin_bp.route('/courses/edit/<int:course_id>', methods=['GET', 'POST'])
@login_required
def edit_course(course_id):
    course = Course.query.get_or_404(course_id)
    if request.method == 'POST':
        return _save_course(course)
    return render_template('admin/course_form.html', course=course)


@admin_bp.route('/courses/delete/<int:course_id>', methods=['POST'])
@login_required
def delete_course(course_id):
    course = Course.query.get_or_404(course_id)
    delete_upload(course.image, 'courses')
    db.session.delete(course)
    db.session.commit()
    flash('Course deleted successfully.', 'success')
    return redirect(url_for('admin.courses'))


def _save_course(course=None):
    """Shared logic for creating and updating courses."""
    title = request.form.get('title', '').strip()
    slug = request.form.get('slug', '').strip() or generate_slug(title)
    short_description = request.form.get('short_description', '').strip()
    full_description = request.form.get('full_description', '').strip()
    duration = request.form.get('duration', '').strip()
    duration_group = request.form.get('duration_group', 'medium')
    fees = request.form.get('fees', '').strip()
    mode = request.form.get('mode', 'Online & Offline').strip()
    category = request.form.get('category', 'development')
    is_published = request.form.get('is_published') == 'on'

    modules_titles = request.form.getlist('module_title[]')
    modules_descs = request.form.getlist('module_desc[]')
    modules = [
        {'title': t.strip(), 'description': d.strip()}
        for t, d in zip(modules_titles, modules_descs)
        if t.strip()
    ]

    benefits = [
        b.strip() for b in request.form.getlist('benefit[]') if b.strip()
    ]

    if not title or not short_description or not full_description or not duration or not fees:
        flash('Please fill all required course fields.', 'danger')
        return render_template('admin/course_form.html', course=course)

    slug = unique_slug(Course, slug, course.id if course else None)

    if course is None:
        course = Course()
        db.session.add(course)

    course.title = title
    course.slug = slug
    course.short_description = short_description
    course.full_description = full_description
    course.duration = duration
    course.duration_group = duration_group
    course.fees = fees
    course.mode = mode
    course.category = category
    course.is_published = is_published
    course.set_modules(modules)
    course.set_benefits(benefits)

    if 'image' in request.files:
        try:
            filename = save_upload(request.files['image'], 'courses')
            if filename:
                if course.image:
                    delete_upload(course.image, 'courses')
                course.image = filename
        except ValueError as e:
            flash(str(e), 'danger')
            return render_template('admin/course_form.html', course=course)

    db.session.commit()
    flash('Course saved successfully.', 'success')
    return redirect(url_for('admin.courses'))


# --------------------------------------------------------------------------
# CKEditor image upload
# --------------------------------------------------------------------------
@admin_bp.route('/upload-ckeditor-image', methods=['POST'])
@csrf.exempt
@login_required
def upload_ckeditor_image():
    """Handle image uploads from CKEditor."""
    file = request.files.get('upload')
    if not file:
        return jsonify({'error': {'message': 'No file uploaded'}}), 400

    try:
        filename = save_upload(file, 'blogs')
        image_url = url_for('static', filename=f'uploads/blogs/{filename}', _external=True)
        return jsonify({'url': image_url, 'uploaded': True})
    except ValueError as e:
        return jsonify({'error': {'message': str(e)}}), 400

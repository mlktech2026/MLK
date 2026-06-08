"""Helper utilities for uploads, slugs, and validation."""
import os
import re
import uuid

from flask import current_app
from werkzeug.utils import secure_filename


def allowed_file(filename):
    """Check if uploaded file has an allowed extension."""
    return (
        '.' in filename
        and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']
    )


def generate_slug(text):
    """Convert text into a URL-friendly slug."""
    slug = text.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    return slug.strip('-')


def unique_slug(model, title, exclude_id=None):
    """Generate a unique slug for a database model."""
    base_slug = generate_slug(title) or 'item'
    slug = base_slug
    counter = 1

    while True:
        query = model.query.filter_by(slug=slug)
        if exclude_id:
            query = query.filter(model.id != exclude_id)
        if not query.first():
            return slug
        slug = f'{base_slug}-{counter}'
        counter += 1


def save_upload(file, subfolder):
    """
    Save uploaded file securely.
    subfolder: 'blogs' or 'courses'
    Returns saved filename or None.
    """
    if not file or file.filename == '':
        return None

    if not allowed_file(file.filename):
        raise ValueError('Invalid file type. Allowed: png, jpg, jpeg, gif, webp')

    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f'{uuid.uuid4().hex}.{ext}'
    upload_dir = os.path.join(current_app.root_path, 'static', 'uploads', subfolder)
    os.makedirs(upload_dir, exist_ok=True)
    file.save(os.path.join(upload_dir, filename))
    return filename


def delete_upload(filename, subfolder):
    """Remove an uploaded file from disk."""
    if not filename:
        return
    filepath = os.path.join(current_app.root_path, 'static', 'uploads', subfolder, filename)
    if os.path.exists(filepath):
        os.remove(filepath)

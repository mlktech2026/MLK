# MLK Tech - Flask Web Application

Dynamic Flask backend for the MLK Tech website. The original HTML/CSS/Bootstrap design is preserved; blogs, courses, contacts, and enquiries are managed from the admin panel.

## Tech Stack

- **Flask** + **Jinja2** templates
- **Flask-SQLAlchemy** + **MySQL** (SQLite supported for local dev)
- **Flask-Login** (session-based admin auth)
- **Flask-CKEditor** (rich blog content)
- **Bootstrap 5** + existing `style.css`

## Project Structure

```
MLK_tech/
├── app.py                 # Application entry point
├── config.py              # Configuration
├── models.py              # Database models
├── extensions.py          # Flask extensions
├── utils.py               # Upload & slug helpers
├── seed_data.py           # Optional sample data
├── requirements.txt
├── static/
│   ├── css/style.css      # Original frontend styles
│   ├── js/main.js         # Original UI scripts
│   └── uploads/           # Blog & course images
└── templates/
    ├── base.html          # Public layout
    ├── index.html, about.html, ...
    └── admin/             # Admin panel templates
```

## Step 1: Install Dependencies

```bash
cd "r:\Gowtham\Client side\Teltam_website\Web reference\MLK_tech"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Step 2: MySQL Database Setup

1. Install MySQL Server and create a database:

```sql
CREATE DATABASE mlktech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mlkuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON mlktech.* TO 'mlkuser'@'localhost';
FLUSH PRIVILEGES;
```

2. Copy environment file and update values:

```bash
copy .env.example .env
```

Edit `.env`:

```env
SECRET_KEY=change-this-to-a-random-secret-key
DATABASE_URL=mysql+pymysql://mlkuser:your_password@localhost:3306/mlktech
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

> **Local dev without MySQL:** Omit `DATABASE_URL` in `.env` to use SQLite (`mlktech.db` in project folder).

## Step 3: Initialize Database

**New installation:**
```bash
flask --app app init-db
```

**Existing database (add visitor tracking & view counts):**
```bash
flask --app app upgrade-db
```

Optional sample data:

```bash
flask --app app seed-data
```

## Step 4: Run the Application

```bash
flask --app app run --debug
```

Open:

- **Website:** http://127.0.0.1:5000
- **Admin:** http://127.0.0.1:5000/admin/login

Default admin credentials (change after first login):

- Username: `admin`
- Password: `admin123`

## Admin Features

| Module | Features |
|--------|----------|
| **Dashboard** | Stats cards, Chart.js analytics, visitor tracking, latest messages |
| **Visitors** | Paginated visitor log (IP, page, browser, date/time) |
| **Contacts** | View & delete contact form submissions |
| **Enquiries** | View & delete course enquiry submissions |
| **Blogs** | CRUD, image upload, CKEditor, SEO fields, slug URLs |
| **Courses** | CRUD, image upload, modules, benefits, syllabus |

## Public Routes

| URL | Page |
|-----|------|
| `/` | Home |
| `/about` | About Us |
| `/services` | Services |
| `/courses` | Course listing (search, filter, pagination) |
| `/course/<slug>` | Course details + enquiry form |
| `/blog` | Blog listing (search, filter, pagination) |
| `/blog/<slug>` | Blog article (dynamic SEO meta tags) |
| `/contact` | Contact form |

## Production Notes

1. Set a strong `SECRET_KEY` in `.env`
2. Use MySQL in production (`DATABASE_URL`)
3. Change default admin password immediately
4. Run with Gunicorn: `gunicorn -w 4 app:app`
5. Serve static uploads from `static/uploads/`

## Original Static Files

The original static HTML files (`index.html`, `blog.html`, etc.) remain in the project root for reference. The live site uses `templates/` and `static/`.
"# MLK_FLASK" 

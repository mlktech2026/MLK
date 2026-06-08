"""Optional sample data for development and demo."""
from extensions import db
from models import Blog, Course


def seed_sample_data():
    """Add sample courses and blogs if database is empty."""

    if Course.query.count() == 0:
        courses = [
            {
                'title': 'Full Stack Web Development',
                'slug': 'full-stack-web-development',
                'short_description': 'Master HTML, CSS, JavaScript, React, Node.js, and databases.',
                'full_description': 'Master modern web development with HTML, CSS, JavaScript, React, Node.js, and databases. Build real-world projects and launch your career as a full stack developer.',
                'duration': '6 Months',
                'duration_group': 'medium',
                'fees': '₹45,000',
                'mode': 'Online & Offline',
                'category': 'development',
                'modules': [
                    {'title': 'HTML5 & CSS3', 'description': 'Semantic markup and responsive design.'},
                    {'title': 'JavaScript & ES6+', 'description': 'Core JS and async programming.'},
                    {'title': 'React.js', 'description': 'Components, hooks, and routing.'},
                ],
                'benefits': ['Industry certificate', 'Placement support', 'Live projects'],
            },
            {
                'title': 'AI & Machine Learning',
                'slug': 'ai-machine-learning',
                'short_description': 'Build intelligent systems with cutting-edge AI tools.',
                'full_description': 'Explore artificial intelligence and machine learning from fundamentals to advanced applications.',
                'duration': '8 Months',
                'duration_group': 'long',
                'fees': '₹55,000',
                'mode': 'Online & Offline',
                'category': 'data',
                'modules': [
                    {'title': 'AI Foundations', 'description': 'Introduction to AI and ethics.'},
                    {'title': 'Machine Learning', 'description': 'Supervised and unsupervised learning.'},
                ],
                'benefits': ['GPU lab access', 'Expert mentorship', 'AI project portfolio'],
            },
        ]
        for data in courses:
            course = Course(
                title=data['title'],
                slug=data['slug'],
                short_description=data['short_description'],
                full_description=data['full_description'],
                duration=data['duration'],
                duration_group=data['duration_group'],
                fees=data['fees'],
                mode=data['mode'],
                category=data['category'],
            )
            course.set_modules(data['modules'])
            course.set_benefits(data['benefits'])
            db.session.add(course)

    if Blog.query.count() == 0:
        blogs = [
            {
                'title': 'The Future of AI in 2026: Trends Every Business Should Know',
                'slug': 'future-of-ai-2026',
                'excerpt': 'Discover the top AI trends shaping industries in 2026.',
                'content': '<p>Artificial intelligence continues to reshape how businesses operate.</p><h3>Generative AI Goes Enterprise</h3><p>Companies are deploying custom LLMs trained on proprietary data.</p>',
                'category': 'AI & ML',
                'author': 'Lakshmi Devi',
                'meta_title': 'Future of AI 2026 | MLK Tech Blog',
                'meta_description': 'Top AI trends in 2026 for businesses.',
                'meta_keywords': 'AI, machine learning, 2026 trends',
            },
            {
                'title': 'React vs Angular in 2026: Which Framework Should You Learn?',
                'slug': 'react-vs-angular-2026',
                'excerpt': 'A comprehensive comparison of React and Angular for developers.',
                'content': '<p>Choosing between React and Angular remains a common dilemma.</p><h3>React: Flexibility</h3><p>React offers a vast ecosystem and flexibility.</p>',
                'category': 'Web Development',
                'author': 'Karthik Rajan',
                'meta_title': 'React vs Angular 2026 | MLK Tech',
                'meta_description': 'Compare React and Angular in 2026.',
                'meta_keywords': 'React, Angular, web development',
            },
        ]
        for data in blogs:
            blog = Blog(**data)
            db.session.add(blog)

    db.session.commit()

/**
 * MLK Tech - Main JavaScript
 * Handles navbar, animations, course filtering, and form validation
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     DOM Ready
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initScrollAnimations();
    initBackToTop();
    initActiveNavLink();
    initCourseFilter();
    initEnquiryForm();
    initContactForm();
    initCommentForm();
    loadCourseDetails();
    initBlogListing();
    loadBlogDetails();
    initShareButtons();
  });

  /* --------------------------------------------------------------------------
     Sticky Navbar with scroll effect
     -------------------------------------------------------------------------- */
  function initNavbar() {
    const navbar = document.querySelector('.navbar-custom');
    if (!navbar) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Close mobile menu on link click
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navCollapse = document.querySelector('.navbar-collapse');

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (navCollapse && navCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     Set active nav link based on current page
     -------------------------------------------------------------------------- */
  function initActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (
        href === currentPage ||
        (currentPage === '' && href === 'index.html') ||
        (currentPage === 'blog-view.html' && href === 'blog.html')
      ) {
        link.classList.add('active');
      }
    });
  }

  /* --------------------------------------------------------------------------
     Scroll-triggered fade-in animations
     -------------------------------------------------------------------------- */
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animatedElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --------------------------------------------------------------------------
     Back to Top button
     -------------------------------------------------------------------------- */
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------------------------
     Course Search & Filter
     -------------------------------------------------------------------------- */
  function initCourseFilter() {
    const searchInput = document.getElementById('courseSearch');
    const categoryFilter = document.getElementById('courseCategory');
    const durationFilter = document.getElementById('courseDuration');
    const courseGrid = document.getElementById('courseGrid');
    const noResults = document.getElementById('noResults');

    if (!courseGrid) return;

    const courseCards = courseGrid.querySelectorAll('.course-card-wrapper');

    function filterCourses() {
      const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const category = categoryFilter ? categoryFilter.value : 'all';
      const duration = durationFilter ? durationFilter.value : 'all';
      let visibleCount = 0;

      courseCards.forEach(function (card) {
        const title = (card.dataset.title || '').toLowerCase();
        const cardCategory = card.dataset.category || '';
        const cardDuration = card.dataset.duration || '';
        const description = (card.dataset.description || '').toLowerCase();

        const matchesSearch =
          !searchTerm ||
          title.includes(searchTerm) ||
          description.includes(searchTerm);

        const matchesCategory = category === 'all' || cardCategory === category;
        const matchesDuration = duration === 'all' || cardDuration === duration;

        if (matchesSearch && matchesCategory && matchesDuration) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      }

      const courseCount = document.getElementById('courseCount');
      if (courseCount) {
        courseCount.textContent = visibleCount + (visibleCount === 1 ? ' Course' : ' Courses');
      }
    }

    if (searchInput) searchInput.addEventListener('input', filterCourses);
    if (categoryFilter) categoryFilter.addEventListener('change', filterCourses);
    if (durationFilter) durationFilter.addEventListener('change', filterCourses);
  }

  /* --------------------------------------------------------------------------
     Form Validation Helper
     -------------------------------------------------------------------------- */
  function validateField(field, rules) {
    const value = field.value.trim();
    let error = '';

    if (rules.required && !value) {
      error = rules.label + ' is required.';
    } else if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Please enter a valid email address.';
    } else if (rules.phone && value && !/^[+]?[\d\s\-()]{7,15}$/.test(value)) {
      error = 'Please enter a valid phone number.';
    } else if (rules.minLength && value.length < rules.minLength) {
      error = rules.label + ' must be at least ' + rules.minLength + ' characters.';
    }

    showFieldError(field, error);
    return !error;
  }

  function showFieldError(field, message) {
    field.classList.toggle('is-invalid', !!message);

    let feedback = field.parentElement.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      field.parentElement.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.style.display = message ? 'block' : 'none';
  }

  function clearFormErrors(form) {
    form.querySelectorAll('.is-invalid').forEach(function (field) {
      field.classList.remove('is-invalid');
    });
    form.querySelectorAll('.invalid-feedback').forEach(function (fb) {
      fb.style.display = 'none';
    });
  }

  /* --------------------------------------------------------------------------
     Enquiry Form (Course Details Page)
     -------------------------------------------------------------------------- */
  function initEnquiryForm() {
    const form = document.getElementById('enquiryForm');
    if (!form) return;

    const fields = {
      enquiryName: { required: true, label: 'Name', minLength: 2 },
      enquiryEmail: { required: true, label: 'Email', email: true },
      enquiryPhone: { required: true, label: 'Phone Number', phone: true },
      enquiryCourse: { required: true, label: 'Course Name' },
      enquiryMessage: { required: true, label: 'Message', minLength: 10 }
    };

    // Real-time validation on blur
    Object.keys(fields).forEach(function (fieldId) {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('blur', function () {
          validateField(field, fields[fieldId]);
        });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFormErrors(form);

      let isValid = true;
      Object.keys(fields).forEach(function (fieldId) {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field, fields[fieldId])) {
          isValid = false;
        }
      });

      if (isValid) {
        const successMsg = document.getElementById('enquirySuccess');
        if (successMsg) {
          successMsg.style.display = 'block';
          form.reset();

          // Re-populate course name from URL param
          const urlParams = new URLSearchParams(window.location.search);
          const courseName = urlParams.get('course');
          const courseField = document.getElementById('enquiryCourse');
          if (courseField && courseName) {
            courseField.value = decodeURIComponent(courseName);
          }

          setTimeout(function () {
            successMsg.style.display = 'none';
          }, 5000);
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     Contact Form
     -------------------------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const fields = {
      contactName: { required: true, label: 'Name', minLength: 2 },
      contactEmail: { required: true, label: 'Email', email: true },
      contactPhone: { required: true, label: 'Phone Number', phone: true },
      contactSubject: { required: true, label: 'Subject' },
      contactMessage: { required: true, label: 'Message', minLength: 10 }
    };

    Object.keys(fields).forEach(function (fieldId) {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('blur', function () {
          validateField(field, fields[fieldId]);
        });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFormErrors(form);

      let isValid = true;
      Object.keys(fields).forEach(function (fieldId) {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field, fields[fieldId])) {
          isValid = false;
        }
      });

      if (isValid) {
        const successMsg = document.getElementById('contactSuccess');
        if (successMsg) {
          successMsg.style.display = 'block';
          form.reset();
          setTimeout(function () {
            successMsg.style.display = 'none';
          }, 5000);
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     Load Course Details from URL parameter
     -------------------------------------------------------------------------- */
  function loadCourseDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    if (!courseId || !window.courseData) return;

    const course = window.courseData[courseId];
    if (!course) return;

    // Populate page elements
    const setText = function (id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    const setHTML = function (id, html) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    document.title = course.title + ' | MLK Tech';

    setText('courseTitle', course.title);
    setText('coursePageTitle', course.title);
    setText('breadcrumbCourse', course.title);
    setText('courseOverview', course.overview);
    setText('courseDuration', course.duration);
    setText('courseMode', course.mode);
    setText('courseFees', course.fees);

    const banner = document.getElementById('courseBanner');
    if (banner) {
      banner.src = course.image;
      banner.alt = course.title;
    }

    const courseField = document.getElementById('enquiryCourse');
    if (courseField) courseField.value = course.title;

    // Syllabus modules
    const syllabusContainer = document.getElementById('syllabusList');
    if (syllabusContainer && course.modules) {
      syllabusContainer.innerHTML = course.modules
        .map(function (mod, index) {
          return (
            '<div class="syllabus-item d-flex align-items-start gap-3 fade-in">' +
            '<div class="module-number">' + (index + 1) + '</div>' +
            '<div><h6 class="mb-1">' + mod.title + '</h6>' +
            '<p class="text-muted mb-0 small">' + mod.description + '</p></div>' +
            '</div>'
          );
        })
        .join('');
    }

    // Benefits
    const benefitsContainer = document.getElementById('benefitsList');
    if (benefitsContainer && course.benefits) {
      benefitsContainer.innerHTML = course.benefits
        .map(function (benefit) {
          return (
            '<div class="benefit-item">' +
            '<i class="bi bi-check-circle-fill"></i>' +
            '<span>' + benefit + '</span></div>'
          );
        })
        .join('');
    }

    // Re-init animations for dynamically added elements
    initScrollAnimations();
  }

  /* --------------------------------------------------------------------------
     Blog Listing with Search, Filter & Pagination
     -------------------------------------------------------------------------- */
  var blogCurrentPage = 1;
  var blogPerPage = 6;

  function initBlogListing() {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid || !window.blogData) return;

    const searchInput = document.getElementById('blogSearch');
    const categoryFilter = document.getElementById('blogCategory');

    function getFilteredBlogs() {
      const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const category = categoryFilter ? categoryFilter.value : 'all';
      const blogs = Object.keys(window.blogData).map(function (id) {
        return Object.assign({ id: id }, window.blogData[id]);
      });

      return blogs.filter(function (blog) {
        const matchesSearch =
          !searchTerm ||
          blog.title.toLowerCase().includes(searchTerm) ||
          blog.excerpt.toLowerCase().includes(searchTerm) ||
          blog.author.toLowerCase().includes(searchTerm);

        const matchesCategory = category === 'all' || blog.category === category;
        return matchesSearch && matchesCategory;
      });
    }

    function renderBlogs() {
      const filtered = getFilteredBlogs();
      const totalPages = Math.ceil(filtered.length / blogPerPage) || 1;

      if (blogCurrentPage > totalPages) blogCurrentPage = totalPages;
      if (blogCurrentPage < 1) blogCurrentPage = 1;

      const start = (blogCurrentPage - 1) * blogPerPage;
      const pageBlogs = filtered.slice(start, start + blogPerPage);

      if (pageBlogs.length === 0) {
        blogGrid.innerHTML =
          '<div class="col-12"><div class="no-results">' +
          '<i class="bi bi-journal-x"></i><h5>No articles found</h5>' +
          '<p>Try adjusting your search or filter criteria.</p></div></div>';
      } else {
        blogGrid.innerHTML = pageBlogs
          .map(function (blog, index) {
            return (
              '<div class="col-md-6 col-lg-4 fade-in delay-' + ((index % 3) + 1) + '">' +
              '<article class="blog-card">' +
              '<div class="blog-img-wrap"><img src="' + blog.image + '" alt="' + blog.title + '" class="blog-img"></div>' +
              '<div class="card-body">' +
              '<div class="blog-card-meta">' +
              '<span class="blog-category">' + blog.category + '</span>' +
              '<span class="blog-date"><i class="bi bi-calendar3"></i> ' + blog.date + '</span>' +
              '</div>' +
              '<h5>' + blog.title + '</h5>' +
              '<p>' + blog.excerpt + '</p>' +
              '<div class="blog-author"><i class="bi bi-person-circle"></i> ' + blog.author + '</div>' +
              '</div>' +
              '<div class="card-footer-custom">' +
              '<a href="blog-view.html?id=' + blog.id + '" class="btn btn-outline-custom btn-sm w-100">Read More <i class="bi bi-arrow-right ms-1"></i></a>' +
              '</div></article></div>'
            );
          })
          .join('');
      }

      renderPagination(totalPages, filtered.length);
      initScrollAnimations();

      const blogCount = document.getElementById('blogCount');
      if (blogCount) {
        blogCount.textContent = filtered.length + (filtered.length === 1 ? ' Article' : ' Articles');
      }
    }

    function renderPagination(totalPages, totalItems) {
      const paginationEl = document.getElementById('blogPagination');
      if (!paginationEl) return;

      if (totalItems === 0) {
        paginationEl.innerHTML = '';
        return;
      }

      let html = '';

      html +=
        '<button class="page-btn nav-btn' +
        (blogCurrentPage === 1 ? ' disabled' : '') +
        '" data-page="prev" ' +
        (blogCurrentPage === 1 ? 'disabled' : '') +
        '><i class="bi bi-chevron-left"></i> Prev</button>';

      for (var i = 1; i <= totalPages; i++) {
        html +=
          '<button class="page-btn' +
          (i === blogCurrentPage ? ' active' : '') +
          '" data-page="' +
          i +
          '">' +
          i +
          '</button>';
      }

      html +=
        '<button class="page-btn nav-btn' +
        (blogCurrentPage === totalPages ? ' disabled' : '') +
        '" data-page="next" ' +
        (blogCurrentPage === totalPages ? ' disabled' : '') +
        '><i class="bi bi-chevron-right"></i> Next</button>';

      paginationEl.innerHTML = html;

      paginationEl.querySelectorAll('.page-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (btn.classList.contains('disabled')) return;

          const page = btn.dataset.page;
          if (page === 'prev') blogCurrentPage--;
          else if (page === 'next') blogCurrentPage++;
          else blogCurrentPage = parseInt(page, 10);

          renderBlogs();
          document.getElementById('blogGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        blogCurrentPage = 1;
        renderBlogs();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', function () {
        blogCurrentPage = 1;
        renderBlogs();
      });
    }

    renderBlogs();
  }

  /* --------------------------------------------------------------------------
     Load Blog Details from URL parameter
     -------------------------------------------------------------------------- */
  function loadBlogDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');

    if (!blogId || !window.blogData) return;

    const blog = window.blogData[blogId];
    if (!blog) return;

    const setText = function (id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    document.title = blog.title + ' | MLK Tech Blog';

    setText('blogPageTitle', blog.title);
    setText('blogTitle', blog.title);
    setText('breadcrumbBlog', blog.title);
    setText('blogAuthor', blog.author);
    setText('blogDate', blog.date);
    setText('blogCategory', blog.category);

    const banner = document.getElementById('blogBanner');
    if (banner) {
      banner.src = blog.image;
      banner.alt = blog.title;
    }

    const contentEl = document.getElementById('blogContent');
    if (contentEl && blog.content) {
      contentEl.innerHTML = blog.content;
    }

    // Recent blogs sidebar (exclude current)
    const recentContainer = document.getElementById('recentBlogs');
    if (recentContainer) {
      const recent = Object.keys(window.blogData)
        .filter(function (id) { return id !== blogId; })
        .slice(0, 4)
        .map(function (id) {
          return Object.assign({ id: id }, window.blogData[id]);
        });

      recentContainer.innerHTML = recent
        .map(function (b) {
          return (
            '<div class="recent-blog-item">' +
            '<img src="' + b.image + '" alt="' + b.title + '">' +
            '<div><h6><a href="blog-view.html?id=' + b.id + '">' + b.title + '</a></h6>' +
            '<span class="recent-date"><i class="bi bi-calendar3"></i> ' + b.date + '</span></div></div>'
          );
        })
        .join('');
    }

    // Related blogs (same category first, fallback to recent)
    const relatedContainer = document.getElementById('relatedBlogs');
    if (relatedContainer) {
      let related = Object.keys(window.blogData)
        .filter(function (id) {
          return id !== blogId && window.blogData[id].category === blog.category;
        })
        .slice(0, 3)
        .map(function (id) {
          return Object.assign({ id: id }, window.blogData[id]);
        });

      if (related.length === 0) {
        related = Object.keys(window.blogData)
          .filter(function (id) { return id !== blogId; })
          .slice(0, 3)
          .map(function (id) {
            return Object.assign({ id: id }, window.blogData[id]);
          });
      }

      if (related.length === 0) {
        relatedContainer.closest('.related-section').style.display = 'none';
      } else {
        relatedContainer.innerHTML = related
          .map(function (b) {
            return (
              '<div class="col-md-4 fade-in">' +
              '<article class="related-blog-card">' +
              '<img src="' + b.image + '" alt="' + b.title + '">' +
              '<div class="card-body">' +
              '<span class="blog-category mb-2 d-inline-block">' + b.category + '</span>' +
              '<h6><a href="blog-view.html?id=' + b.id + '" class="text-decoration-none text-dark">' + b.title + '</a></h6>' +
              '<span class="recent-date"><i class="bi bi-calendar3"></i> ' + b.date + '</span>' +
              '</div></article></div>'
            );
          })
          .join('');
      }
    }

    initScrollAnimations();
  }

  /* --------------------------------------------------------------------------
     Share Buttons
     -------------------------------------------------------------------------- */
  function initShareButtons() {
    const copyBtn = document.getElementById('copyLinkBtn');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(function () {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
        setTimeout(function () {
          copyBtn.innerHTML = originalHTML;
        }, 2000);
      });
    });
  }

  /* --------------------------------------------------------------------------
     Comment Form (Blog View Page)
     -------------------------------------------------------------------------- */
  function initCommentForm() {
    const form = document.getElementById('commentForm');
    if (!form) return;

    const fields = {
      commentName: { required: true, label: 'Name', minLength: 2 },
      commentEmail: { required: true, label: 'Email', email: true },
      commentText: { required: true, label: 'Comment', minLength: 10 }
    };

    Object.keys(fields).forEach(function (fieldId) {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('blur', function () {
          validateField(field, fields[fieldId]);
        });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFormErrors(form);

      let isValid = true;
      Object.keys(fields).forEach(function (fieldId) {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field, fields[fieldId])) {
          isValid = false;
        }
      });

      if (isValid) {
        const successMsg = document.getElementById('commentSuccess');
        if (successMsg) {
          successMsg.style.display = 'block';
          form.reset();
          setTimeout(function () {
            successMsg.style.display = 'none';
          }, 5000);
        }
      }
    });
  }
})();

/* --------------------------------------------------------------------------
   Course Data (used by course-details.html)
   -------------------------------------------------------------------------- */
window.courseData = {
  'web-development': {
    title: 'Full Stack Web Development',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    overview:
      'Master modern web development with HTML, CSS, JavaScript, React, Node.js, and databases. Build real-world projects and launch your career as a full stack developer.',
    duration: '6 Months',
    mode: 'Online & Offline',
    fees: '₹45,000',
    modules: [
      { title: 'HTML5 & CSS3 Fundamentals', description: 'Semantic markup, responsive design, Flexbox, and Grid layouts.' },
      { title: 'JavaScript & ES6+', description: 'Core JS concepts, DOM manipulation, async programming, and APIs.' },
      { title: 'React.js Frontend', description: 'Components, hooks, state management, routing, and project building.' },
      { title: 'Node.js & Express', description: 'Server-side development, REST APIs, authentication, and middleware.' },
      { title: 'Database Management', description: 'MongoDB and SQL fundamentals, data modeling, and queries.' },
      { title: 'Capstone Project', description: 'Build and deploy a full stack application from scratch.' }
    ],
    benefits: [
      'Industry-recognized certificate upon completion',
      'Hands-on projects for your portfolio',
      '1-on-1 mentorship sessions',
      'Placement assistance with partner companies',
      'Lifetime access to course materials'
    ]
  },
  'mobile-development': {
    title: 'Mobile App Development',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    overview:
      'Learn to build cross-platform mobile applications using React Native and Flutter. Create stunning apps for iOS and Android from a single codebase.',
    duration: '5 Months',
    mode: 'Online & Offline',
    fees: '₹40,000',
    modules: [
      { title: 'Mobile Development Basics', description: 'Introduction to mobile ecosystems, UI/UX principles for mobile.' },
      { title: 'React Native Fundamentals', description: 'Components, navigation, styling, and state management.' },
      { title: 'Flutter & Dart', description: 'Widget-based UI, animations, and platform-specific features.' },
      { title: 'API Integration', description: 'Connecting apps to backend services, authentication, and data sync.' },
      { title: 'App Deployment', description: 'Publishing to App Store and Google Play, CI/CD pipelines.' },
      { title: 'Final Project', description: 'Design, develop, and publish a complete mobile application.' }
    ],
    benefits: [
      'Build apps for both iOS and Android',
      'Real device testing and debugging skills',
      'App Store publishing guidance',
      'Portfolio-ready mobile projects',
      'Job interview preparation'
    ]
  },
  'data-science': {
    title: 'Data Science & Analytics',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    overview:
      'Dive into data science with Python, statistics, machine learning, and data visualization. Transform raw data into actionable business insights.',
    duration: '6 Months',
    mode: 'Online',
    fees: '₹50,000',
    modules: [
      { title: 'Python for Data Science', description: 'NumPy, Pandas, data cleaning, and exploratory analysis.' },
      { title: 'Statistics & Probability', description: 'Descriptive stats, hypothesis testing, and probability distributions.' },
      { title: 'Data Visualization', description: 'Matplotlib, Seaborn, Plotly, and dashboard creation.' },
      { title: 'Machine Learning', description: 'Supervised and unsupervised learning, model evaluation.' },
      { title: 'Deep Learning Basics', description: 'Neural networks, TensorFlow, and image classification.' },
      { title: 'Industry Project', description: 'End-to-end data science project with real business data.' }
    ],
    benefits: [
      'Work with real-world datasets',
      'Kaggle competition participation',
      'Python & ML toolkit mastery',
      'Data analyst career pathway',
      'Certificate from MLK Tech'
    ]
  },
  'ai-ml': {
    title: 'AI & Machine Learning',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    overview:
      'Explore artificial intelligence and machine learning from fundamentals to advanced applications. Build intelligent systems using cutting-edge tools and frameworks.',
    duration: '8 Months',
    mode: 'Online & Offline',
    fees: '₹55,000',
    modules: [
      { title: 'AI Foundations', description: 'History of AI, types of AI, and ethical considerations.' },
      { title: 'Machine Learning Algorithms', description: 'Regression, classification, clustering, and ensemble methods.' },
      { title: 'Deep Learning', description: 'CNNs, RNNs, transformers, and transfer learning.' },
      { title: 'Natural Language Processing', description: 'Text processing, sentiment analysis, and language models.' },
      { title: 'Computer Vision', description: 'Image processing, object detection, and facial recognition.' },
      { title: 'AI Project Lab', description: 'Build and deploy an AI-powered application.' }
    ],
    benefits: [
      'Cutting-edge AI curriculum',
      'GPU cloud lab access',
      'Research paper discussions',
      'AI startup mentorship',
      'Industry expert guest lectures'
    ]
  },
  'cloud-computing': {
    title: 'Cloud Computing (AWS & Azure)',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    overview:
      'Become a cloud expert with hands-on training in AWS and Microsoft Azure. Learn to architect, deploy, and manage scalable cloud solutions.',
    duration: '4 Months',
    mode: 'Online',
    fees: '₹35,000',
    modules: [
      { title: 'Cloud Fundamentals', description: 'IaaS, PaaS, SaaS models, virtualization, and cloud economics.' },
      { title: 'AWS Core Services', description: 'EC2, S3, RDS, Lambda, VPC, and IAM configuration.' },
      { title: 'Microsoft Azure', description: 'Virtual machines, App Services, Azure SQL, and Active Directory.' },
      { title: 'DevOps & CI/CD', description: 'Docker, Kubernetes, Jenkins, and automated deployments.' },
      { title: 'Cloud Security', description: 'Identity management, encryption, compliance, and monitoring.' },
      { title: 'Certification Prep', description: 'AWS Solutions Architect and Azure Administrator exam preparation.' }
    ],
    benefits: [
      'AWS & Azure dual certification prep',
      'Free tier lab environment',
      'Cloud architecture portfolio',
      'DevOps pipeline experience',
      'High-demand skill certification'
    ]
  },
  'digital-marketing': {
    title: 'Digital Marketing Mastery',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    overview:
      'Learn SEO, social media marketing, Google Ads, content strategy, and analytics. Drive business growth through data-driven digital marketing campaigns.',
    duration: '3 Months',
    mode: 'Online & Offline',
    fees: '₹25,000',
    modules: [
      { title: 'Digital Marketing Landscape', description: 'Channels, funnels, customer journey, and strategy planning.' },
      { title: 'SEO & Content Marketing', description: 'Keyword research, on-page SEO, link building, and content creation.' },
      { title: 'Social Media Marketing', description: 'Platform strategies for Instagram, LinkedIn, Facebook, and Twitter.' },
      { title: 'Paid Advertising', description: 'Google Ads, Facebook Ads, campaign optimization, and ROI tracking.' },
      { title: 'Analytics & Reporting', description: 'Google Analytics, data interpretation, and performance dashboards.' },
      { title: 'Live Campaign Project', description: 'Plan and execute a real digital marketing campaign.' }
    ],
    benefits: [
      'Google Ads & Analytics certified',
      'Live campaign management experience',
      'Personal branding strategies',
      'Freelancing toolkit included',
      'Marketing portfolio creation'
    ]
  },
  'cybersecurity': {
    title: 'Cybersecurity Fundamentals',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    overview:
      'Protect organizations from cyber threats. Learn ethical hacking, network security, cryptography, and incident response in this comprehensive program.',
    duration: '5 Months',
    mode: 'Online & Offline',
    fees: '₹42,000',
    modules: [
      { title: 'Security Foundations', description: 'CIA triad, threat landscape, risk assessment, and compliance.' },
      { title: 'Network Security', description: 'Firewalls, VPNs, intrusion detection, and secure architectures.' },
      { title: 'Ethical Hacking', description: 'Penetration testing, vulnerability assessment, and exploit mitigation.' },
      { title: 'Cryptography', description: 'Encryption algorithms, PKI, digital signatures, and secure communication.' },
      { title: 'Incident Response', description: 'Detection, containment, eradication, and recovery procedures.' },
      { title: 'Security Lab Project', description: 'Conduct a full security audit on a simulated enterprise network.' }
    ],
    benefits: [
      'Hands-on hacking lab environment',
      'CEH exam preparation included',
      'Security audit experience',
      'Incident response playbook',
      'Growing field career support'
    ]
  },
  'ui-ux-design': {
    title: 'UI/UX Design Professional',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    overview:
      'Create beautiful, user-centered digital experiences. Master design thinking, wireframing, prototyping, and usability testing with industry-standard tools.',
    duration: '4 Months',
    mode: 'Online & Offline',
    fees: '₹30,000',
    modules: [
      { title: 'Design Thinking', description: 'User research, personas, journey mapping, and problem framing.' },
      { title: 'UI Design Principles', description: 'Typography, color theory, layout, and visual hierarchy.' },
      { title: 'Wireframing & Prototyping', description: 'Figma, Adobe XD, low-fi and high-fi prototypes.' },
      { title: 'Interaction Design', description: 'Micro-interactions, animations, and responsive design patterns.' },
      { title: 'Usability Testing', description: 'Test planning, user sessions, heuristic evaluation, and iteration.' },
      { title: 'Design Portfolio', description: 'Create a professional case study portfolio for job applications.' }
    ],
    benefits: [
      'Figma & Adobe XD proficiency',
      'Professional design portfolio',
      'User research methodology',
      'Design system creation skills',
      'Creative industry networking'
    ]
  }
};

/* --------------------------------------------------------------------------
   Blog Data (used by blog.html & blog-view.html)
   -------------------------------------------------------------------------- */
window.blogData = {
  'future-of-ai-2026': {
    title: 'The Future of AI in 2026: Trends Every Business Should Know',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    category: 'AI & ML',
    date: 'May 28, 2026',
    author: 'Lakshmi Devi',
    excerpt: 'Discover the top AI trends shaping industries in 2026, from generative AI to autonomous systems and ethical AI governance.',
    content:
      '<p>Artificial intelligence continues to reshape how businesses operate, compete, and innovate. As we move through 2026, several key trends are emerging that every organization should understand and prepare for.</p>' +
      '<h3>Generative AI Goes Enterprise</h3>' +
      '<p>Generative AI has moved beyond experimentation into production. Companies are deploying custom large language models trained on proprietary data, enabling secure, domain-specific AI assistants that boost productivity across departments.</p>' +
      '<h3>AI-Powered Automation</h3>' +
      '<p>From customer service chatbots to automated code generation, AI-driven automation is reducing operational costs while improving accuracy. Businesses that integrate these tools early gain a significant competitive advantage.</p>' +
      '<blockquote>"The companies that thrive in 2026 won\'t be those with the most AI tools, but those that integrate AI most thoughtfully into their workflows."</blockquote>' +
      '<h3>Ethical AI & Governance</h3>' +
      '<p>With increased AI adoption comes greater responsibility. Organizations are investing in AI governance frameworks, bias detection tools, and transparent model documentation to build trust with customers and regulators.</p>' +
      '<ul><li>Establish clear AI usage policies</li><li>Invest in employee AI literacy training</li><li>Partner with experts for responsible AI deployment</li><li>Monitor AI outputs for bias and accuracy</li></ul>' +
      '<p>At MLK Tech, we help businesses navigate this AI revolution with tailored solutions and training programs designed for the modern enterprise.</p>'
  },
  'react-vs-angular-2026': {
    title: 'React vs Angular in 2026: Which Framework Should You Learn?',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    category: 'Web Development',
    date: 'May 22, 2026',
    author: 'Karthik Rajan',
    excerpt: 'A comprehensive comparison of React and Angular to help developers and students choose the right frontend framework for their career goals.',
    content:
      '<p>Choosing between React and Angular remains one of the most common dilemmas for aspiring web developers. Both frameworks power millions of applications worldwide, but they serve different needs and learning styles.</p>' +
      '<h3>React: Flexibility & Ecosystem</h3>' +
      '<p>React\'s component-based architecture and vast ecosystem make it ideal for developers who prefer flexibility. With React 19\'s server components and improved concurrent rendering, it continues to dominate the job market.</p>' +
      '<h3>Angular: Structure & Enterprise</h3>' +
      '<p>Angular provides a complete, opinionated framework with built-in routing, forms, and HTTP client. It\'s the go-to choice for large enterprise applications where consistency and maintainability are paramount.</p>' +
      '<h3>Our Recommendation</h3>' +
      '<p>For beginners seeking quick job placement, React offers a gentler learning curve and more entry-level positions. For those targeting enterprise roles at large corporations, Angular provides a robust skill set that employers value highly.</p>' +
      '<p>At MLK Tech, our Full Stack Web Development course covers both frameworks, giving you the versatility to adapt to any project requirement.</p>'
  },
  'cloud-migration-guide': {
    title: 'A Complete Guide to Cloud Migration for Small Businesses',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    category: 'Cloud',
    date: 'May 15, 2026',
    author: 'Mohan Kumar',
    excerpt: 'Step-by-step guide to migrating your business to the cloud without downtime, data loss, or budget overruns.',
    content:
      '<p>Cloud migration is no longer optional for businesses that want to remain competitive. This guide walks you through a proven migration strategy that minimizes risk and maximizes ROI.</p>' +
      '<h3>Step 1: Assessment & Planning</h3>' +
      '<p>Begin by auditing your current infrastructure, identifying workloads suitable for migration, and defining clear success metrics. Not every application needs to move to the cloud immediately.</p>' +
      '<h3>Step 2: Choose Your Cloud Provider</h3>' +
      '<p>AWS, Azure, and Google Cloud each have strengths. AWS leads in breadth of services, Azure integrates well with Microsoft ecosystems, and GCP excels in data analytics and machine learning.</p>' +
      '<h3>Step 3: Execute the Migration</h3>' +
      '<p>Follow the 6 Rs framework: Rehost, Replatform, Repurchase, Refactor, Retire, and Retain. Start with low-risk workloads to build confidence and expertise.</p>' +
      '<ol><li>Rehost legacy applications first</li><li>Replatform databases and middleware</li><li>Refactor critical applications for cloud-native architecture</li><li>Decommission retired systems</li></ol>' +
      '<p>MLK Tech\'s Cloud Computing course provides hands-on experience with AWS and Azure, preparing you to lead migration projects confidently.</p>'
  },
  'top-tech-careers-2026': {
    title: 'Top 10 Tech Careers in 2026 with Highest Salary Potential',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
    category: 'Career',
    date: 'May 10, 2026',
    author: 'Anitha Suresh',
    excerpt: 'Explore the most in-demand tech careers in 2026, average salaries, required skills, and how to break into each field.',
    content:
      '<p>The technology job market in 2026 offers incredible opportunities for skilled professionals. Here are the top careers ranked by demand and compensation potential.</p>' +
      '<h3>1. AI/ML Engineer</h3><p>Designing and deploying machine learning models. Average salary: ₹18-35 LPA.</p>' +
      '<h3>2. Cloud Architect</h3><p>Designing scalable cloud infrastructure. Average salary: ₹20-40 LPA.</p>' +
      '<h3>3. Full Stack Developer</h3><p>Building end-to-end web applications. Average salary: ₹8-18 LPA.</p>' +
      '<h3>4. Cybersecurity Analyst</h3><p>Protecting organizations from cyber threats. Average salary: ₹10-22 LPA.</p>' +
      '<h3>5. Data Scientist</h3><p>Extracting insights from complex datasets. Average salary: ₹12-25 LPA.</p>' +
      '<blockquote>Investing in the right skills today positions you for the opportunities of tomorrow.</blockquote>' +
      '<p>MLK Tech offers specialized courses for each of these career paths, with placement support to help you land your dream role.</p>'
  },
  'ui-design-trends-2026': {
    title: 'UI Design Trends Shaping Digital Experiences in 2026',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    category: 'Design',
    date: 'May 5, 2026',
    author: 'Priya Sharma',
    excerpt: 'From glassmorphism to AI-assisted design, explore the UI trends creating stunning digital experiences this year.',
    content:
      '<p>User interface design continues to evolve rapidly. Staying current with design trends helps create products that feel modern, intuitive, and delightful to use.</p>' +
      '<h3>Soft Gradients & Light Themes</h3>' +
      '<p>Clean white-based designs with soft linear gradients are dominating 2026. Brands are moving away from dark themes toward airy, accessible interfaces that feel premium and welcoming.</p>' +
      '<h3>Micro-Interactions</h3>' +
      '<p>Subtle animations on hover, scroll, and click provide feedback that makes interfaces feel alive and responsive without overwhelming users.</p>' +
      '<h3>AI-Assisted Design Workflows</h3>' +
      '<p>Designers are leveraging AI tools for rapid prototyping, asset generation, and accessibility checking, dramatically speeding up the design process.</p>' +
      '<p>Learn to create trend-forward designs in our UI/UX Design Professional course at MLK Tech.</p>'
  },
  'cybersecurity-small-business': {
    title: 'Cybersecurity Essentials Every Small Business Must Implement',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    category: 'Security',
    date: 'April 28, 2026',
    author: 'Arun Menon',
    excerpt: 'Protect your business from cyber threats with these essential security practices that don\'t require an enterprise budget.',
    content:
      '<p>Small businesses are increasingly targeted by cybercriminals, yet many lack basic security measures. Implementing these essentials can prevent costly breaches.</p>' +
      '<h3>Multi-Factor Authentication (MFA)</h3>' +
      '<p>Enable MFA on all business accounts, especially email, cloud services, and financial platforms. This single step prevents the majority of account compromises.</p>' +
      '<h3>Employee Security Training</h3>' +
      '<p>Human error causes 95% of security breaches. Regular phishing awareness training and security best practices education are essential investments.</p>' +
      '<h3>Regular Backups & Updates</h3>' +
      '<p>Automate system updates and maintain encrypted, offsite backups. Test your recovery process quarterly to ensure business continuity.</p>' +
      '<ul><li>Use a business-grade firewall</li><li>Encrypt sensitive data at rest and in transit</li><li>Create an incident response plan</li><li>Conduct annual security audits</li></ul>' +
      '<p>MLK Tech\'s Cybersecurity course equips professionals with the skills to protect organizations of any size.</p>'
  },
  'digital-marketing-strategies': {
    title: '5 Digital Marketing Strategies That Actually Work in 2026',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    category: 'Marketing',
    date: 'April 20, 2026',
    author: 'Rajesh Kumar',
    excerpt: 'Cut through the noise with proven digital marketing strategies that deliver measurable ROI for startups and growing businesses.',
    content:
      '<p>Digital marketing in 2026 requires a strategic, data-driven approach. Here are five strategies that consistently deliver results for our clients at MLK Tech.</p>' +
      '<h3>1. Content-Led SEO</h3>' +
      '<p>Create comprehensive, helpful content that answers your audience\'s questions. Google\'s algorithms increasingly reward expertise and user satisfaction.</p>' +
      '<h3>2. Video-First Social Media</h3>' +
      '<p>Short-form video on Instagram Reels, YouTube Shorts, and LinkedIn drives the highest engagement rates across all demographics.</p>' +
      '<h3>3. Email Automation</h3>' +
      '<p>Personalized email sequences based on user behavior convert 3x better than batch-and-blast campaigns.</p>' +
      '<h3>4. Performance Marketing</h3>' +
      '<p>Google Ads and Meta Ads with precise targeting and continuous A/B testing ensure every rupee spent drives measurable results.</p>' +
      '<h3>5. Community Building</h3>' +
      '<p>Building engaged communities around your brand creates loyal customers who become your best advocates.</p>' +
      '<p>Master these strategies in our Digital Marketing Mastery course.</p>'
  },
  'python-for-beginners': {
    title: 'Why Python Is Still the Best Programming Language for Beginners',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    category: 'Technology',
    date: 'April 12, 2026',
    author: 'Karthik Rajan',
    excerpt: 'Python remains the top choice for programming beginners in 2026. Here\'s why it\'s the perfect first language to learn.',
    content:
      '<p>With dozens of programming languages available, Python continues to be the most recommended language for beginners — and for good reason.</p>' +
      '<h3>Readable Syntax</h3>' +
      '<p>Python\'s clean, English-like syntax lets beginners focus on programming concepts rather than complex syntax rules. You can write meaningful programs from day one.</p>' +
      '<h3>Versatile Applications</h3>' +
      '<p>Python powers web development, data science, AI, automation, game development, and more. Learning Python opens doors to virtually every tech career path.</p>' +
      '<h3>Massive Community & Resources</h3>' +
      '<p>With millions of developers worldwide, Python offers unparalleled learning resources, libraries, and community support for learners at every level.</p>' +
      '<blockquote>Python isn\'t just a language — it\'s a gateway to the entire technology ecosystem.</blockquote>' +
      '<p>Start your Python journey through our Data Science or AI & Machine Learning courses at MLK Tech.</p>'
  },
  'remote-work-productivity': {
    title: 'Remote Work Productivity Tips for Tech Professionals',
    image: 'https://images.unsplash.com/photo-1587825140708-28731217645b?w=800&q=80',
    category: 'Career',
    date: 'April 5, 2026',
    author: 'Anitha Suresh',
    excerpt: 'Practical productivity strategies for tech professionals working remotely, from time management to maintaining work-life balance.',
    content:
      '<p>Remote work has become the norm in tech, but staying productive outside a traditional office requires intentional habits and the right tools.</p>' +
      '<h3>Create a Dedicated Workspace</h3>' +
      '<p>A consistent workspace signals your brain that it\'s time to focus. Invest in a comfortable chair, good lighting, and minimal distractions.</p>' +
      '<h3>Time Blocking & Deep Work</h3>' +
      '<p>Schedule focused coding or design sessions without interruptions. Use techniques like Pomodoro (25-minute focused sprints) to maintain concentration.</p>' +
      '<h3>Communication Boundaries</h3>' +
      '<p>Set clear availability hours and use async communication tools effectively. Not every message needs an immediate response.</p>' +
      '<h3>Continuous Learning</h3>' +
      '<p>Use saved commute time for skill development. Online courses and side projects keep your skills sharp and career trajectory upward.</p>' +
      '<p>MLK Tech\'s flexible online courses are designed for working professionals who want to upskill without leaving their current roles.</p>'
  }
};

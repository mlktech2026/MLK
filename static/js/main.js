/**
 * MLK Tech - Main JavaScript (Flask version)
 * UI animations, navbar, form client-side validation
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initScrollAnimations();
    initBackToTop();
    initClientValidation();
    initShareButtons();
    initCommentForm();
  });

  function initNavbar() {
    var navbar = document.querySelector('.navbar-custom');
    if (!navbar) return;

    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    var navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    var navCollapse = document.querySelector('.navbar-collapse');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (navCollapse && navCollapse.classList.contains('show')) {
          var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }

  function initScrollAnimations() {
    var els = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function showFieldError(field, message) {
    field.classList.toggle('is-invalid', !!message);
    var feedback = field.parentElement.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      field.parentElement.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.style.display = message ? 'block' : 'none';
  }

  function validateField(field, rules) {
    var value = field.value.trim();
    var error = '';

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

  function initClientValidation() {
    // Enquiry form - validate before server submit
    var enquiryForm = document.getElementById('enquiryForm');
    if (enquiryForm) {
      var eFields = {
        name: { required: true, label: 'Name', minLength: 2 },
        email: { required: true, label: 'Email', email: true },
        phone: { required: true, label: 'Phone Number', phone: true },
        message: { required: true, label: 'Message', minLength: 10 }
      };
      enquiryForm.addEventListener('submit', function (e) {
        var valid = true;
        Object.keys(eFields).forEach(function (key) {
          var field = enquiryForm.querySelector('[name="' + key + '"]');
          if (field && !validateField(field, eFields[key])) valid = false;
        });
        if (!valid) e.preventDefault();
      });
    }

    // Contact form
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
      var cFields = {
        name: { required: true, label: 'Name', minLength: 2 },
        email: { required: true, label: 'Email', email: true },
        phone: { required: true, label: 'Phone Number', phone: true },
        subject: { required: true, label: 'Subject' },
        message: { required: true, label: 'Message', minLength: 10 }
      };
      contactForm.addEventListener('submit', function (e) {
        var valid = true;
        Object.keys(cFields).forEach(function (key) {
          var field = contactForm.querySelector('[name="' + key + '"]');
          if (field && !validateField(field, cFields[key])) valid = false;
        });
        if (!valid) e.preventDefault();
      });
    }
  }

  function initShareButtons() {
    var copyBtn = document.getElementById('copyLinkBtn');
    if (!copyBtn) return;
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(function () {
        var orig = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
        setTimeout(function () { copyBtn.innerHTML = orig; }, 2000);
      });
    });
  }

  function initCommentForm() {
    var form = document.getElementById('commentForm');
    if (!form) return;

    var fields = {
      commentName: { required: true, label: 'Name', minLength: 2 },
      commentEmail: { required: true, label: 'Email', email: true },
      commentText: { required: true, label: 'Comment', minLength: 10 }
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      Object.keys(fields).forEach(function (id) {
        var field = document.getElementById(id);
        if (field && !validateField(field, fields[id])) valid = false;
      });
      if (valid) {
        var success = document.getElementById('commentSuccess');
        if (success) {
          success.style.display = 'block';
          form.reset();
          setTimeout(function () { success.style.display = 'none'; }, 5000);
        }
      }
    });
  }
})();

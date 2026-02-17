// ====== FAQ Accordion Toggle ======
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    
    // Close all other answers
    document.querySelectorAll('.faq-answer').forEach(ans => {
      if (ans !== answer) {
        ans.style.maxHeight = null;
      }
    });
    
    // Toggle current answer
    if (answer.style.maxHeight) {
      answer.style.maxHeight = null;
    } else {
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

// ====== Star Rating ======
const stars = document.querySelectorAll('#starRating .star');
const ratingInput = document.getElementById('ratingValue');

stars.forEach(star => {
  star.addEventListener('mouseover', () => {
    const val = star.dataset.value;
    highlightStars(val);
  });

  star.addEventListener('mouseout', () => {
    highlightStars(ratingInput.value);
  });

  star.addEventListener('click', () => {
    ratingInput.value = star.dataset.value;
    highlightStars(ratingInput.value);
  });
});

function highlightStars(rating) {
  stars.forEach(star => {
    if (star.dataset.value <= rating) {
      star.style.color = 'gold';
    } else {
      star.style.color = '#ccc';
    }
  });
}

// ====== Feedback Form Submission ======
const feedbackForm = document.getElementById('feedback');
const popup = document.getElementById('popup');

feedbackForm?.addEventListener('submit', async function (e) {
  e.preventDefault(); // Prevent page reload

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('mail');
  const messageInput = document.getElementById('FeedbackText');
  const ratingInput = document.getElementById('ratingValue');

  if (!nameInput || !emailInput || !messageInput) return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();
  const rating = ratingInput?.value ?? '0';

  if (!name) {
    alert('Please enter your full name.');
    nameInput.focus();
    return;
  }

  if (!email) {
    alert('Please enter your email address.');
    emailInput.focus();
    return;
  }

  if (!emailInput.checkValidity()) {
    alert('Please enter a valid email address.');
    emailInput.focus();
    return;
  }

  if (!message) {
    alert('Please enter your message.');
    messageInput.focus();
    return;
  }

  if (!this.checkValidity()) return;

  const submitBtn = this.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const endpoint =
      window.location.protocol === 'file:' ||
      ((window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1') &&
        window.location.port !== '5000')
        ? 'http://localhost:5000/submit-feedback'
        : '/submit-feedback';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message, rating }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.status !== 'success') {
      throw new Error(result.error || `Server error (${response.status})`);
    }

    if (popup) {
      popup.textContent = 'Message sent successfully.';
      popup.style.color = 'green';
      popup.style.display = 'block';
    }
    alert('Message sent successfully.');

    this.reset();
    highlightStars(0);

    setTimeout(() => {
      if (popup) popup.style.display = 'none';
    }, 3000);
  } catch (err) {
    console.error(err);

    const isNetworkError = err instanceof TypeError;
    const errorMessage = isNetworkError
      ? 'Cannot connect to the server. Start the backend on http://localhost:5000.'
      : err?.message || 'Failed to send. Please try again later.';

    if (popup) {
      popup.textContent = errorMessage;
      popup.style.color = 'red';
      popup.style.display = 'block';
    }
    alert(errorMessage);

    setTimeout(() => {
      if (popup) popup.style.display = 'none';
    }, 4000);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

// ====== Scroll Reveal Animation ======
const navLinkCandidates = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
const navLinks = navLinkCandidates.filter(link => {
  const hash = link.getAttribute('href');
  if (!hash || hash === '#') return false;

  return Boolean(document.querySelector(hash));
});
const navSections = navLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

let activeNavLink = null;
let activeNavIndex = -1;
const leavingTimers = new WeakMap();

function setActiveNavLink(nextLink) {
  if (!nextLink || nextLink === activeNavLink) return;

  if (activeNavLink) {
    const prevLink = activeNavLink;
    prevLink.classList.remove('active');
    prevLink.removeAttribute('aria-current');
    prevLink.classList.add('leaving');

    const existingTimer = leavingTimers.get(prevLink);
    if (existingTimer) window.clearTimeout(existingTimer);

    const timerId = window.setTimeout(() => {
      prevLink.classList.remove('leaving');
      leavingTimers.delete(prevLink);
    }, 450);

    leavingTimers.set(prevLink, timerId);
  }

  nextLink.classList.remove('leaving');
  nextLink.classList.add('active');
  nextLink.setAttribute('aria-current', 'page');
  activeNavLink = nextLink;
}

function handleNavScrollSpy() {
  if (!navLinks.length || !navSections.length) return;

  const spyY = Math.min(Math.max(window.innerHeight * 0.33, 140), 260);
  let nextIndex = 0;

  navSections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= spyY) nextIndex = i;
  });

  if (nextIndex !== activeNavIndex) {
    activeNavIndex = nextIndex;
    setActiveNavLink(navLinks[nextIndex]);
  }
}

function handleScrollReveal() {
  const enterOffset = 50;
  const exitOffset = Math.min(window.innerHeight * 0.15, 120);

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    const isVisible =
      rect.top < window.innerHeight - enterOffset && rect.bottom > exitOffset;

    if (isVisible) {
      const wasActive = el.classList.contains('active');
      el.classList.add('active');

      if (!wasActive && el.classList.contains('skill-bars')) {
        el.querySelectorAll('.progress-line span[data-percent]').forEach(bar => {
          bar.style.width = '0%';
        });

        requestAnimationFrame(() => {
          el.querySelectorAll('.progress-line span[data-percent]').forEach(bar => {
            const percent = bar.dataset.percent;
            if (!percent) return;

            bar.style.width = `${percent}%`;

            const label = bar.closest('.bar')?.querySelector('.info span:last-child');
            if (label && !label.textContent.trim()) {
              label.textContent = `${percent}%`;
            }
          });
        });
      }
    } else {
      el.classList.remove('active');

      if (el.classList.contains('skill-bars')) {
        el.querySelectorAll('.progress-line span[data-percent]').forEach(bar => {
          bar.style.width = '0%';
        });
      }
    }
  });

  handleNavScrollSpy();
}

navLinks.forEach(link => {
  link.addEventListener('click', () => setActiveNavLink(link));
});

window.addEventListener('scroll', handleScrollReveal, { passive: true });
window.addEventListener('load', handleScrollReveal);
handleScrollReveal();

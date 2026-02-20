document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    
    document.querySelectorAll('.faq-answer').forEach(ans => {
      if (ans !== answer) {
        ans.style.maxHeight = null;
      }
    });
    
    if (answer.style.maxHeight) {
      answer.style.maxHeight = null;
    } else {
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

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

const feedbackForm = document.getElementById('feedback');
const formStatus = document.getElementById('formStatus');
const CONTACT_EMAIL = 'tejtech2604@gmail.com';

function setFormStatus(message = '', status = '') {
  if (!formStatus) return;
  formStatus.textContent = message;
  if (status) formStatus.dataset.status = status;
  else delete formStatus.dataset.status;
}

function setInputError(input, hasError) {
  if (!input) return;
  input.classList.toggle('input-error', hasError);
  if (hasError) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

feedbackForm?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('mail');
  const messageInput = document.getElementById('FeedbackText');
  const ratingInput = document.getElementById('ratingValue');

  if (!nameInput || !emailInput || !messageInput) return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();
  const rating = ratingInput?.value ?? '0';

  setFormStatus('');
  setInputError(nameInput, false);
  setInputError(emailInput, false);
  setInputError(messageInput, false);

  if (!name) {
    setInputError(nameInput, true);
    setFormStatus('Please enter your full name.', 'error');
    nameInput.focus();
    return;
  }

  if (!email) {
    setInputError(emailInput, true);
    setFormStatus('Please enter your email address.', 'error');
    emailInput.focus();
    return;
  }

  if (!emailInput.checkValidity()) {
    setInputError(emailInput, true);
    setFormStatus('Please enter a valid email address.', 'error');
    emailInput.focus();
    return;
  }

  if (!message) {
    setInputError(messageInput, true);
    setFormStatus('Please enter your message.', 'error');
    messageInput.focus();
    return;
  }

  const submitBtn = this.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
});

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

document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', function() {
      document.getElementById('ratingValue').value = this.dataset.value;
    });
  });

document.getElementById('feedback').addEventListener('submit', function(event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('mail').value;
  const rating = document.getElementById('ratingValue').value;
  const message = document.getElementById('FeedbackText').value;

  const subject = encodeURIComponent("Website Feedback from " + name);
  const body = encodeURIComponent(
    "Name: " + name + "\n" +
    "Email: " + email + "\n" +
    "Rating: " + rating + " stars\n\n" +
    "Message:\n" + message
  );
  const mailtoLink = `mailto:tejtech2604@gmail.com?subject=${subject}&body=${body}`;
  window.location.href = mailtoLink;
});

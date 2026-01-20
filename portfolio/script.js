document.addEventListener('DOMContentLoaded', () => {

  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const arrow = item.querySelector('.arrow');

    question.addEventListener('click', () => {
      faqItems.forEach(i => {
        if (i !== item) {
          i.classList.remove('active');
          i.querySelector('.faq-answer').style.maxHeight = null;
          i.querySelector('.arrow').classList.remove('rotate');
        }
      });

      item.classList.toggle('active');

      if (item.classList.contains('active')) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        arrow.classList.add('rotate');
      } else {
        answer.style.maxHeight = null;
        arrow.classList.remove('rotate');
      }
    });
  });


  const progressBars = document.querySelectorAll('.progress-line span');
  const skillSection = document.querySelector('.skill-bars');

  let lastScrollTop = 0;

  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const currentScrollTop =
        window.scrollY || document.documentElement.scrollTop;

      if (entry.isIntersecting && currentScrollTop > lastScrollTop) {
        progressBars.forEach((bar, index) => {
          const percent = bar.getAttribute('data-percent');
          setTimeout(() => {
            bar.style.width = percent + '%';
          }, index * 300);
        });
      }

      if (!entry.isIntersecting && currentScrollTop < lastScrollTop) {
        progressBars.forEach(bar => {
          bar.style.width = '0';
        });
      }

      lastScrollTop = currentScrollTop;
    });
  }, { threshold: 0.5 });

  if (skillSection) skillObserver.observe(skillSection);


  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav a');

  const navObserver = new IntersectionObserver(
    entries => {
      let visibleSection = null;

      entries.forEach(entry => {
        if (
          entry.isIntersecting &&
          (!visibleSection ||
            entry.intersectionRatio > visibleSection.intersectionRatio)
        ) {
          visibleSection = entry;
        }
      });

      if (visibleSection) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (
            link.getAttribute('href').substring(1) ===
            visibleSection.target.id
          ) {
            link.classList.add('active');
          }
        });
      }
    },
    {
      threshold: [0.25, 0.5, 0.75],
      rootMargin: '-80px 0px -40% 0px'
    }
  );

  sections.forEach(section => navObserver.observe(section));


  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('active', entry.isIntersecting);
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  document
    .querySelectorAll('.scroll-reveal')
    .forEach(el => revealObserver.observe(el));

});

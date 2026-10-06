document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ------------------------------------------------------------
     AOS INIT
     ------------------------------------------------------------ */
  if (window.AOS) {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: prefersReducedMotion ? true : false
    });
  }

  /* ------------------------------------------------------------
     SCROLL PROGRESS BAR
     ------------------------------------------------------------ */
  const progressBar = document.querySelector('.scroll-progress-bar');

  function updateProgressBar() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  /* ------------------------------------------------------------
     NAV: background on scroll + active page highlighting
     ------------------------------------------------------------ */
  const navEl = document.querySelector('nav');
  const navLinks = document.querySelectorAll('.nav-links a[href]');
  const currentPage = (location.pathname.split('/').pop() || 'index.html');

  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', linkPage === currentPage);
  });

  function updateNavState() {
    if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 40);
  }

  /* ------------------------------------------------------------
     BACK TO TOP
     ------------------------------------------------------------ */
  const backToTop = document.getElementById('backToTop');

  function updateBackToTop() {
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------
     COMBINED SCROLL HANDLER (throttled via rAF)
     ------------------------------------------------------------ */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgressBar();
        updateNavState();
        updateBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------
     CUSTOM CURSOR
     ------------------------------------------------------------ */
  if (!isCoarsePointer) {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const spotlight = document.getElementById('mouse-spotlight');

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (cursorDot) {
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
      if (spotlight) {
        spotlight.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
    });

    function animateOutline() {
      outlineX += (mouseX - outlineX) * 0.18;
      outlineY += (mouseY - outlineY) * 0.18;
      if (cursorOutline) {
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
      }
      requestAnimationFrame(animateOutline);
    }
    animateOutline();

    const interactiveEls = document.querySelectorAll('a, button, input, textarea, .card');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => cursorOutline && cursorOutline.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursorOutline && cursorOutline.classList.remove('is-active'));
    });

    document.addEventListener('mouseleave', () => {
      if (cursorDot) cursorDot.style.opacity = '0';
      if (cursorOutline) cursorOutline.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      if (cursorDot) cursorDot.style.opacity = '1';
      if (cursorOutline) cursorOutline.style.opacity = '1';
    });
  } else {
    document.querySelectorAll('.cursor-dot, .cursor-outline, #mouse-spotlight')
      .forEach(el => el.style.display = 'none');
  }

  /* ------------------------------------------------------------
     SKILL BARS — animate fill when scrolled into view
     ------------------------------------------------------------ */
  const skillBars = document.querySelectorAll('.skill-bar-fill');

  if (skillBars.length) {
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.getAttribute('data-percentage') || '0%';
          el.style.setProperty('--fill-target', target);
          // slight delay so the fill transition is visible
          requestAnimationFrame(() => {
            requestAnimationFrame(() => el.classList.add('filled'));
          });
          skillObserver.unobserve(el);
        }
      });
    }, { threshold: 0.4 });

    skillBars.forEach(bar => skillObserver.observe(bar));
  }

  /* ------------------------------------------------------------
     COUNTERS — count up when scrolled into view
     ------------------------------------------------------------ */
  const counters = document.querySelectorAll('.counter-number');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1200;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

});

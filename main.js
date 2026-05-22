/**
 * Alex Design — Portfolio Site
 * main.js — головний JavaScript-файл
 *
 * Модулі:
 *  1. Утиліти
 *  2. Навігація (sticky, burger, active link)
 *  3. Тема (dark / light mode)
 *  4. Scroll-to-top кнопка
 *  5. Scroll-reveal анімації (Intersection Observer)
 *  6. Анімований лічильник (hero stats)
 *  7. Анімація skill bars
 *  8. Typing effect (hero title)
 *  9. Cursor spotlight
 * 10. Фільтр портфоліо (portfolio.html)
 * 11. Валідація форми + toast (contact.html)
 * 12. Preloader
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. УТИЛІТИ
═══════════════════════════════════════════════════════════ */

/**
 * Зручна обгортка для querySelector
 * @param {string} selector
 * @param {Element} [ctx=document]
 */
const $ = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

/**
 * Debounce — обмежує частоту виклику функції
 */
const debounce = (fn, delay = 100) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Clamp — обмежує значення між min та max
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Ease-out функція для анімацій
 */
const easeOut = (t) => 1 - Math.pow(1 - t, 3);


/* ═══════════════════════════════════════════════════════════
   2. НАВІГАЦІЯ
═══════════════════════════════════════════════════════════ */
const Nav = (() => {
  const nav     = $('#mainNav');
  const menu    = $('#navMenu');
  const burger  = $('#burger');
  if (!nav) return;

  /* ── Sticky shadow ── */
  const onScroll = debounce(() => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 10);
  }, 10);
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Burger / mobile menu ── */
  burger?.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen);
    burger.classList.toggle('is-active', isOpen);
  });

  /* Закриття меню при кліку поза ним */
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      menu?.classList.remove('open');
      burger?.setAttribute('aria-expanded', 'false');
      burger?.classList.remove('is-active');
    }
  });

  /* Закриття меню при кліку на посилання */
  $$('.nav__link', menu).forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger?.setAttribute('aria-expanded', 'false');
      burger?.classList.remove('is-active');
    });
  });

  /* ── Active link при прокрутці (тільки index.html) ── */
  const sections = $$('main section[aria-labelledby]');
  if (sections.length > 0) {
    const navLinks = $$('.nav__link');

    const activateLink = () => {
      const scrollY = window.scrollY + 120;
      let current = '';

      sections.forEach(sec => {
        if (sec.offsetTop <= scrollY) {
          current = sec.getAttribute('aria-labelledby') || '';
        }
      });

      navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const isHome = href === 'index.html' || href === '../index.html';
        if (isHome && (current === 'hero-title' || window.scrollY < 100)) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', debounce(activateLink, 50), { passive: true });
  }
})();


/* ═══════════════════════════════════════════════════════════
   3. ТЕМНА / СВІТЛА ТЕМА
═══════════════════════════════════════════════════════════ */
const Theme = (() => {
  const STORAGE_KEY = 'portfolio-theme';
  const root = document.documentElement;

  /* Зчитати збережену тему або system preference */
  const getPreferred = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    $$('.theme-toggle').forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Перемкнути на світлу тему' : 'Перемкнути на темну тему');
      btn.setAttribute('title',      theme === 'dark' ? 'Світла тема' : 'Темна тема');
      const icon = btn.querySelector('.theme-toggle__icon');
      if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
  };

  /* Ін'єктуємо кнопку перемикача в навігацію */
  const injectButton = () => {
    const navInner = $('.nav__inner');
    if (!navInner || $('.theme-toggle')) return;

    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.innerHTML = `<span class="theme-toggle__icon"></span>`;
    btn.style.cssText = `
      background: none;
      border: 1.5px solid var(--clr-border);
      border-radius: var(--radius-sm);
      width: 38px; height: 38px;
      cursor: pointer;
      font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
      transition: border-color .2s, background .2s;
      flex-shrink: 0;
    `;
    btn.addEventListener('mouseenter', () => btn.style.borderColor = 'var(--clr-accent)');
    btn.addEventListener('mouseleave', () => btn.style.borderColor = 'var(--clr-border)');
    btn.addEventListener('click', toggle);

    /* Вставляємо перед CTA-кнопкою */
    const cta = $('.nav__cta', navInner);
    if (cta) navInner.insertBefore(btn, cta);
    else navInner.appendChild(btn);
  };

  const toggle = () => {
    const current = root.getAttribute('data-theme') || 'light';
    apply(current === 'dark' ? 'light' : 'dark');
  };

  /* CSS-змінні для темної теми */
  const injectDarkStyles = () => {
    if ($('#dark-theme-styles')) return;
    const style = document.createElement('style');
    style.id = 'dark-theme-styles';
    style.textContent = `
      [data-theme="dark"] {
        --clr-white:   #0F172A;
        --clr-light:   #1E293B;
        --clr-text:    #E2E8F0;
        --clr-muted:   #94A3B8;
        --clr-dark:    #F8FAFC;
        --clr-border:  #334155;
        --clr-card-bg: #1E293B;
      }
      [data-theme="dark"] body { background: #0F172A; }
      [data-theme="dark"] .nav { background: rgba(15,23,42,.92); border-bottom-color: #334155; }
      [data-theme="dark"] .nav__logo { color: #E2E8F0; }
      [data-theme="dark"] .nav__logo-mark { background: var(--clr-accent); }
      [data-theme="dark"] .nav__link { color: #94A3B8; }
      [data-theme="dark"] .nav__link:hover,
      [data-theme="dark"] .nav__link.active { color: var(--clr-accent); background: rgba(26,115,232,.12); }
      [data-theme="dark"] .card { background: #1E293B; border-color: #334155; }
      [data-theme="dark"] .card__title { color: #E2E8F0; }
      [data-theme="dark"] .service-card { background: #1E293B; border-color: #334155; }
      [data-theme="dark"] .service-card h3 { color: #E2E8F0; }
      [data-theme="dark"] .hero { background: linear-gradient(135deg,#0F172A 0%, #1E293B 60%); }
      [data-theme="dark"] .hero__title { color: #E2E8F0; }
      [data-theme="dark"] .section--alt { background: #1E293B; }
      [data-theme="dark"] .section__header h2 { color: #E2E8F0; }
      [data-theme="dark"] h1,h2,h3,h4 { color: #E2E8F0; }
      [data-theme="dark"] .hero__stat-num { color: #E2E8F0; }
      [data-theme="dark"] .skill-bar__track { background: #334155; }
      [data-theme="dark"] .btn--outline { border-color: #475569; color: #E2E8F0; }
      [data-theme="dark"] .btn--outline:hover { border-color: var(--clr-accent); color: var(--clr-accent); }
      [data-theme="dark"] .form__group input,
      [data-theme="dark"] .form__group textarea,
      [data-theme="dark"] .form__group select { background: #0F172A; border-color: #334155; color: #E2E8F0; }
      [data-theme="dark"] .contact__form { background: #1E293B; }
      [data-theme="dark"] .contact__form h3 { color: #E2E8F0; }
      [data-theme="dark"] .form__group label { color: #E2E8F0; }
      [data-theme="dark"] .filter-btn { background: #1E293B; color: #94A3B8; }
      [data-theme="dark"] .page-hero { background: linear-gradient(135deg,#0F172A,#1E293B); }
      [data-theme="dark"] .breadcrumb { color: #64748B; }
      [data-theme="dark"] .nav__menu.open { background: #0F172A; border-color: #334155; }
    `;
    document.head.appendChild(style);
  };

  injectDarkStyles();
  injectButton();
  apply(getPreferred());

  return { toggle, apply };
})();


/* ═══════════════════════════════════════════════════════════
   4. SCROLL-TO-TOP КНОПКА
═══════════════════════════════════════════════════════════ */
const ScrollTop = (() => {
  const btn = document.createElement('button');
  btn.id = 'scrollTop';
  btn.setAttribute('aria-label', 'Прокрутити на початок');
  btn.title = 'Вгору';
  btn.innerHTML = '↑';
  btn.style.cssText = `
    position: fixed;
    bottom: 32px; right: 32px;
    width: 46px; height: 46px;
    border-radius: 50%;
    background: var(--clr-accent);
    color: white;
    border: none;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(26,115,232,.4);
    opacity: 0;
    transform: translateY(12px);
    transition: opacity .3s, transform .3s;
    z-index: 999;
    display: flex; align-items: center; justify-content: center;
  `;
  document.body.appendChild(btn);

  const toggle = debounce(() => {
    const visible = window.scrollY > 300;
    btn.style.opacity = visible ? '1' : '0';
    btn.style.transform = visible ? 'translateY(0)' : 'translateY(12px)';
    btn.style.pointerEvents = visible ? 'auto' : 'none';
  }, 50);

  window.addEventListener('scroll', toggle, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ═══════════════════════════════════════════════════════════
   5. SCROLL-REVEAL АНІМАЦІЇ (Intersection Observer)
═══════════════════════════════════════════════════════════ */
const ScrollReveal = (() => {
  /* Додаємо CSS для початкових станів */
  const style = document.createElement('style');
  style.textContent = `
    .reveal { opacity: 0; transform: translateY(36px); transition: opacity .65s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.16,1,.3,1); }
    .reveal.reveal--left  { transform: translateX(-40px); }
    .reveal.reveal--right { transform: translateX(40px); }
    .reveal.reveal--scale { transform: scale(.94); }
    .reveal.is-visible    { opacity: 1; transform: none; }
    .reveal--delay-1 { transition-delay: .1s; }
    .reveal--delay-2 { transition-delay: .2s; }
    .reveal--delay-3 { transition-delay: .3s; }
    .reveal--delay-4 { transition-delay: .4s; }
    .reveal--delay-5 { transition-delay: .5s; }
  `;
  document.head.appendChild(style);

  /* Автоматично розмічаємо елементи */
  const addReveal = () => {
    /* Секційні хедери */
    $$('.section__header').forEach(el => el.classList.add('reveal'));

    /* Картки портфоліо — поступово */
    $$('.portfolio__grid > li, .portfolio__grid > .card').forEach((el, i) => {
      el.classList.add('reveal', `reveal--delay-${Math.min(i + 1, 5)}`);
    });

    /* Сервіс-картки */
    $$('.services__grid > li, .services__grid > .service-card').forEach((el, i) => {
      el.classList.add('reveal', `reveal--delay-${Math.min(i + 1, 5)}`);
    });

    /* About: фото зліва, текст справа */
    const aboutPhoto = $('.about__photo');
    const aboutText  = $('.about__text');
    if (aboutPhoto) aboutPhoto.classList.add('reveal', 'reveal--left');
    if (aboutText)  aboutText.classList.add('reveal', 'reveal--right');

    /* Hero елементи */
    const heroContent = $('.hero__content');
    const heroVisual  = $('.hero__visual');
    if (heroContent) heroContent.classList.add('reveal', 'reveal--left');
    if (heroVisual)  heroVisual.classList.add('reveal', 'reveal--right');

    /* Contact форма */
    const contactInfo = $('.contact__info');
    const contactForm = $('.contact__form');
    if (contactInfo) contactInfo.classList.add('reveal', 'reveal--left');
    if (contactForm) contactForm.classList.add('reveal', 'reveal--right');
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); /* анімуємо лише раз */
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  const observe = () => $$('.reveal').forEach(el => observer.observe(el));

  addReveal();
  /* Чекаємо на наступний фрейм щоб CSS встиг застосуватись */
  requestAnimationFrame(() => requestAnimationFrame(observe));
})();


/* ═══════════════════════════════════════════════════════════
   6. АНІМОВАНИЙ ЛІЧИЛЬНИК (hero stats)
═══════════════════════════════════════════════════════════ */
const AnimatedCounter = (() => {
  const counters = $$('.hero__stat-num');
  if (!counters.length) return;

  const animate = (el) => {
    const raw    = el.textContent.trim();       /* напр. "50+" або "98%" */
    const suffix = raw.replace(/\d/g, '');      /* "+" або "%" */
    const target = parseInt(raw, 10);           /* 50 або 98 */
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = clamp(elapsed / duration, 0, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


/* ═══════════════════════════════════════════════════════════
   7. АНІМАЦІЯ SKILL BARS
═══════════════════════════════════════════════════════════ */
const SkillBars = (() => {
  const fills = $$('.skill-bar__fill');
  if (!fills.length) return;

  /* Зберігаємо цільову ширину і обнуляємо */
  fills.forEach(fill => {
    const target = fill.style.width || '0%';
    fill.dataset.target = target;
    fill.style.width = '0%';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        /* Невелика затримка для ефекту */
        setTimeout(() => {
          fill.style.transition = 'width 1.2s cubic-bezier(.16,1,.3,1)';
          fill.style.width = fill.dataset.target;
        }, 150);
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(fill => observer.observe(fill));
})();


/* ═══════════════════════════════════════════════════════════
   8. TYPING EFFECT (hero title)
═══════════════════════════════════════════════════════════ */
const TypingEffect = (() => {
  const eyebrow = $('.hero__eyebrow');
  if (!eyebrow) return;

  const phrases = [
    'UI/UX дизайнер',
    'Веб-дизайнер',
    'Продуктовий дизайнер',
    'Творець інтерфейсів',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let isDeleting = false;

  const style = document.createElement('style');
  style.textContent = `
    .hero__eyebrow { min-width: 200px; }
    .cursor {
      display: inline-block;
      width: 2px;
      height: 1.1em;
      background: var(--clr-accent);
      margin-left: 2px;
      vertical-align: middle;
      animation: blink .7s step-end infinite;
    }
    @keyframes blink { 50% { opacity: 0; } }
  `;
  document.head.appendChild(style);

  /* Зберігаємо оригінальний текст */
  const originalText = eyebrow.textContent;
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  eyebrow.textContent = originalText;
  eyebrow.appendChild(cursor);

  const type = () => {
    const phrase = phrases[phraseIdx];
    const speed  = isDeleting ? 45 : 90;

    if (isDeleting) {
      charIdx--;
    } else {
      charIdx++;
    }

    eyebrow.firstChild.textContent = phrase.slice(0, charIdx);

    if (!isDeleting && charIdx === phrase.length) {
      isDeleting = true;
      setTimeout(type, 1800); /* пауза перед видаленням */
      return;
    }
    if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx  = (phraseIdx + 1) % phrases.length;
      setTimeout(type, 400);
      return;
    }
    setTimeout(type, speed);
  };

  /* Починаємо після невеликої затримки */
  setTimeout(type, 1500);
})();


/* ═══════════════════════════════════════════════════════════
   9. CURSOR SPOTLIGHT (ефект слідкування курсора)
═══════════════════════════════════════════════════════════ */
const CursorSpotlight = (() => {
  /* Тільки для не-touch пристроїв */
  if (window.matchMedia('(hover: none)').matches) return;

  const spotlight = document.createElement('div');
  spotlight.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(26,115,232,.06) 0%, transparent 70%);
    pointer-events: none;
    transform: translate(-50%, -50%);
    z-index: 0;
    transition: opacity .3s;
  `;
  document.body.appendChild(spotlight);

  window.addEventListener('mousemove', (e) => {
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top  = e.clientY + 'px';
  }, { passive: true });

  /* Ховаємо на темній секції щоб не конфліктувало */
  document.addEventListener('mouseover', (e) => {
    const inDark = e.target.closest('.section--dark, .page-hero, footer');
    spotlight.style.opacity = inDark ? '0' : '1';
  });
})();


/* ═══════════════════════════════════════════════════════════
   10. ФІЛЬТР ПОРТФОЛІО (portfolio.html)
═══════════════════════════════════════════════════════════ */
const PortfolioFilter = (() => {
  const filterBtns = $$('.filter-btn');
  const grid       = $('#portfolioGrid');
  if (!filterBtns.length || !grid) return;

  /* CSS для анімації фільтра */
  const style = document.createElement('style');
  style.textContent = `
    #portfolioGrid li, #portfolioGrid > .card {
      transition: opacity .35s ease, transform .35s ease;
    }
    #portfolioGrid li.hidden, #portfolioGrid > .card.hidden {
      opacity: 0;
      transform: scale(.92);
      pointer-events: none;
    }
    .portfolio__grid {
      transition: none;
    }
    .filter-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      border-radius: 10px;
      background: rgba(255,255,255,.3);
      color: inherit;
      font-size: .7rem;
      font-weight: 700;
      padding: 0 5px;
      margin-left: 5px;
    }
    .filter-btn.active .filter-count {
      background: rgba(255,255,255,.25);
    }
  `;
  document.head.appendChild(style);

  /* Рахуємо кількість для кожного фільтра */
  const items = $$('li[data-cat], [data-cat]', grid);
  filterBtns.forEach(btn => {
    const filter = btn.dataset.filter;
    const count  = filter === 'all'
      ? items.length
      : items.filter(i => i.dataset.cat === filter).length;

    const badge = document.createElement('span');
    badge.className = 'filter-count';
    badge.textContent = count;
    btn.appendChild(badge);
  });

  const applyFilter = (filter) => {
    items.forEach(item => {
      const match = filter === 'all' || item.dataset.cat === filter;
      if (match) {
        item.classList.remove('hidden');
        /* Прибираємо display:none якщо було поставлено */
        item.style.display = '';
      } else {
        item.classList.add('hidden');
        /* Прибираємо з потоку після анімації */
        setTimeout(() => {
          if (item.classList.contains('hidden')) item.style.display = 'none';
        }, 350);
      }
    });
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      /* Повертаємо все до display:block перед фільтрацією */
      items.forEach(i => { i.style.display = ''; i.classList.remove('hidden'); });
      requestAnimationFrame(() => applyFilter(btn.dataset.filter));
    });
  });
})();


/* ═══════════════════════════════════════════════════════════
   11. ВАЛІДАЦІЯ ФОРМИ + TOAST (contact.html)
═══════════════════════════════════════════════════════════ */
const ContactForm = (() => {
  const form = $('form[action="#"]');
  if (!form) return;

  /* ── Toast ── */
  const toastStyles = document.createElement('style');
  toastStyles.textContent = `
    .toast {
      position: fixed;
      bottom: 90px; right: 32px;
      background: #22C55E;
      color: white;
      padding: 14px 22px;
      border-radius: 10px;
      font-size: .93rem;
      font-weight: 600;
      box-shadow: 0 8px 28px rgba(0,0,0,.18);
      z-index: 9999;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity .3s, transform .3s;
      max-width: 340px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .toast.show  { opacity: 1; transform: none; }
    .toast.error { background: #EF4444; }

    /* Inline validation */
    .form__group .field-error {
      color: #EF4444;
      font-size: .8rem;
      margin-top: 5px;
      display: none;
    }
    .form__group.is-error input,
    .form__group.is-error textarea {
      border-color: #EF4444;
      background: rgba(239,68,68,.04);
    }
    .form__group.is-error .field-error { display: block; }
    .form__group.is-ok input,
    .form__group.is-ok textarea {
      border-color: #22C55E;
    }
    .char-count {
      font-size: .78rem;
      color: var(--clr-muted);
      text-align: right;
      margin-top: 4px;
    }
    .char-count.near-limit { color: #F59E0B; }
    .char-count.at-limit   { color: #EF4444; }
  `;
  document.head.appendChild(toastStyles);

  const showToast = (msg, isError = false) => {
    const old = $('.toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.textContent = (isError ? '✗ ' : '✓ ') + msg;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  };

  /* ── Inline error helpers ── */
  const addErrorEl = (group, msg) => {
    if (!group.querySelector('.field-error')) {
      const span = document.createElement('span');
      span.className = 'field-error';
      span.setAttribute('aria-live', 'polite');
      group.appendChild(span);
    }
    group.querySelector('.field-error').textContent = msg;
  };

  const setValid = (input) => {
    const group = input.closest('.form__group');
    group.classList.remove('is-error');
    group.classList.add('is-ok');
  };

  const setError = (input, msg) => {
    const group = input.closest('.form__group');
    group.classList.remove('is-ok');
    group.classList.add('is-error');
    addErrorEl(group, msg);
  };

  const clearState = (input) => {
    const group = input.closest('.form__group');
    group.classList.remove('is-ok', 'is-error');
  };

  /* ── Validators ── */
  const validators = {
    name: (v) => {
      if (!v) return "Будь ласка, введіть ваше ім'я";
      if (v.length < 2) return 'Ім\'я занадто коротке';
      return null;
    },
    email: (v) => {
      if (!v) return 'Будь ласка, введіть email';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Введіть коректний email';
      return null;
    },
    message: (v) => {
      if (!v) return 'Будь ласка, напишіть повідомлення';
      if (v.length < 10) return 'Повідомлення занадто коротке (мінімум 10 символів)';
      return null;
    },
  };

  const validateField = (input) => {
    const val = input.value.trim();
    const fn  = validators[input.name];
    if (!fn) return true;
    const error = fn(val);
    if (error) { setError(input, error); return false; }
    else        { setValid(input); return true; }
  };

  /* ── Real-time validation ── */
  $$('[name="name"], [name="email"], [name="message"]', form).forEach(input => {
    input.addEventListener('blur',  () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.form__group').classList.contains('is-error')) {
        validateField(input);
      }
    });
  });

  /* ── Char counter for textarea ── */
  const textarea = $('textarea', form);
  if (textarea) {
    const MAX = 500;
    const counter = document.createElement('p');
    counter.className = 'char-count';
    counter.setAttribute('aria-live', 'polite');
    textarea.after(counter);

    const update = () => {
      const len  = textarea.value.length;
      const left = MAX - len;
      counter.textContent = `${len} / ${MAX}`;
      counter.className = 'char-count' +
        (left < 50 ? (left < 10 ? ' at-limit' : ' near-limit') : '');
      if (len > MAX) textarea.value = textarea.value.slice(0, MAX);
    };
    textarea.addEventListener('input', update);
    update();
  }

  /* ── Submit ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    /* Валідуємо всі поля */
    const inputs = $$('[name]', form).filter(i => validators[i.name]);
    const valid  = inputs.map(validateField).every(Boolean);

    if (!valid) {
      showToast('Будь ласка, заповніть усі поля коректно', true);
      const firstError = inputs.find(i => i.closest('.form__group').classList.contains('is-error'));
      firstError?.focus();
      return;
    }

    const btn = $('button[type=submit]', form);
    btn.disabled = true;
    btn.textContent = 'Надсилаємо...';

    /* Імітація запиту (у реальному проєкті — fetch до API) */
    setTimeout(() => {
      showToast('Повідомлення надіслано! Відповідь протягом 24 год.');
      form.reset();
      inputs.forEach(i => clearState(i));
      if (textarea) {
        const counter = $('.char-count');
        if (counter) counter.textContent = '0 / 500';
      }
      btn.disabled = false;
      btn.textContent = 'Надіслати повідомлення →';
    }, 1200);
  });
})();


/* ═══════════════════════════════════════════════════════════
   12. PRELOADER
═══════════════════════════════════════════════════════════ */
const Preloader = (() => {
  /* Тільки показуємо якщо сторінка ще не завантажена */
  if (document.readyState === 'complete') return;

  const loader = document.createElement('div');
  loader.id = 'preloader';
  loader.setAttribute('aria-hidden', 'true');
  loader.style.cssText = `
    position: fixed; inset: 0;
    background: var(--clr-white, #fff);
    z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 12px;
    transition: opacity .45s ease, visibility .45s ease;
  `;
  loader.innerHTML = `
    <div style="
      width: 46px; height: 46px;
      background: #1A73E8;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; color: white; font-size: 1rem;
      font-family: system-ui, sans-serif;
      animation: pulse .9s ease-in-out infinite alternate;
    ">MD</div>
    <div style="
      width: 120px; height: 3px;
      background: #E4E8EE; border-radius: 2px; overflow: hidden;
    ">
      <div id="loaderBar" style="
        height: 100%; width: 0%;
        background: #1A73E8; border-radius: 2px;
        transition: width .4s ease;
      "></div>
    </div>
    <style>@keyframes pulse{ to{transform:scale(1.1);box-shadow:0 0 0 10px rgba(26,115,232,.15)} }</style>
  `;
  document.body.appendChild(loader);

  /* Анімація прогрес-бару */
  let pct = 0;
  const bar = loader.querySelector('#loaderBar');
  const tick = setInterval(() => {
    pct = Math.min(pct + Math.random() * 18, 88);
    if (bar) bar.style.width = pct + '%';
  }, 120);

  const hide = () => {
    clearInterval(tick);
    if (bar) bar.style.width = '100%';
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      setTimeout(() => loader.remove(), 450);
    }, 200);
  };

  if (document.readyState === 'complete') hide();
  else window.addEventListener('load', hide);
})();


/* ═══════════════════════════════════════════════════════════
   ІНІЦІАЛІЗАЦІЯ ЗАВЕРШЕНА
═══════════════════════════════════════════════════════════ */
console.log('%cAlex Design — JS ✓', 'color:#1A73E8;font-weight:700;font-size:14px;');

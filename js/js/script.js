/* ═══════════════════════════════════════════════════════════════
   FLAMA STUDIO — script.js
   Vanilla JS — sin dependencias externas
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     UTILIDADES
  ──────────────────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ────────────────────────────────────────────────────────────
     NAV — scroll state
  ──────────────────────────────────────────────────────────── */
  const header = $('#site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // estado inicial
  }

  /* ────────────────────────────────────────────────────────────
     MOBILE MENU
  ──────────────────────────────────────────────────────────── */
  const navToggle = $('#navToggle');
  const navMobile = $('#navMobile');

  function openMenu() {
    if (!navMobile || !navToggle) return;
    navMobile.classList.add('open');
    navToggle.classList.add('active');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';
  }

  window.closeMenu = function () {
    if (!navMobile || !navToggle) return;
    navMobile.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  };

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      if (navMobile.classList.contains('open')) {
        window.closeMenu();
      } else {
        openMenu();
      }
    });
  }

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMobile && navMobile.classList.contains('open')) {
      window.closeMenu();
    }
  });

  /* ────────────────────────────────────────────────────────────
     SCROLL REVEAL — IntersectionObserver
  ──────────────────────────────────────────────────────────── */
  const revealEls = $$('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    // Fallback: mostrar todo si no hay soporte
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ────────────────────────────────────────────────────────────
     SMOOTH SCROLL — anclajes internos
     (complementa scroll-behavior: smooth del CSS)
  ──────────────────────────────────────────────────────────── */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 20;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ────────────────────────────────────────────────────────────
     HERO IMAGE — gestión de error de carga
     Si la imagen no carga, el fallback CSS toma el control
  ──────────────────────────────────────────────────────────── */
  const heroImg = $('.hero-img');
  if (heroImg) {
    heroImg.addEventListener('error', () => {
      const media = heroImg.closest('.hero-media');
      if (media) media.classList.add('no-image');
    });
  }

  /* ────────────────────────────────────────────────────────────
     GALLERY — hover sutil en mobile (tap)
     En touch, el hover CSS no funciona, así que añadimos
     clase activa con tap para mostrar el caption.
  ──────────────────────────────────────────────────────────── */
  const isTouchDevice = () =>
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (isTouchDevice()) {
    $$('.gallery-item').forEach((item) => {
      item.addEventListener('click', () => {
        $$('.gallery-item.touch-active').forEach((el) => {
          if (el !== item) el.classList.remove('touch-active');
        });
        item.classList.toggle('touch-active');
      });
    });
  }

  /* ────────────────────────────────────────────────────────────
     LAZY LOADING NATIVO — fallback para browsers sin soporte
  ──────────────────────────────────────────────────────────── */
  if (!('loading' in HTMLImageElement.prototype)) {
    // IntersectionObserver como fallback lazy load
    const lazyImgs = $$('img[loading="lazy"]');
    if (lazyImgs.length && 'IntersectionObserver' in window) {
      const lazyObs = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) img.src = img.dataset.src;
              obs.unobserve(img);
            }
          });
        },
        { rootMargin: '200px' }
      );
      lazyImgs.forEach((img) => lazyObs.observe(img));
    }
  }

  /* ────────────────────────────────────────────────────────────
     ACTIVE NAV LINK — highlight al hacer scroll por secciones
  ──────────────────────────────────────────────────────────── */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-desktop a[href^="#"]');

  if (sections.length && navLinks.length) {
    const sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((s) => sectionObs.observe(s));
  }

  /* ────────────────────────────────────────────────────────────
     PERFORMANCE — prefetch en hover de links internos
  ──────────────────────────────────────────────────────────── */
  if ('requestIdleCallback' in window) {
    $$('a[href]:not([href^="#"]):not([href^="mailto"]):not([href^="tel"])').forEach(
      (link) => {
        link.addEventListener(
          'mouseenter',
          () => {
            const href = link.href;
            if (!href || href.startsWith('http') && !href.includes(location.hostname)) return;
            requestIdleCallback(() => {
              const prefetch = document.createElement('link');
              prefetch.rel  = 'prefetch';
              prefetch.href = href;
              document.head.appendChild(prefetch);
            });
          },
          { once: true, passive: true }
        );
      }
    );
  }

})();

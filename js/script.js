
/* ═══════════════════════════════════════════════════════════
   FLAMA STUDIO — js/script.js (versión corregida)
   Vanilla JS · Sin dependencias · Sin cursor personalizado
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Referencias DOM ───────────────────────────────────── */
  var header    = document.getElementById('site-header');
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');
  var navClose  = document.getElementById('navClose');


  /* ── 01. HEADER — scroll state ─────────────────────────── */
  if (header) {
    function updateHeader() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader(); // estado correcto al cargar
  }


  /* ── 02. MENÚ MÓVIL ─────────────────────────────────────── */

  function openMenu() {
    if (!navMobile || !navToggle) return;
    navMobile.classList.add('open');
    navMobile.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!navMobile || !navToggle) return;
    navMobile.classList.remove('open');
    navMobile.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  }

  // Asegurarse de que el menú está cerrado al cargar
  if (navMobile) {
    navMobile.classList.remove('open');
    navMobile.setAttribute('aria-hidden', 'true');
  }

  // Toggle hamburger
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMobile && navMobile.classList.contains('open');
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });
  }

  // Botón cerrar (X)
  if (navClose) {
    navClose.addEventListener('click', closeMenu);
  }

  // Cerrar al pulsar un enlace del menú
  if (navMobile) {
    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // Cerrar con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMobile && navMobile.classList.contains('open')) {
      closeMenu();
      if (navToggle) navToggle.focus();
    }
  });


  /* ── 03. SCROLL REVEAL — IntersectionObserver ───────────── */
  var revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      // Fallback sin soporte
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }
  }


  /* ── 04. SMOOTH SCROLL — descuenta altura del header ────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var headerH = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });


  /* ── 05. NAV LINKS — estado activo por sección ──────────── */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-desktop a[href^="#"]');

  if (sections.length > 0 && navLinks.length > 0 && 'IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var activeId = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + activeId);
          });
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(function (s) { sectionObs.observe(s); });
  }

})();

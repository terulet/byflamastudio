/* ═══════════════════════════════════════════════════════════
   FLAMA STUDIO — js/script.js (v3 afinado)
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
      header.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
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

  /* Estado inicial: siempre cerrado */
  if (navMobile) {
    navMobile.classList.remove('open');
    navMobile.setAttribute('aria-hidden', 'true');
  }

  /* Toggle hamburger */
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMobile && navMobile.classList.contains('open');
      isOpen ? closeMenu() : openMenu();
    });
  }

  /* Botón cerrar (✕) */
  if (navClose) {
    navClose.addEventListener('click', closeMenu);
  }

  /* Cerrar al pulsar enlace */
  if (navMobile) {
    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* Cerrar con Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMobile && navMobile.classList.contains('open')) {
      closeMenu();
      if (navToggle) navToggle.focus();
    }
  });

  /* Cerrar al redimensionar a desktop */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });


  /* ── 03. SCROLL REVEAL ──────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    if ('IntersectionObserver' in window) {
      var revealObs = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.07, rootMargin: '0px 0px -36px 0px' });

      revealEls.forEach(function (el) { revealObs.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }
  }


  /* ── 04. SMOOTH SCROLL ──────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var headerH = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - headerH - 20;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });


  /* ── 05. NAV ACTIVA por sección ─────────────────────────── */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-desktop a[href^="#"]');

  if (sections.length > 0 && navLinks.length > 0 && 'IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(function (s) { sectionObs.observe(s); });
  }

})();

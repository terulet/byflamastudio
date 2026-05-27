/* ═══════════════════════════════════════════════════════════
   FLAMA STUDIO — js/script.js (v5)
   Vanilla JS · Sin dependencias · Sin cursor personalizado
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var header    = document.getElementById('site-header');
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');
  var navClose  = document.getElementById('navClose');

  /* ── 01. HEADER scroll ──────────────────────────────────── */
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

  /* Siempre cerrado al cargar */
  if (navMobile) {
    navMobile.classList.remove('open');
    navMobile.setAttribute('aria-hidden', 'true');
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      navMobile && navMobile.classList.contains('open') ? closeMenu() : openMenu();
    });
  }
  if (navClose) { navClose.addEventListener('click', closeMenu); }
  if (navMobile) {
    navMobile.querySelectorAll('a').forEach(function (l) {
      l.addEventListener('click', closeMenu);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMobile && navMobile.classList.contains('open')) {
      closeMenu();
      if (navToggle) navToggle.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) closeMenu();
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
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var hh = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - hh - 20;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });

  /* ── 05. NAV activa ─────────────────────────────────────── */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-desktop a[href^="#"]');
  if (sections.length > 0 && navLinks.length > 0 && 'IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(function (s) { secObs.observe(s); });
  }

  /* ── 06. SELECT PLAN — desde botones de planes ──────────── */
  window.selectPlan = function (plan) {
    var select = document.getElementById('f-plan');
    if (!select) return;
    var map = { 'esencial': 'Web Esencial', 'premium': 'Web Premium', 'pro': 'Web Pro' };
    var value = map[plan] || '';
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === value) { select.selectedIndex = i; break; }
    }
  };

  /* ── 07. FORMULARIO — mailto con todos los campos ───────── */
  var form = document.getElementById('solicitudForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre   = (document.getElementById('f-nombre').value   || '').trim();
      var negocio  = (document.getElementById('f-negocio').value  || '').trim();
      var email    = (document.getElementById('f-email').value    || '').trim();
      var telefono = (document.getElementById('f-telefono').value || '').trim();
      var plan     = document.getElementById('f-plan').value;
      var mensaje  = (document.getElementById('f-mensaje').value  || '').trim();
      var tienesChecks = document.querySelectorAll('input[name="tienes"]:checked');
      var tienes = Array.prototype.map.call(tienesChecks, function(c){ return c.value; }).join(', ') || 'No indicado';
      var objetivoEl = document.querySelector('input[name="objetivo"]:checked');
      var objetivo = objetivoEl ? objetivoEl.value : 'No indicado';
      if (!nombre || !email) { alert('Por favor, rellena al menos tu nombre y email.'); return; }
      var subject = encodeURIComponent('Solicitud web FLAMA Studio');
      var body = encodeURIComponent(
        'NOMBRE: '    + (nombre   || '-') + '\n' +
        'NEGOCIO: '   + (negocio  || '-') + '\n' +
        'EMAIL: '     + (email    || '-') + '\n' +
        'TELEFONO: '  + (telefono || '-') + '\n' +
        'PLAN: '      + (plan     || 'No indicado') + '\n' +
        'QUE TIENE: ' + tienes + '\n' +
        'OBJETIVO: '  + objetivo + '\n\n' +
        'MENSAJE:\n'  + (mensaje  || '-')
      );
      window.location.href = 'mailto:Terix@flamastudio.com?subject=' + subject + '&body=' + body;
    });
  }

  /* ── 06. MOCKUPS — mostrar imagen si carga, placeholder si falla ── */
  function initMockups() {
    document.querySelectorAll('.mockup-screen').forEach(function (screen) {
      var img = screen.querySelector('img');
      var placeholder = screen.querySelector('.mockup-placeholder');
      if (!img || !placeholder) return;

      function showImage() {
        screen.classList.add('has-image');
        placeholder.style.display = 'none';
      }
      function showPlaceholder() {
        screen.classList.remove('has-image');
        placeholder.style.display = 'flex';
      }

      if (img.complete) {
        img.naturalWidth > 0 ? showImage() : showPlaceholder();
      } else {
        showPlaceholder();
        img.addEventListener('load',  showImage);
        img.addEventListener('error', showPlaceholder);
      }
    });
  }

  /* Ejecutar ahora y también tras DOMContentLoaded por si acaso */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMockups);
  } else {
    initMockups();
  }

})();

/* =====================================================================
   ATLAS SANDBOX · Lógica de la demo (100% local, sin APIs externas)
   ---------------------------------------------------------------------
   - Renderiza el selector de verticales, la bandeja omnicanal, el panel
     de caso, las métricas, el panel de privacidad y las sugerencias.
   - Permite cambiar estados y "simular" nuevos mensajes.
   - Persiste el estado en LocalStorage (con guardas try/catch).
   - No envía ni recibe datos reales. Todo es ficticio.
   ===================================================================== */
(function () {
  'use strict';

  var DATA = window.ATLAS_SANDBOX;
  if (!DATA || !Array.isArray(DATA.businesses) || !DATA.businesses.length) {
    var root = document.getElementById('sandboxApp');
    if (root) {
      root.innerHTML = '<div class="sbx-empty"><strong>No se han podido cargar los datos de la demo.</strong>' +
        '<span>Comprueba que <code>sandbox-data.js</code> está incluido en la página.</span></div>';
    }
    return;
  }

  var STORE_KEY = 'atlas-sandbox-v1';
  var CHANNELS = DATA.channels;
  var TAGS = DATA.tags;

  /* ---------- Persistencia segura en LocalStorage ---------- */
  var Store = {
    read: function () {
      try {
        var raw = window.localStorage.getItem(STORE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    },
    write: function (obj) {
      try { window.localStorage.setItem(STORE_KEY, JSON.stringify(obj)); }
      catch (e) { /* almacenamiento no disponible: la demo sigue funcionando en memoria */ }
    },
    clear: function () {
      try { window.localStorage.removeItem(STORE_KEY); } catch (e) {}
    }
  };

  /* ---------- Estado en memoria ---------- */
  var state = {
    businessId: DATA.businesses[0].id,
    selectedCaseId: null,
    filter: 'all',
    cases: {}     // businessId -> [caseObjects]
  };

  function uid(prefix) {
    return (prefix || 'c') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  }

  function nowTime() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function getBusiness(id) {
    return DATA.businesses.filter(function (b) { return b.id === id; })[0] || DATA.businesses[0];
  }

  /* Construye un caso completo a partir de una plantilla/seed */
  function buildCase(business, tpl, opts) {
    opts = opts || {};
    return {
      id: tpl.id || uid('case'),
      channel: tpl.channel,
      person: tpl.person,
      area: tpl.area || '',
      subject: tpl.subject,
      snippet: tpl.snippet || '',
      body: tpl.body || tpl.snippet || '',
      urgency: tpl.urgency || 'media',
      status: tpl.status || business.defaultStatus,
      time: tpl.time || nowTime(),
      tags: Array.isArray(tpl.tags) ? tpl.tags.slice() : [],
      history: Array.isArray(tpl.history) ? tpl.history.slice() : [{ time: tpl.time || nowTime(), label: 'Entrada recibida (simulada)' }],
      documents: Array.isArray(tpl.documents) ? tpl.documents.slice() : [],
      suggestions: tpl.suggestions || null,
      isNew: !!opts.isNew
    };
  }

  /* Carga inicial de casos: seeds + overrides guardados en LocalStorage */
  function loadCases(businessId) {
    var business = getBusiness(businessId);
    var saved = Store.read();
    var savedBiz = saved[businessId] || {};

    var cases = business.seeds.map(function (seed) {
      return buildCase(business, seed);
    });

    // Aplica cambios de estado guardados sobre los seeds
    if (savedBiz.statuses) {
      cases.forEach(function (c) {
        if (savedBiz.statuses[c.id]) c.status = savedBiz.statuses[c.id];
      });
    }
    // Re-inyecta los mensajes simulados que el usuario generó antes
    if (Array.isArray(savedBiz.added)) {
      savedBiz.added.forEach(function (a) {
        var c = buildCase(business, a);
        if (savedBiz.statuses && savedBiz.statuses[c.id]) c.status = savedBiz.statuses[c.id];
        cases.unshift(c);
      });
    }
    return cases;
  }

  function persist() {
    var business = getBusiness(state.businessId);
    var saved = Store.read();
    var cases = state.cases[state.businessId] || [];
    var seedIds = business.seeds.map(function (s) { return s.id; });

    var statuses = {};
    var added = [];
    cases.forEach(function (c) {
      statuses[c.id] = c.status;
      if (seedIds.indexOf(c.id) === -1) {
        // mensaje simulado añadido: guardamos lo necesario para reconstruirlo
        added.push({
          id: c.id, channel: c.channel, person: c.person, area: c.area,
          subject: c.subject, snippet: c.snippet, body: c.body, urgency: c.urgency,
          status: c.status, time: c.time, tags: c.tags, history: c.history,
          documents: c.documents, suggestions: c.suggestions
        });
      }
    });
    saved[state.businessId] = { statuses: statuses, added: added };
    Store.write(saved);
  }

  /* ---------- Cálculo de métricas (en vivo desde los casos) ---------- */
  function computeMetrics(business, cases) {
    var ordered = cases.length;
    var urgent = 0, later = 0, archived = 0, risks = 0;
    var resolvedTones = ['done', 'archived'];

    cases.forEach(function (c) {
      var st = business.statuses.filter(function (s) { return s.id === c.status; })[0];
      var tone = st ? st.tone : 'new';
      if (c.urgency === 'alta' || tone === 'urgent') urgent++;
      if (tone === 'wait') later++;
      if (tone === 'archived') archived++;
      var hasRisk = (c.tags || []).some(function (t) {
        return ['riesgo', 'sensible', 'confidencial', 'plazo', 'revision'].indexOf(t) !== -1;
      });
      if (hasRisk && resolvedTones.indexOf(tone) === -1 && tone !== 'review') risks++;
    });

    var minutes = ordered * (business.avgMinutesSaved || 5);
    var saved = minutes >= 60
      ? (minutes / 60).toFixed(1).replace('.0', '') + ' h'
      : minutes + ' min';

    return { ordered: ordered, urgent: urgent, later: later, archived: archived, risks: risks, saved: saved };
  }

  /* ===================================================================
     RENDER
     =================================================================== */
  var el = {};

  function channelBadge(channelId) {
    var ch = CHANNELS[channelId];
    if (!ch) return '';
    return '<span class="sbx-channel sbx-ch-' + ch.id + '" title="Canal simulado: ' + ch.label + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' + ch.icon + '</svg>' + ch.label + '</span>';
  }

  function tagBadges(tags) {
    if (!tags || !tags.length) return '';
    return tags.map(function (t) {
      var meta = TAGS[t];
      if (!meta) return '';
      return '<span class="sbx-tag sbx-tone-' + meta.tone + '">' + meta.label + '</span>';
    }).join('');
  }

  function statusMeta(business, statusId) {
    return business.statuses.filter(function (s) { return s.id === statusId; })[0] || business.statuses[0];
  }

  function urgencyDot(urgency) {
    var label = { alta: 'Urgencia alta', media: 'Urgencia media', baja: 'Urgencia baja' }[urgency] || 'Urgencia media';
    return '<span class="sbx-urg sbx-urg-' + (urgency || 'media') + '" title="' + label + '" aria-label="' + label + '"></span>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* --- Selector de verticales --- */
  function renderSelector() {
    el.selector.innerHTML = DATA.businesses.map(function (b) {
      var active = b.id === state.businessId ? ' active' : '';
      return '<button class="sbx-vert' + active + '" data-business="' + b.id + '" aria-pressed="' + (active ? 'true' : 'false') + '">' +
        '<span class="sbx-vert-mark" style="--mark:' + b.accent + '">' + esc(b.initials) + '</span>' +
        '<span class="sbx-vert-text"><strong>' + esc(b.short) + '</strong><small>' + esc(b.sector) + '</small></span>' +
        '</button>';
    }).join('');
  }

  /* --- Cabecera del negocio + dolor --- */
  function renderBusinessHead(business) {
    el.bizHead.innerHTML =
      '<div class="sbx-biz-id"><span class="sbx-biz-mark" style="--mark:' + business.accent + '">' + esc(business.initials) + '</span>' +
      '<div><h2>' + esc(business.name) + '</h2><p>' + esc(business.sector) + '</p></div></div>' +
      '<p class="sbx-pain"><span>Dolor principal</span>' + esc(business.pain) + '</p>';
  }

  /* --- Métricas --- */
  function renderMetrics(business, cases) {
    var m = computeMetrics(business, cases);
    var items = [
      { k: 'Mensajes ordenados', v: m.ordered, tone: 'new' },
      { k: 'Urgentes detectados', v: m.urgent, tone: 'urgent' },
      { k: 'Pendientes para después', v: m.later, tone: 'wait' },
      { k: 'Casos archivados', v: m.archived, tone: 'archived' },
      { k: 'Tiempo estimado ahorrado', v: m.saved, tone: 'done' },
      { k: 'Riesgos sin revisar', v: m.risks, tone: m.risks ? 'risk' : 'done' }
    ];
    el.metrics.innerHTML = items.map(function (it) {
      return '<div class="sbx-metric sbx-tone-' + it.tone + '"><strong>' + esc(it.v) + '</strong><span>' + esc(it.k) + '</span></div>';
    }).join('');
  }

  /* --- Filtros de la bandeja --- */
  function renderFilters(business, cases) {
    var counts = { all: cases.length, urgent: 0, later: 0, risk: 0, archived: 0 };
    cases.forEach(function (c) {
      var st = statusMeta(business, c.status);
      if (c.urgency === 'alta' || st.tone === 'urgent') counts.urgent++;
      if (st.tone === 'wait') counts.later++;
      if (st.tone === 'archived') counts.archived++;
      if ((c.tags || []).length) counts.risk++;
    });
    var defs = [
      { id: 'all', label: 'Todos' },
      { id: 'urgent', label: 'Urgentes' },
      { id: 'later', label: 'Para después' },
      { id: 'risk', label: 'Con riesgo' },
      { id: 'archived', label: 'Archivados' }
    ];
    el.filters.innerHTML = defs.map(function (f) {
      var active = f.id === state.filter ? ' active' : '';
      return '<button class="sbx-filter' + active + '" data-filter="' + f.id + '">' +
        esc(f.label) + '<span>' + (counts[f.id] || 0) + '</span></button>';
    }).join('');
  }

  function passesFilter(business, c) {
    if (state.filter === 'all') return true;
    var st = statusMeta(business, c.status);
    if (state.filter === 'urgent') return c.urgency === 'alta' || st.tone === 'urgent';
    if (state.filter === 'later') return st.tone === 'wait';
    if (state.filter === 'archived') return st.tone === 'archived';
    if (state.filter === 'risk') return (c.tags || []).length > 0;
    return true;
  }

  /* --- Bandeja omnicanal --- */
  function renderInbox(business, cases) {
    var visible = cases.filter(function (c) { return passesFilter(business, c); });
    if (!visible.length) {
      el.inbox.innerHTML = '<div class="sbx-empty"><strong>Sin mensajes en esta vista</strong>' +
        '<span>Prueba otro filtro o pulsa «Simular entrada de mensajes».</span></div>';
      return;
    }
    el.inbox.innerHTML = visible.map(function (c) {
      var st = statusMeta(business, c.status);
      var sel = c.id === state.selectedCaseId ? ' selected' : '';
      var newDot = c.isNew ? '<span class="sbx-new-dot" title="Nuevo"></span>' : '';
      return '<button class="sbx-item' + sel + '" data-case="' + c.id + '">' +
        '<div class="sbx-item-top">' + channelBadge(c.channel) + urgencyDot(c.urgency) +
        '<span class="sbx-time">' + esc(c.time) + '</span>' + newDot + '</div>' +
        '<div class="sbx-item-person">' + esc(c.person) + '</div>' +
        '<div class="sbx-item-subject">' + esc(c.subject) + '</div>' +
        '<div class="sbx-item-snippet">' + esc(c.snippet) + '</div>' +
        '<div class="sbx-item-foot"><span class="sbx-status sbx-tone-' + st.tone + '">' + esc(st.label) + '</span>' +
        tagBadges(c.tags) + '</div>' +
        '</button>';
    }).join('');
  }

  /* --- Panel de caso --- */
  function renderCasePanel(business, cases) {
    var c = cases.filter(function (x) { return x.id === state.selectedCaseId; })[0];
    if (!c) {
      el.casePanel.innerHTML = '<div class="sbx-case-empty">' +
        '<div class="sbx-case-empty-mark">Atlas</div>' +
        '<strong>Selecciona un mensaje</strong>' +
        '<span>Atlas lo mostrará convertido en un caso ordenado: resumen, origen, estado, historial y sugerencias.</span>' +
        '</div>';
      return;
    }
    var st = statusMeta(business, c.status);

    var actions = business.statuses.map(function (s) {
      var active = s.id === c.status ? ' active' : '';
      return '<button class="sbx-action sbx-tone-' + s.tone + active + '" data-status="' + s.id + '">' + esc(s.label) + '</button>';
    }).join('');

    var history = (c.history || []).map(function (h) {
      return '<li><span class="sbx-h-time">' + esc(h.time) + '</span><span class="sbx-h-label">' + esc(h.label) + '</span></li>';
    }).join('');

    var docs = (c.documents || []).length
      ? '<div class="sbx-docs"><h4>Documentos ficticios asociados</h4><ul>' +
        c.documents.map(function (d) {
          return '<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>' +
            '<span><strong>' + esc(d.name) + '</strong><small>' + esc(d.type) + '</small></span></li>';
        }).join('') + '</ul></div>'
      : '';

    var sug = renderSuggestions(c);

    el.casePanel.innerHTML =
      '<div class="sbx-case-head">' +
        '<div class="sbx-case-meta">' + channelBadge(c.channel) +
          '<span class="sbx-status sbx-tone-' + st.tone + '">' + esc(st.label) + '</span>' +
          tagBadges(c.tags) + '</div>' +
        '<h3>' + esc(c.subject) + '</h3>' +
        '<div class="sbx-case-facts">' +
          fact('Cliente', c.person) +
          fact('Canal de origen', CHANNELS[c.channel] ? CHANNELS[c.channel].label + ' (simulado)' : c.channel) +
          fact('Área / tipo', c.area || '—') +
          fact('Urgencia', { alta: 'Alta', media: 'Media', baja: 'Baja' }[c.urgency] || 'Media') +
        '</div>' +
      '</div>' +
      '<div class="sbx-summary"><span>Resumen limpio</span><p>' + esc(c.body) + '</p></div>' +
      docs +
      '<div class="sbx-actions-block"><h4>Acciones rápidas · cambiar estado</h4><div class="sbx-actions">' + actions + '</div>' +
        '<p class="sbx-actions-note">El profesional decide. Atlas solo ordena y propone.</p></div>' +
      '<div class="sbx-history"><h4>Historial simulado</h4><ul>' + history + '</ul></div>' +
      sug;
  }

  function fact(label, value) {
    return '<div class="sbx-fact"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
  }

  /* --- Sugerencias Atlas (bloque plegable, secundario) --- */
  function renderSuggestions(c) {
    var s = c.suggestions;
    if (!s) return '';
    var blocks = '';
    if (s.draft) {
      blocks += '<div class="sbx-sg-block"><h5>Borrador opcional</h5><p class="sbx-draft">' + esc(s.draft) + '</p></div>';
    }
    if (s.documents && s.documents.length) {
      blocks += '<div class="sbx-sg-block"><h5>Posibles documentos a revisar</h5><ul>' +
        s.documents.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>';
    }
    if (s.checklist && s.checklist.length) {
      blocks += '<div class="sbx-sg-block"><h5>Checklist orientativo</h5><ul class="sbx-check">' +
        s.checklist.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>';
    }
    if (s.risks && s.risks.length) {
      blocks += '<div class="sbx-sg-block"><h5>Riesgos a tener en cuenta</h5><ul class="sbx-risks">' +
        s.risks.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>';
    }
    if (!blocks) {
      blocks = '<p class="sbx-sg-empty">Sin sugerencias para este caso.</p>';
    }
    return '<details class="sbx-suggestions">' +
      '<summary><span class="sbx-sg-tag">Asistencia secundaria</span>Sugerencias Atlas' +
      '<span class="sbx-sg-caret" aria-hidden="true">+</span></summary>' +
      '<div class="sbx-sg-body">' + blocks +
      '<p class="sbx-sg-note">Requiere revisión profesional. Atlas prepara; el profesional decide.</p>' +
      '</div></details>';
  }

  /* ---------- Render maestro ---------- */
  function render() {
    var business = getBusiness(state.businessId);
    var cases = state.cases[state.businessId];
    renderSelector();
    renderBusinessHead(business);
    renderMetrics(business, cases);
    renderFilters(business, cases);
    renderInbox(business, cases);
    renderCasePanel(business, cases);
  }

  /* ===================================================================
     SIMULACIÓN DE NUEVOS MENSAJES
     =================================================================== */
  function simulateMessages() {
    var business = getBusiness(state.businessId);
    var pool = business.pool || [];
    if (!pool.length) return;

    var count = 1 + Math.floor(Math.random() * 3); // 1-3
    var cases = state.cases[state.businessId];
    var added = [];

    for (var i = 0; i < count; i++) {
      var tpl = pool[Math.floor(Math.random() * pool.length)];
      var newCase = buildCase(business, {
        id: uid('sim'),
        channel: tpl.channel,
        person: tpl.person,
        area: tpl.area,
        subject: tpl.subject,
        snippet: tpl.snippet,
        body: tpl.snippet,
        urgency: tpl.urgency,
        status: business.defaultStatus,
        time: nowTime(),
        tags: tpl.tags,
        history: [{ time: nowTime(), label: 'Entrada simulada recibida por ' + (CHANNELS[tpl.channel] ? CHANNELS[tpl.channel].label : tpl.channel) }],
        documents: tpl.channel === 'document' || tpl.channel === 'email' ? [{ name: 'adjunto-simulado.pdf', type: 'Adjunto (simulado)' }] : [],
        suggestions: {
          draft: 'Hola, hemos recibido tu mensaje y lo estamos revisando. Te respondemos enseguida.',
          documents: [],
          checklist: ['Revisar el mensaje', 'Asignar estado', 'Responder al cliente'],
          risks: (tpl.tags || []).length ? ['Posible asunto sensible: requiere revisión profesional'] : []
        }
      }, { isNew: true });
      cases.unshift(newCase);
      added.push(newCase);
    }

    persist();
    render();
    flashToast(count + (count === 1 ? ' mensaje simulado nuevo' : ' mensajes simulados nuevos') + ' en la bandeja');
    // resalta brevemente las nuevas entradas
    if (el.inbox) el.inbox.scrollTop = 0;
  }

  var toastTimer = null;
  function flashToast(msg) {
    if (!el.toast) return;
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove('show'); }, 2600);
  }

  /* ===================================================================
     EVENTOS
     =================================================================== */
  function selectBusiness(id) {
    if (state.businessId === id) return;
    state.businessId = id;
    state.selectedCaseId = null;
    state.filter = 'all';
    if (!state.cases[id]) state.cases[id] = loadCases(id);
    render();
  }

  function selectCase(id) {
    state.selectedCaseId = id;
    var cases = state.cases[state.businessId];
    var c = cases.filter(function (x) { return x.id === id; })[0];
    if (c) c.isNew = false;
    render();
    // En móvil, lleva el foco al panel de caso
    if (window.matchMedia('(max-width: 920px)').matches && el.casePanel) {
      el.casePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function changeStatus(statusId) {
    var cases = state.cases[state.businessId];
    var c = cases.filter(function (x) { return x.id === state.selectedCaseId; })[0];
    if (!c) return;
    c.status = statusId;
    persist();
    render();
  }

  function resetSandbox() {
    Store.clear();
    state.cases = {};
    state.selectedCaseId = null;
    state.filter = 'all';
    state.cases[state.businessId] = loadCases(state.businessId);
    render();
    flashToast('Demo restablecida a su estado inicial');
  }

  function bind() {
    el.selector.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-business]');
      if (btn) selectBusiness(btn.getAttribute('data-business'));
    });
    el.inbox.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-case]');
      if (btn) selectCase(btn.getAttribute('data-case'));
    });
    el.filters.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (btn) { state.filter = btn.getAttribute('data-filter'); render(); }
    });
    el.casePanel.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-status]');
      if (btn) changeStatus(btn.getAttribute('data-status'));
    });
    if (el.simulate) el.simulate.addEventListener('click', simulateMessages);
    if (el.reset) el.reset.addEventListener('click', resetSandbox);
  }

  /* ---------- Init ---------- */
  function init() {
    el.selector = document.getElementById('sbxSelector');
    el.bizHead = document.getElementById('sbxBizHead');
    el.metrics = document.getElementById('sbxMetrics');
    el.filters = document.getElementById('sbxFilters');
    el.inbox = document.getElementById('sbxInbox');
    el.casePanel = document.getElementById('sbxCasePanel');
    el.simulate = document.getElementById('sbxSimulate');
    el.reset = document.getElementById('sbxReset');
    el.toast = document.getElementById('sbxToast');

    if (!el.selector || !el.inbox) return;

    state.cases[state.businessId] = loadCases(state.businessId);
    bind();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

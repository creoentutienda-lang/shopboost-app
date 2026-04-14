(function () {
  'use strict';

  // Obtener store_id desde la URL del script (?store=12345) o desde el contexto de Tiendanube
  var scriptEl = document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
  var scriptSrc = scriptEl ? scriptEl.src : '';
  var storeId = null;
  try {
    storeId = new URL(scriptSrc).searchParams.get('store');
  } catch (e) {}

  // Fallback: detectar store_id desde el contexto global de Tiendanube
  if (!storeId) {
    try {
      storeId = (window.LS && window.LS.store && window.LS.store.id)
        ? String(window.LS.store.id)
        : null;
    } catch (e) {}
  }

  var config = null;
  var APP_URL = scriptSrc ? scriptSrc.split('/shopboost.js')[0] : 'https://shopboost-app-clvz.vercel.app';

  function loadConfig(cb) {
    if (!storeId) { cb(getDefaultConfig()); return; }
    fetch(APP_URL + '/api/config?store=' + storeId)
      .then(function (r) { return r.json(); })
      .then(function (data) { cb(data); })
      .catch(function () { cb(getDefaultConfig()); });
  }

  function getDefaultConfig() {
    return {
      active: true,
      textos: {
        btnPrincipal: 'Encontrá tu talle',
        btnSecundario: 'Tabla de talles',
        titulo: 'Encontra tu talle',
        subtitulo: 'Ingresa tus medidas y te decimos que talle elegir',
        btnCalcular: 'Calcular mi talle',
        btnCerrar: 'Entendido'
      },
      categorias: [
        {
          id: 'calzas',
          nombre: 'Calzas',
          talles: ['XS', 'S', 'M', 'L', 'XL'],
          medidas: [
            { nombre: 'Cintura (cm)', valores: ['60–64', '65–69', '70–75', '76–82', '83–90'] },
            { nombre: 'Cadera (cm)',  valores: ['86–90', '91–95', '96–101', '102–108', '109–116'] }
          ]
        },
        {
          id: 'remeras',
          nombre: 'Remeras / Tops',
          talles: ['S / 38', 'M / 40', 'L / 42', 'XL / 44'],
          medidas: [
            { nombre: 'Busto (cm)',   valores: ['83–87', '88–92', '93–97', '98–103'] },
            { nombre: 'Cintura (cm)', valores: ['67–71', '72–76', '77–81', '82–87'] }
          ]
        }
      ]
    };
  }

  // Parsea un rango como "60–64" o "60-64" → [60, 64]
  function parseRange(str) {
    var m = String(str).match(/(\d+(?:\.\d+)?)\s*[–\-]\s*(\d+(?:\.\d+)?)/);
    if (m) return [parseFloat(m[1]), parseFloat(m[2])];
    var single = parseFloat(str);
    if (!isNaN(single)) return [single, single];
    return null;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    loadConfig(function (cfg) {
      config = cfg;
      if (!config.active) return;
      insertStyles();
      insertTalleButtons();
    });
  }

  function insertStyles() {
    if (document.getElementById('shopboost-styles')) return;
    var style = document.createElement('style');
    style.id = 'shopboost-styles';
    style.textContent = [
      '.sb-talle-wrap{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}',
      '.sb-btn{padding:13px 16px;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s;font-family:inherit}',
      '.sb-btn:hover{opacity:.85}',
      '.sb-btn-primary{background:#111;color:#fff;border:none}',
      '.sb-btn-secondary{background:transparent;color:#111;border:1.5px solid #ddd}',
      '.sb-btn-secondary:hover{border-color:#111}',
      '.sb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99999;display:flex;align-items:flex-end;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s}',
      '.sb-overlay.sb-open{opacity:1;pointer-events:all}',
      '.sb-modal{background:#fff;width:100%;max-width:480px;border-radius:16px 16px 0 0;padding:28px 24px 36px;transform:translateY(100%);transition:transform .32s cubic-bezier(.34,1.2,.64,1);max-height:88vh;overflow-y:auto;position:relative}',
      '.sb-overlay.sb-open .sb-modal{transform:translateY(0)}',
      '.sb-handle{width:36px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 20px}',
      '.sb-modal-close{position:absolute;top:16px;right:16px;width:30px;height:30px;border-radius:50%;border:1px solid #e0e0e0;background:#f5f5f5;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit}',
      '.sb-modal h3{font-size:22px;font-weight:600;margin:0 0 6px}',
      '.sb-modal-sub{font-size:14px;color:#777;margin-bottom:22px}',
      '.sb-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}',
      '.sb-tab{padding:7px 15px;border-radius:999px;font-size:13px;font-weight:600;border:1.5px solid #e0e0e0;background:transparent;cursor:pointer;transition:all .18s;font-family:inherit}',
      '.sb-tab.sb-active{background:#111;color:#fff;border-color:#111}',
      '.sb-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}',
      '.sb-field label{display:block;font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#888;margin-bottom:5px}',
      '.sb-field input{width:100%;padding:11px 12px;border:1.5px solid #e0e0e0;border-radius:4px;font-size:15px;font-family:inherit;outline:none;transition:border-color .18s}',
      '.sb-field input:focus{border-color:#111}',
      '.sb-how{font-size:12px;color:#888;margin-bottom:20px;cursor:pointer;text-decoration:underline;background:none;border:none;font-family:inherit}',
      '.sb-calc-btn{width:100%;background:#111;color:#fff;border:none;padding:16px;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border-radius:4px;cursor:pointer;font-family:inherit;margin-bottom:14px}',
      '.sb-result{background:#f0faf0;border:1px solid #b8dfb8;border-radius:10px;padding:18px;text-align:center;display:none}',
      '.sb-result.sb-show{display:block}',
      '.sb-result-talle{font-size:44px;font-weight:700;color:#2a6a2a;line-height:1;margin-bottom:5px}',
      '.sb-result-texto{font-size:14px;color:#2a6a2a;font-weight:500}',
      '.sb-result-nota{font-size:12px;color:#888;margin-top:8px}',
      '.sb-tabla{width:100%;border-collapse:collapse;font-size:14px;margin-bottom:12px}',
      '.sb-tabla th{background:#f5f5f5;padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase;font-weight:700;color:#888}',
      '.sb-tabla td{padding:11px 12px;border-bottom:1px solid #f0f0f0}',
      '.sb-tabla tr:last-child td{border-bottom:none}',
      '.sb-tabla-nota{font-size:12px;color:#888;line-height:1.5}',
      '@media(max-width:480px){.sb-talle-wrap{grid-template-columns:1fr}.sb-fields{grid-template-columns:1fr}}'
    ].join('');
    document.head.appendChild(style);
  }

  function insertTalleButtons() {
    var targets = [
      '.product-variants', '.js-product-variants', '.product-form__variants',
      '[data-store="product-variants"]', '.add-to-cart-button', '.js-add-to-cart',
      'form[action*="cart"]'
    ];
    var anchor = null;
    for (var i = 0; i < targets.length; i++) {
      anchor = document.querySelector(targets[i]);
      if (anchor) break;
    }
    if (!anchor) { setTimeout(insertTalleButtons, 2000); return; }
    if (document.getElementById('sb-talle-wrap')) return;

    var t = config.textos || {};
    var wrap = document.createElement('div');
    wrap.id = 'sb-talle-wrap';
    wrap.className = 'sb-talle-wrap';
    wrap.innerHTML =
      '<button class="sb-btn sb-btn-primary" onclick="window.SB.openModal(\'sb-calc\')">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
        esc(t.btnPrincipal || 'Encontrá tu talle') +
      '</button>' +
      '<button class="sb-btn sb-btn-secondary" onclick="window.SB.openModal(\'sb-tabla\')">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>' +
        esc(t.btnSecundario || 'Tabla de talles') +
      '</button>';
    anchor.parentNode.insertBefore(wrap, anchor);
    insertModals();
  }

  function buildTabsHtml(cats) {
    return cats.map(function (cat, idx) {
      var cls = 'sb-tab' + (idx === 0 ? ' sb-active' : '');
      return '<button class="' + cls + '" data-catidx="' + idx + '" onclick="window.SB.setCategoria(' + idx + ',this)">' + esc(cat.nombre) + '</button>';
    }).join('');
  }

  function buildTablaHtml(cats) {
    if (!cats || cats.length === 0) return '';

    var tabs = cats.length > 1
      ? '<div class="sb-tabs" style="margin-bottom:14px">' +
          cats.map(function (cat, idx) {
            var cls = 'sb-tab' + (idx === 0 ? ' sb-active' : '');
            return '<button class="' + cls + '" onclick="window.SB.setTabla(' + idx + ',this)">' + esc(cat.nombre) + '</button>';
          }).join('') +
        '</div>'
      : '';

    var tablas = cats.map(function (cat, idx) {
      var talles = cat.talles || [];
      var medidas = cat.medidas || [];
      var thead = '<thead><tr><th>Talle</th>' +
        medidas.map(function (m) { return '<th>' + esc(m.nombre) + '</th>'; }).join('') +
        '</tr></thead>';
      var tbody = '<tbody>' + talles.map(function (talle, ti) {
        return '<tr><td><strong>' + esc(talle) + '</strong></td>' +
          medidas.map(function (m) { return '<td>' + esc((m.valores || [])[ti] || '') + '</td>'; }).join('') +
          '</tr>';
      }).join('') + '</tbody>';
      var display = idx === 0 ? '' : ' style="display:none"';
      return '<div class="sb-tabla-panel" data-tabla-idx="' + idx + '"' + display + '>' +
        '<table class="sb-tabla">' + thead + tbody + '</table>' +
        '</div>';
    }).join('');

    return tabs + tablas;
  }

  function insertModals() {
    if (document.getElementById('sb-modals')) return;
    var cats = config.categorias || [];
    var t = config.textos || {};

    var container = document.createElement('div');
    container.id = 'sb-modals';
    container.innerHTML =
      '<div class="sb-overlay" id="sb-calc" onclick="window.SB.closeOutside(event,\'sb-calc\')">' +
        '<div class="sb-modal">' +
          '<div class="sb-handle"></div>' +
          '<button class="sb-modal-close" onclick="window.SB.closeModal(\'sb-calc\')">&#x2715;</button>' +
          '<h3>' + esc(t.titulo || 'Encontra tu talle') + '</h3>' +
          '<p class="sb-modal-sub">' + esc(t.subtitulo || 'Ingresa tus medidas y te decimos que talle elegir') + '</p>' +
          '<div class="sb-tabs">' + buildTabsHtml(cats) + '</div>' +
          '<div class="sb-fields" id="sb-fields"></div>' +
          '<button class="sb-how" onclick="window.SB.openModal(\'sb-guia\')">Como tomar mis medidas?</button>' +
          '<button class="sb-calc-btn" onclick="window.SB.calcular()">' + esc(t.btnCalcular || 'Calcular mi talle') + '</button>' +
          '<div class="sb-result" id="sb-result">' +
            '<div class="sb-result-talle" id="sb-result-talle"></div>' +
            '<div class="sb-result-texto" id="sb-result-texto">Tu talle recomendado</div>' +
            '<div class="sb-result-nota">Si estas entre dos talles, te recomendamos el mas grande para mayor comodidad.</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sb-overlay" id="sb-tabla" onclick="window.SB.closeOutside(event,\'sb-tabla\')">' +
        '<div class="sb-modal">' +
          '<div class="sb-handle"></div>' +
          '<button class="sb-modal-close" onclick="window.SB.closeModal(\'sb-tabla\')">&#x2715;</button>' +
          '<h3>Tabla de talles</h3>' +
          '<p class="sb-modal-sub">Medidas para tu talla — ' + esc((cats[0] || {}).nombre || '') + '</p>' +
          buildTablaHtml(cats) +
          '<p class="sb-tabla-nota">Si estas entre dos talles, te recomendamos el mas grande para mayor comodidad.</p>' +
        '</div>' +
      '</div>' +
      '<div class="sb-overlay" id="sb-guia" onclick="window.SB.closeOutside(event,\'sb-guia\')">' +
        '<div class="sb-modal">' +
          '<div class="sb-handle"></div>' +
          '<button class="sb-modal-close" onclick="window.SB.closeModal(\'sb-guia\')">&#x2715;</button>' +
          '<h3>Como tomar tus medidas</h3>' +
          '<p class="sb-modal-sub">Usa una cinta metrica y medi de esta manera:</p>' +
          '<div>' +
            '<div style="display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #f0f0f0">' +
              '<span style="font-size:22px;flex-shrink:0">&#128207;</span>' +
              '<div><strong>Cintura</strong><br><span style="font-size:13px;color:#777">La parte mas angosta de tu torso, por encima del ombligo. No aprietes la cinta.</span></div>' +
            '</div>' +
            '<div style="display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #f0f0f0">' +
              '<span style="font-size:22px;flex-shrink:0">&#128208;</span>' +
              '<div><strong>Cadera</strong><br><span style="font-size:13px;color:#777">La parte mas ancha de tus caderas y cola, unos 20 cm debajo de la cintura.</span></div>' +
            '</div>' +
            '<div style="display:flex;gap:14px;padding:16px 0">' +
              '<span style="font-size:22px;flex-shrink:0">&#128207;</span>' +
              '<div><strong>Busto</strong><br><span style="font-size:13px;color:#777">Pasa la cinta por la parte mas amplia del pecho, sin apretar.</span></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(container);
    renderCampos(0);
  }

  window.SB = {
    catIdx: 0,
    openModal: function (id) { document.getElementById(id) && document.getElementById(id).classList.add('sb-open'); document.body.style.overflow = 'hidden'; },
    closeModal: function (id) { document.getElementById(id) && document.getElementById(id).classList.remove('sb-open'); document.body.style.overflow = ''; },
    closeOutside: function (e, id) { if (e.target.id === id) this.closeModal(id); },
    setTabla: function (idx, btn) {
      document.querySelectorAll('.sb-tabla-panel').forEach(function (p) { p.style.display = 'none'; });
      var panel = document.querySelector('.sb-tabla-panel[data-tabla-idx="' + idx + '"]');
      if (panel) panel.style.display = '';
      document.querySelectorAll('#sb-tabla .sb-tab').forEach(function (t) { t.classList.remove('sb-active'); });
      btn.classList.add('sb-active');
    },
    setCategoria: function (idx, btn) {
      this.catIdx = idx;
      document.querySelectorAll('.sb-tab').forEach(function (t) { t.classList.remove('sb-active'); });
      btn.classList.add('sb-active');
      renderCampos(idx);
      var res = document.getElementById('sb-result');
      if (res) res.classList.remove('sb-show');
    },
    calcular: function () {
      var cats = config.categorias || [];
      var cat = cats[this.catIdx];
      if (!cat) return;

      var medidas = cat.medidas || [];
      var talles = cat.talles || [];
      var vals = {};
      var ok = true;

      medidas.forEach(function (m) {
        var el = document.getElementById('sb-input-' + m._fieldId);
        var v = parseFloat(el ? el.value : '');
        if (!el || isNaN(v) || v < 20 || v > 250) {
          ok = false;
          if (el) el.style.borderColor = '#e24b4a';
        } else {
          vals[m._fieldId] = { val: v, valores: m.valores };
          if (el) el.style.borderColor = '';
        }
      });
      if (!ok) return;

      var scores = {};
      talles.forEach(function (t) { scores[t] = 0; });

      Object.values(vals).forEach(function (entry) {
        talles.forEach(function (talle, ti) {
          var range = parseRange((entry.valores || [])[ti]);
          if (!range) return;
          var min = range[0], max = range[1], v = entry.val;
          if (v >= min && v <= max) scores[talle] += 2;
          else if (v < min) scores[talle] -= (min - v) * 0.1;
          else scores[talle] -= (v - max) * 0.1;
        });
      });

      var rec = talles.reduce(function (a, b) { return scores[a] >= scores[b] ? a : b; }, talles[0]);
      document.getElementById('sb-result-talle').textContent = rec;
      document.getElementById('sb-result-texto').textContent = 'Tu talle ideal es ' + rec;
      var res = document.getElementById('sb-result');
      if (res) res.classList.add('sb-show');
    }
  };

  function renderCampos(idx) {
    var cats = config.categorias || [];
    var cat = cats[idx];
    var container = document.getElementById('sb-fields');
    if (!container || !cat) return;
    var medidas = cat.medidas || [];
    container.innerHTML = medidas.map(function (m, i) {
      var fid = 'f' + idx + '_' + i;
      m._fieldId = fid;
      return '<div class="sb-field">' +
        '<label for="sb-input-' + fid + '">' + esc(m.nombre) + '</label>' +
        '<input type="number" id="sb-input-' + fid + '" placeholder="ej: 80" min="20" max="250">' +
        '</div>';
    }).join('');
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();

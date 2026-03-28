(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShopBoost);
  } else {
    initShopBoost();
  }

  function initShopBoost() {
    insertStyles();
    insertTalleButtons();
  }

  function insertStyles() {
    if (document.getElementById('shopboost-styles')) return;
    const style = document.createElement('style');
    style.id = 'shopboost-styles';
    style.textContent = `
      .sb-talle-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0; }
      .sb-btn { padding: 13px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 0.2s; font-family: inherit; }
      .sb-btn:hover { opacity: 0.85; }
      .sb-btn-primary { background: #111; color: #fff; border: none; }
      .sb-btn-secondary { background: transparent; color: #111; border: 1.5px solid #ddd; }
      .sb-btn-secondary:hover { border-color: #111; }
      .sb-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99999; display: flex; align-items: flex-end; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.25s; }
      .sb-overlay.sb-open { opacity: 1; pointer-events: all; }
      .sb-modal { background: #fff; width: 100%; max-width: 480px; border-radius: 16px 16px 0 0; padding: 28px 24px 36px; transform: translateY(100%); transition: transform 0.32s cubic-bezier(0.34,1.2,0.64,1); max-height: 88vh; overflow-y: auto; position: relative; }
      .sb-overlay.sb-open .sb-modal { transform: translateY(0); }
      .sb-handle { width: 36px; height: 4px; background: #e0e0e0; border-radius: 2px; margin: 0 auto 20px; }
      .sb-modal-close { position: absolute; top: 16px; right: 16px; width: 30px; height: 30px; border-radius: 50%; border: 1px solid #e0e0e0; background: #f5f5f5; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-family: inherit; }
      .sb-modal h3 { font-size: 22px; font-weight: 600; margin: 0 0 6px; }
      .sb-modal-sub { font-size: 14px; color: #777; margin-bottom: 22px; }
      .sb-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
      .sb-tab { padding: 7px 15px; border-radius: 999px; font-size: 13px; font-weight: 600; border: 1.5px solid #e0e0e0; background: transparent; cursor: pointer; transition: all 0.18s; font-family: inherit; }
      .sb-tab.sb-active { background: #111; color: #fff; border-color: #111; }
      .sb-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
      .sb-field label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: #888; margin-bottom: 5px; }
      .sb-field input { width: 100%; padding: 11px 12px; border: 1.5px solid #e0e0e0; border-radius: 4px; font-size: 15px; font-family: inherit; outline: none; transition: border-color 0.18s; }
      .sb-field input:focus { border-color: #111; }
      .sb-how { font-size: 12px; color: #888; margin-bottom: 20px; cursor: pointer; text-decoration: underline; background: none; border: none; font-family: inherit; }
      .sb-calc-btn { width: 100%; background: #111; color: #fff; border: none; padding: 16px; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 4px; cursor: pointer; font-family: inherit; margin-bottom: 14px; }
      .sb-result { background: #f0faf0; border: 1px solid #b8dfb8; border-radius: 10px; padding: 18px; text-align: center; display: none; }
      .sb-result.sb-show { display: block; }
      .sb-result-talle { font-size: 44px; font-weight: 700; color: #2a6a2a; line-height: 1; margin-bottom: 5px; }
      .sb-result-texto { font-size: 14px; color: #2a6a2a; font-weight: 500; }
      .sb-result-nota { font-size: 12px; color: #888; margin-top: 8px; }
      .sb-tabla { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 12px; }
      .sb-tabla th { background: #f5f5f5; padding: 9px 12px; text-align: left; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #888; }
      .sb-tabla td { padding: 11px 12px; border-bottom: 1px solid #f0f0f0; }
      .sb-tabla tr:last-child td { border-bottom: none; }
      .sb-tabla-nota { font-size: 12px; color: #888; line-height: 1.5; }
      @media (max-width: 480px) {
        .sb-talle-wrap { grid-template-columns: 1fr; }
        .sb-fields { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function insertTalleButtons() {
    const targets = [
      '.product-variants',
      '.js-product-variants',
      '.product-form__variants',
      '[data-store="product-variants"]',
      '.add-to-cart-button',
      '.js-add-to-cart',
      'form[action*="cart"]'
    ];
    let anchor = null;
    for (const sel of targets) {
      anchor = document.querySelector(sel);
      if (anchor) break;
    }
    if (!anchor) { setTimeout(insertTalleButtons, 2000); return; }
    if (document.getElementById('sb-talle-wrap')) return;
    const wrap = document.createElement('div');
    wrap.id = 'sb-talle-wrap';
    wrap.className = 'sb-talle-wrap';
    wrap.innerHTML = `
      <button class="sb-btn sb-btn-primary" onclick="window.SB.openModal('sb-calc')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Encontra tu talle
      </button>
      <button class="sb-btn sb-btn-secondary" onclick="window.SB.openModal('sb-tabla')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
        Tabla de talles
      </button>`;
    anchor.parentNode.insertBefore(wrap, anchor);
    insertModals();
  }

  function insertModals() {
    if (document.getElementById('sb-modals')) return;
    const container = document.createElement('div');
    container.id = 'sb-modals';
    container.innerHTML = `
      <div class="sb-overlay" id="sb-calc" onclick="window.SB.closeOutside(event,'sb-calc')">
        <div class="sb-modal">
          <div class="sb-handle"></div>
          <button class="sb-modal-close" onclick="window.SB.closeModal('sb-calc')">&#x2715;</button>
          <h3>Encontra tu talle</h3>
          <p class="sb-modal-sub">Ingresa tus medidas y te decimos que talle elegir</p>
          <div class="sb-tabs">
            <button class="sb-tab sb-active" onclick="window.SB.setCategoria('Calza',this)">Calza</button>
            <button class="sb-tab" onclick="window.SB.setCategoria('Top',this)">Top / Remera</button>
            <button class="sb-tab" onclick="window.SB.setCategoria('Pantalon',this)">Pantalon</button>
          </div>
          <div class="sb-fields" id="sb-fields"></div>
          <button class="sb-how" onclick="window.SB.openModal('sb-guia')">Como tomar mis medidas?</button>
          <button class="sb-calc-btn" onclick="window.SB.calcular()">Calcular mi talle</button>
          <div class="sb-result" id="sb-result">
            <div class="sb-result-talle" id="sb-result-talle">M</div>
            <div class="sb-result-texto" id="sb-result-texto">Tu talle recomendado</div>
            <div class="sb-result-nota">Si estas entre dos talles, te recomendamos el mas grande para mayor comodidad.</div>
          </div>
        </div>
      </div>
      <div class="sb-overlay" id="sb-tabla" onclick="window.SB.closeOutside(event,'sb-tabla')">
        <div class="sb-modal">
          <div class="sb-handle"></div>
          <button class="sb-modal-close" onclick="window.SB.closeModal('sb-tabla')">&#x2715;</button>
          <h3>Tabla de talles</h3>
          <p class="sb-modal-sub">Medidas reales para mujer — Argentina</p>
          <table class="sb-tabla">
            <thead><tr><th>Talle</th><th>Cintura</th><th>Cadera</th><th>Busto</th></tr></thead>
            <tbody>
              <tr><td><strong>XS / 36</strong></td><td>60-66 cm</td><td>86-92 cm</td><td>82-88 cm</td></tr>
              <tr><td><strong>S / 38</strong></td><td>66-72 cm</td><td>92-98 cm</td><td>88-94 cm</td></tr>
              <tr><td><strong>M / 40</strong></td><td>72-78 cm</td><td>98-104 cm</td><td>94-100 cm</td></tr>
              <tr><td><strong>L / 42</strong></td><td>78-86 cm</td><td>104-112 cm</td><td>100-108 cm</td></tr>
              <tr><td><strong>XL / 44</strong></td><td>86-94 cm</td><td>112-120 cm</td><td>108-116 cm</td></tr>
              <tr><td><strong>XXL / 46</strong></td><td>94-104 cm</td><td>120-130 cm</td><td>116-126 cm</td></tr>
              <tr><td><strong>XXXL / 48</strong></td><td>104-114 cm</td><td>130-140 cm</td><td>126-136 cm</td></tr>
            </tbody>
          </table>
          <p class="sb-tabla-nota">Si estas entre dos talles, te recomendamos el mas grande para mayor comodidad.</p>
        </div>
      </div>
      <div class="sb-overlay" id="sb-guia" onclick="window.SB.closeOutside(event,'sb-guia')">
        <div class="sb-modal">
          <div class="sb-handle"></div>
          <button class="sb-modal-close" onclick="window.SB.closeModal('sb-guia')">&#x2715;</button>
          <h3>Como tomar tus medidas</h3>
          <p class="sb-modal-sub">Usa una cinta metrica y medi de esta manera:</p>
          <div>
            <div style="display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #f0f0f0">
              <span style="font-size:22px;flex-shrink:0">&#128207;</span>
              <div><strong>Cintura</strong><br><span style="font-size:13px;color:#777">La parte mas angosta de tu torso, por encima del ombligo. No aprietes la cinta.</span></div>
            </div>
            <div style="display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #f0f0f0">
              <span style="font-size:22px;flex-shrink:0">&#128208;</span>
              <div><strong>Cadera</strong><br><span style="font-size:13px;color:#777">La parte mas ancha de tus caderas y cola, unos 20 cm debajo de la cintura.</span></div>
            </div>
            <div style="display:flex;gap:14px;padding:16px 0">
              <span style="font-size:22px;flex-shrink:0">&#128207;</span>
              <div><strong>Busto</strong><br><span style="font-size:13px;color:#777">Pasa la cinta por la parte mas amplia del pecho, sin apretar.</span></div>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(container);
    renderCampos('Calza');
  }

  window.SB = {
    categoriaActual: 'Calza',
    campos: {
      'Calza':    [{ id: 'cintura', label: 'Cintura (cm)' }, { id: 'cadera', label: 'Cadera (cm)' }],
      'Top':      [{ id: 'busto',   label: 'Busto (cm)'   }, { id: 'cintura', label: 'Cintura (cm)' }],
      'Pantalon': [{ id: 'cintura', label: 'Cintura (cm)' }, { id: 'cadera',  label: 'Cadera (cm)' }],
    },
    rangos: {
      cintura: { XS:[60,66], S:[66,72], M:[72,78], L:[78,86], XL:[86,94], XXL:[94,104], XXXL:[104,114] },
      cadera:  { XS:[86,92], S:[92,98], M:[98,104], L:[104,112], XL:[112,120], XXL:[120,130], XXXL:[130,140] },
      busto:   { XS:[82,88], S:[88,94], M:[94,100], L:[100,108], XL:[108,116], XXL:[116,126], XXXL:[126,136] },
    },
    openModal(id) { document.getElementById(id)?.classList.add('sb-open'); document.body.style.overflow = 'hidden'; },
    closeModal(id) { document.getElementById(id)?.classList.remove('sb-open'); document.body.style.overflow = ''; },
    closeOutside(e, id) { if (e.target.id === id) this.closeModal(id); },
    setCategoria(cat, btn) {
      this.categoriaActual = cat;
      document.querySelectorAll('.sb-tab').forEach(t => t.classList.remove('sb-active'));
      btn.classList.add('sb-active');
      renderCampos(cat);
      document.getElementById('sb-result')?.classList.remove('sb-show');
    },
    calcular() {
      const campos = this.campos[this.categoriaActual] || [];
      const vals = {};
      let ok = true;
      campos.forEach(c => {
        const el = document.getElementById('sb-input-' + c.id);
        const v = parseFloat(el?.value);
        if (!el || isNaN(v) || v < 40 || v > 180) {
          ok = false;
          if (el) el.style.borderColor = '#e24b4a';
        } else {
          vals[c.id] = v;
          if (el) el.style.borderColor = '';
        }
      });
      if (!ok) return;
      const talles = ['XS','S','M','L','XL','XXL','XXXL'];
      const scores = { XS:0, S:0, M:0, L:0, XL:0, XXL:0, XXXL:0 };
      Object.entries(vals).forEach(([campo, val]) => {
        if (!this.rangos[campo]) return;
        talles.forEach(t => {
          const [min, max] = this.rangos[campo][t];
          if (val >= min && val <= max) scores[t] += 2;
          else if (val < min) scores[t] -= (min - val) * 0.1;
          else scores[t] -= (val - max) * 0.1;
        });
      });
      const rec = talles.reduce((a, b) => scores[a] >= scores[b] ? a : b);
      const nombres = { XS:'XS (talle 36)', S:'S (talle 38)', M:'M (talle 40)', L:'L (talle 42)', XL:'XL (talle 44)', XXL:'XXL (talle 46)', XXXL:'XXXL (talle 48)' };
      document.getElementById('sb-result-talle').textContent = rec;
      document.getElementById('sb-result-texto').textContent = 'Tu talle ideal es ' + (nombres[rec] || rec);
      document.getElementById('sb-result')?.classList.add('sb-show');
    }
  };

  function renderCampos(cat) {
    const campos = window.SB.campos[cat] || [];
    const container = document.getElementById('sb-fields');
    if (!container) return;
    container.innerHTML = campos.map(c => `
      <div class="sb-field">
        <label for="sb-input-${c.id}">${c.label}</label>
        <input type="number" id="sb-input-${c.id}" placeholder="ej: 80" min="40" max="180">
      </div>`).join('');
  }

})();

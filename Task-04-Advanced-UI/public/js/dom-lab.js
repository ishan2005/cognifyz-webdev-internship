/**
 * DataVault Task 04 — DOM Manipulation Lab
 * Dynamically creates, styles, and removes DOM elements
 */
(function () {
  'use strict';

  const addBtn     = document.getElementById('addElemBtn');
  const clearBtn   = document.getElementById('clearAllBtn');
  const canvas     = document.getElementById('domCanvas');
  const empty      = document.getElementById('canvasEmpty');
  const counter    = document.getElementById('elemCount');
  const typeSelect = document.getElementById('elemType');
  const contentIn  = document.getElementById('elemContent');
  const colorPicker= document.getElementById('colorPicker');

  if (!addBtn) return;

  let count = 0;
  let selectedColor = 'blue';

  // Color picker
  colorPicker.querySelectorAll('.dv-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      colorPicker.querySelectorAll('.dv-color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.color;
    });
  });

  function updateCounter() {
    const els = canvas.querySelectorAll('.dv-dom-el').length;
    counter.textContent = els;
    empty.style.display = els === 0 ? 'flex' : 'none';
  }

  function buildElement(type, text, color) {
    const id = 'el-' + (++count);
    const label = text || typeSelect.options[typeSelect.selectedIndex].text.replace(/^.+ /, '');
    const el = document.createElement('div');
    el.className = `dv-dom-el dv-el-${color}`;
    el.id = id;

    // Actions
    const actions = `
      <div class="dv-dom-el-actions">
        <button class="dv-dom-el-btn" onclick="this.closest('.dv-dom-el').style.opacity='0.5'" title="Dim">👁</button>
        <button class="dv-dom-el-btn" onclick="this.closest('.dv-dom-el').style.opacity='1'" title="Restore">✨</button>
        <button class="dv-dom-el-btn del" onclick="removeEl('${id}')" title="Delete">✕</button>
      </div>`;

    if (type === 'card') {
      el.innerHTML = `${actions}
        <div style="font-weight:600;font-size:13px;margin-bottom:4px">📦 ${label}</div>
        <div style="font-size:12px;opacity:.8">Dynamically created card element · ID: <code>${id}</code></div>`;
    } else if (type === 'alert') {
      el.innerHTML = `${actions}
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600">
          <i class="bi bi-exclamation-triangle-fill"></i> ${label}
        </div>`;
    } else if (type === 'badge') {
      el.style.display = 'inline-flex';
      el.style.padding = '4px 14px';
      el.innerHTML = `${actions}<span style="font-size:12px;font-weight:700">🏷️ ${label}</span>`;
    } else if (type === 'progress') {
      const pct = Math.floor(Math.random() * 70) + 20;
      el.innerHTML = `${actions}
        <div style="font-size:12px;font-weight:600;margin-bottom:6px">📊 ${label} <span style="float:right">${pct}%</span></div>
        <div class="dv-dom-progress">
          <div class="dv-dom-progress-fill" style="width:0;background:currentColor" data-pct="${pct}"></div>
        </div>`;
      // Animate bar after insert
      setTimeout(() => {
        const bar = el.querySelector('.dv-dom-progress-fill');
        if (bar) bar.style.width = pct + '%';
      }, 50);
    } else if (type === 'code') {
      el.style.fontFamily = 'ui-monospace,Menlo,monospace';
      el.style.fontSize   = '12px';
      el.innerHTML = `${actions}
        <span style="opacity:.6">💻 // ${label}</span><br/>
        <span>const el = document.<span style="opacity:.7">createElement</span>(<span style="color:var(--dv-green)">'div'</span>);</span>`;
    }

    return el;
  }

  // Expose removeEl globally (called from inline onclick)
  window.removeEl = function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.style.transition = 'opacity .2s ease, transform .2s ease';
      el.style.opacity = '0';
      el.style.transform = 'scale(0.9)';
      setTimeout(() => { el.remove(); updateCounter(); }, 200);
    }
  };

  addBtn.addEventListener('click', () => {
    const type  = typeSelect.value;
    const text  = contentIn.value.trim();
    const color = selectedColor;
    const el    = buildElement(type, text, color);
    canvas.appendChild(el);
    contentIn.value = '';
    updateCounter();
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  clearBtn.addEventListener('click', () => {
    const els = canvas.querySelectorAll('.dv-dom-el');
    els.forEach(el => {
      el.style.transition = 'opacity .15s ease';
      el.style.opacity = '0';
    });
    setTimeout(() => {
      els.forEach(el => el.remove());
      updateCounter();
    }, 200);
  });

  // Enter key to add
  contentIn.addEventListener('keydown', e => {
    if (e.key === 'Enter') addBtn.click();
  });

  updateCounter();
})();

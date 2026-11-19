/* ==========================================================================
   REPUESTOS SALAZAR Y MONGE — logica del sitio (plan A Medida)
   Catalogo filtrable, consulta armada por WhatsApp, marcas, calificacion
   publica de Google, anos de trayectoria, horario y mapa.
   Depende de js/core.js (NEGOCIO, waLink).
   ========================================================================== */

/* --------------------------------------------------------------------------
   BANDERAS — funciones construidas que se encienden o apagan con una linea.
   El estado y la fuente de cada una estan en PENDIENTES-CLIENTE.md
   -------------------------------------------------------------------------- */
const SM_ENVIOS           = true;   // Encomiendas y mensajeria en la GAM: lo dice su sitio Wix. Confirmar que sigue vigente.
const SM_DIRECCIONES      = true;   // Direcciones hidraulicas: pagina "Servicios" de su sitio Wix. Confirmar.
const SM_MARCAS_REPUESTOS = true;   // ACDelco, Motorcraft, Mopar...: pagina "Marcas" de su sitio Wix. Confirmar.
const SM_MARCAS_EXTRA     = false;  // Buick, Pontiac, Cadillac y versiones argentina/brasilena: estan en su Wix, pero el cliente no las listo.
const SM_CITAS_WHATSAPP   = false;  // Solicitud de cita por WhatsApp. Hoy las citas se agendan por telefono.

const BANDERAS = {
  envios: SM_ENVIOS,
  direcciones: SM_DIRECCIONES,
  marcasRepuestos: SM_MARCAS_REPUESTOS,
  marcasExtra: SM_MARCAS_EXTRA,
  citasWhatsapp: SM_CITAS_WHATSAPP
};

(function(){
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const lista = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1];

  function aviso(txt){
    const a = $('#aviso');
    if (!a) return;
    a.textContent = '';
    setTimeout(() => { a.textContent = txt; }, 40);
  }

  /* ---------- Banderas ---------- */
  function initBanderas(){
    $$('[data-flag]').forEach(el => { el.hidden = !BANDERAS[el.dataset.flag]; });
  }

  /* ---------- Google: calificacion publica real (sin resenas inventadas) ---------- */
  function initGoogle(){
    const g = NEGOCIO.google || {};
    if (!g.rating || !g.total){
      $$('.rating').forEach(el => { el.hidden = true; });
      $$('.proof-g').forEach(el => { el.closest('li').hidden = true; });
      return;
    }
    $$('[data-g]').forEach(el => { el.textContent = g[el.dataset.g]; });
    $$('[data-g-link]').forEach(el => { if (g.url) el.href = g.url; });
    const r = parseFloat(g.rating), on = $('#stars-on');
    if (on && !isNaN(r)){
      on.style.setProperty('--full', Math.floor(r));
      on.style.setProperty('--frac', (r - Math.floor(r)).toFixed(2));
    }
  }

  /* ---------- Anos de trayectoria: se calculan, no se escriben a mano ---------- */
  function initAnios(){
    if (!NEGOCIO.tallerDesde){ $$('.tray__num').forEach(el => { el.hidden = true; }); return; }
    const anios = new Date().getFullYear() - NEGOCIO.tallerDesde;
    $$('[data-anios-txt]').forEach(el => { el.textContent = anios; });
    $$('[data-anios]').forEach(el => {
      el.textContent = anios;
      if (reduce || !('IntersectionObserver' in window)) return;
      el.textContent = '0';
      const io = new IntersectionObserver(entradas => {
        if (!entradas[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now(), dur = 1700;
        const paso = t => {
          const k = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(anios * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
      }, { threshold: .4 });
      io.observe(el);
    });
  }

  /* ======================================================================
     CONSULTA — estado compartido entre el catalogo y el formulario.
     Se recuerda en este navegador (localStorage) por comodidad del visitante.
     ====================================================================== */
  const CLAVE = 'sm-consulta-v1';
  const VACIO = { marca: '', marcaOtra: '', modelo: '', anio: '', motor: '', vin: '', repuestos: [], detalle: '', nombre: '', entrega: 'Retiro en el local' };
  const estado = JSON.parse(JSON.stringify(VACIO));

  function guardar(){ try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) {} }
  function cargar(){
    try {
      const s = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (s && typeof s === 'object'){
        Object.keys(VACIO).forEach(k => { if (typeof s[k] === typeof VACIO[k]) estado[k] = s[k]; });
      }
    } catch (e) {}
    if (!Array.isArray(estado.repuestos)) estado.repuestos = [];
  }

  const consulta = {
    tiene: n => estado.repuestos.some(r => norm(r) === norm(n)),
    agregar(n){
      n = String(n || '').trim().slice(0, 80);
      if (!n || this.tiene(n)) return false;
      estado.repuestos.push(n);
      cambio(true);
      return true;
    },
    quitar(n){
      estado.repuestos = estado.repuestos.filter(r => norm(r) !== norm(n));
      cambio();
    }
  };

  const partes = $$('.part');
  const nombreDe = p => p.querySelector('.part__name').textContent.trim();
  const catNombre = {};
  $$('.fchip').forEach(b => { catNombre[b.dataset.filter] = b.textContent.trim(); });

  const marcaFinal = () => estado.marca === 'Otra' ? estado.marcaOtra.trim() : estado.marca;

  function mensaje(){
    const L = ['Hola, Repuestos Salazar y Monge. Les escribo desde su sitio web para consultar estos repuestos.', ''];
    const veh = [marcaFinal(), estado.modelo.trim(), estado.anio].filter(Boolean).join(' ');
    L.push('*Vehículo:* ' + (veh || '—'));
    if (estado.motor.trim()) L.push('*Motor:* ' + estado.motor.trim());
    if (estado.vin.trim()) L.push('*VIN:* ' + estado.vin.trim());
    L.push('', '*Repuestos:*');
    if (estado.repuestos.length) estado.repuestos.forEach(r => L.push('• ' + r));
    else L.push('—');
    if (estado.detalle.trim()) L.push('', '*Detalles:* ' + estado.detalle.trim());
    if (SM_ENVIOS && estado.entrega) L.push('', '*Entrega:* ' + estado.entrega);
    if (estado.nombre.trim()) L.push('', '*Nombre:* ' + estado.nombre.trim());
    return L.join('\n');
  }

  /* ---------- Render ---------- */
  function renderPartes(){
    partes.forEach(p => {
      const on = consulta.tiene(nombreDe(p));
      p.classList.toggle('is-sel', on);
      const b = p.querySelector('.part__add');
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.querySelector('use').setAttribute('href', on ? '#i-check' : '#i-plus');
      b.querySelector('.t-lg').textContent = on ? 'En su consulta' : 'Agregar a la consulta';
      b.querySelector('.t-sm').textContent = on ? 'Agregado' : 'Agregar';
    });
  }

  function renderLista(){
    const ul = $('#q-list');
    if (!ul) return;
    ul.innerHTML = '';
    estado.repuestos.forEach(r => {
      const li = document.createElement('li');
      li.innerHTML = '<span>' + esc(r) + '</span><button type="button" aria-label="Quitar ' + esc(r) + ' de la consulta"><svg class="ico" aria-hidden="true"><use href="#i-x"/></svg></button>';
      li.querySelector('button').addEventListener('click', () => {
        consulta.quitar(r);
        aviso(r + ' se quitó de su consulta');
        $('#q-add-sel').focus();
      });
      ul.appendChild(li);
    });
    $('#q-list-empty').hidden = estado.repuestos.length > 0;
  }

  let consultaVisible = false;
  function renderPill(bump){
    const pill = $('#qpill');
    if (!pill) return;
    const n = estado.repuestos.length;
    $('#qpill-n').textContent = n;
    pill.setAttribute('aria-label', 'Ir a mi consulta: ' + n + (n === 1 ? ' repuesto' : ' repuestos'));
    pill.hidden = !(n > 0 && !consultaVisible);
    if (bump && !pill.hidden){
      pill.classList.remove('bump');
      void pill.offsetWidth;
      pill.classList.add('bump');
    }
  }

  function renderPreview(){
    const b = $('#q-preview');
    if (!b) return;
    b.innerHTML = esc(mensaje())
      .replace(/\*([^*\n]+)\*/g, '<b>$1</b>')
      .replace(/—/g, '<span class="bubble__vacio">—</span>');
    const d = new Date();
    b.dataset.hora = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    $('#q-send').href = waLink(mensaje());
  }

  function renderForm(){
    $$('#quote-form .chip input').forEach(i => { i.closest('.chip').classList.toggle('is-on', i.checked); });
    const otra = $('#f-marca-otra');
    if (otra) otra.hidden = estado.marca !== 'Otra';
    const hecho = (id, ok) => { const f = $(id); if (f) f.classList.toggle('is-done', !!ok); };
    hecho('#qstep-1', marcaFinal() && (estado.modelo.trim() || estado.vin.trim()));
    hecho('#qstep-2', estado.repuestos.length || estado.detalle.trim());
    hecho('#qstep-3', estado.nombre.trim());
  }

  let erroresVisibles = false;
  function cambio(bump){
    renderPartes();
    renderLista();
    renderPill(bump);
    renderPreview();
    renderForm();
    if (erroresVisibles) validar(false);
    guardar();
  }

  function validar(enfocar){
    const faltaMarca  = !marcaFinal();
    const faltaModelo = !estado.modelo.trim() && !estado.vin.trim();
    const faltaRep    = !estado.repuestos.length && !estado.detalle.trim();
    const faltan = [];
    if (faltaMarca)  faltan.push({ txt: 'la marca', el: estado.marca === 'Otra' ? $('#q-marca-otra') : $('#q-marcas input') });
    if (faltaModelo) faltan.push({ txt: 'el modelo (o el VIN)', el: $('#q-modelo') });
    if (faltaRep)    faltan.push({ txt: 'al menos un repuesto', el: $('#q-add-sel') });
    $('#q-modelo').setAttribute('aria-invalid', faltaModelo ? 'true' : 'false');
    $('#q-marca-otra').setAttribute('aria-invalid', estado.marca === 'Otra' && faltaMarca ? 'true' : 'false');
    const box = $('#q-err');
    if (faltan.length){
      box.textContent = 'Para enviar la consulta falta ' + lista(faltan.map(f => f.txt)) + '.';
      box.hidden = false;
      erroresVisibles = true;
      if (enfocar && faltan[0].el) faltan[0].el.focus();
      return false;
    }
    box.hidden = true;
    erroresVisibles = false;
    return true;
  }

  /* ---------- Catalogo ---------- */
  function initCatalogo(){
    const buscar = $('#buscar'), chips = $$('.fchip'), vacio = $('#cat-empty'), nEl = $('#cat-n');
    let filtro = 'todos';

    const marcarChips = () => chips.forEach(c => {
      const on = c.dataset.filter === filtro;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    const aplicar = () => {
      const q = norm(buscar ? buscar.value : '');
      const palabras = q ? q.split(/\s+/) : [];
      let n = 0;
      partes.forEach(p => {
        const texto = norm(nombreDe(p) + ' ' + (p.dataset.k || ''));
        const ver = (filtro === 'todos' || p.dataset.cat === filtro) && palabras.every(w => texto.includes(w));
        p.hidden = !ver;
        if (ver) n++;
      });
      if (nEl){
        nEl.textContent = n;
        nEl.nextSibling.textContent = n === 1 ? ' repuesto' : ' repuestos';
      }
      if (vacio){
        vacio.hidden = n > 0;
        if (!n){
          const t = buscar.value.trim();
          $('#cat-q').textContent = t;
          $('#cat-empty-wa').href = waLink('Hola, estoy buscando: ' + t + '. ¿Lo tienen o lo pueden pedir? Mi vehículo es (marca, modelo y año):');
        }
      }
    };

    const setFiltro = f => { filtro = f; marcarChips(); aplicar(); };
    chips.forEach(c => c.addEventListener('click', () => {
      if (buscar) buscar.value = '';
      setFiltro(c.dataset.filter);
    }));
    if (buscar) buscar.addEventListener('input', () => {
      if (buscar.value.trim() && filtro !== 'todos'){ filtro = 'todos'; marcarChips(); }
      aplicar();
    });
    $$('[data-goto-filter]').forEach(a => a.addEventListener('click', () => {
      if (buscar) buscar.value = '';
      setFiltro(a.dataset.gotoFilter);
    }));

    partes.forEach(p => {
      const nombre = nombreDe(p);
      const btn = p.querySelector('.part__add');
      btn.setAttribute('aria-label', 'Agregar ' + nombre + ' a la consulta');
      btn.addEventListener('click', () => {
        if (consulta.tiene(nombre)){
          consulta.quitar(nombre);
          aviso(nombre + ' se quitó de su consulta');
        } else {
          consulta.agregar(nombre);
          aviso(nombre + ' se agregó a su consulta');
          p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop');
        }
      });
    });
    aplicar();
  }

  /* ---------- Formulario de consulta ---------- */
  function initConsulta(){
    const form = $('#quote-form');
    if (!form) return;
    cargar();

    const selAnio = $('#q-anio');
    for (let a = new Date().getFullYear() + 1; a >= 1970; a--) selAnio.add(new Option(a, a));
    selAnio.add(new Option('Anterior a 1970', 'anterior a 1970'));

    const sel = $('#q-add-sel'), grupos = {};
    partes.forEach(p => {
      const cat = p.dataset.cat;
      if (!grupos[cat]){
        grupos[cat] = document.createElement('optgroup');
        grupos[cat].label = catNombre[cat] || cat;
        sel.appendChild(grupos[cat]);
      }
      grupos[cat].appendChild(new Option(nombreDe(p), nombreDe(p)));
    });

    /* restaurar lo guardado */
    const poner = (id, v) => { const el = $(id); if (el) el.value = v || ''; };
    poner('#q-modelo', estado.modelo); poner('#q-motor', estado.motor); poner('#q-vin', estado.vin);
    poner('#q-detalle', estado.detalle); poner('#q-nombre', estado.nombre); poner('#q-marca-otra', estado.marcaOtra);
    if (estado.anio && !Array.from(selAnio.options).some(o => o.value === String(estado.anio))) estado.anio = '';
    poner('#q-anio', estado.anio);
    $$('input[name="marca"]').forEach(r => { r.checked = r.value === estado.marca; });
    if (!$$('input[name="entrega"]').some(r => r.value === estado.entrega)) estado.entrega = VACIO.entrega;
    $$('input[name="entrega"]').forEach(r => { r.checked = r.value === estado.entrega; });

    /* eventos */
    const enlazar = (id, clave, limpiar) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('input', () => {
        if (limpiar){ const v = limpiar(el.value); if (v !== el.value) el.value = v; }
        estado[clave] = el.value;
        cambio();
      });
    };
    enlazar('#q-modelo', 'modelo');
    enlazar('#q-motor', 'motor');
    enlazar('#q-vin', 'vin', v => v.toUpperCase().replace(/[^A-Z0-9]/g, ''));
    enlazar('#q-detalle', 'detalle');
    enlazar('#q-nombre', 'nombre');
    enlazar('#q-marca-otra', 'marcaOtra');
    selAnio.addEventListener('change', () => { estado.anio = selAnio.value; cambio(); });
    $$('input[name="marca"]').forEach(r => r.addEventListener('change', () => {
      estado.marca = r.value;
      cambio();
      if (r.value === 'Otra') $('#q-marca-otra').focus();
    }));
    $$('input[name="entrega"]').forEach(r => r.addEventListener('change', () => { estado.entrega = r.value; cambio(); }));

    sel.addEventListener('change', () => {
      if (!sel.value) return;
      const v = sel.value;
      aviso(consulta.agregar(v) ? v + ' se agregó a su consulta' : v + ' ya estaba en su consulta');
      sel.value = '';
    });
    const otro = $('#q-add-otro');
    const agregarOtro = () => {
      const v = otro.value.trim();
      if (!v){ otro.focus(); return; }
      aviso(consulta.agregar(v) ? v + ' se agregó a su consulta' : v + ' ya estaba en su consulta');
      otro.value = '';
      otro.focus();
    };
    $('#q-add-btn').addEventListener('click', agregarOtro);
    otro.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); agregarOtro(); } });
    form.addEventListener('submit', e => e.preventDefault());

    $('#q-send').addEventListener('click', e => { if (!validar(true)) e.preventDefault(); });
    $('#q-reset').addEventListener('click', () => {
      Object.assign(estado, JSON.parse(JSON.stringify(VACIO)));
      form.reset();
      $$('input[name="entrega"]').forEach(r => { r.checked = r.value === estado.entrega; });
      $('#q-err').hidden = true;
      erroresVisibles = false;
      $$('#quote-form [aria-invalid]').forEach(el => el.setAttribute('aria-invalid', 'false'));
      cambio();
      aviso('Consulta borrada');
    });

    cambio();
  }

  /* ---------- Marcas: preseleccionan la marca en la consulta ---------- */
  function initMarcas(){
    $$('.brand-tile').forEach(b => b.addEventListener('click', () => {
      const m = b.dataset.marca;
      estado.marca = m;
      $$('input[name="marca"]').forEach(r => { r.checked = r.value === m; });
      cambio();
      $('#consulta').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => { const i = $('#q-modelo'); if (i) i.focus({ preventScroll: true }); }, reduce ? 0 : 750);
      aviso('Marca ' + m + ' seleccionada. Escriba el modelo de su vehículo.');
    }));
  }

  /* ---------- Pastilla flotante "Mi consulta" ---------- */
  function initPill(){
    const sec = $('#consulta');
    if (!sec || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(e => { consultaVisible = e[0].isIntersecting; renderPill(); }, { threshold: .08 }).observe(sec);
  }

  /* ---------- Horario (solo si NEGOCIO.horario tiene datos confirmados) ---------- */
  function initHorario(){
    const h = NEGOCIO.horario;
    if (!Array.isArray(h) || !h.length) return;
    const fila = $('[data-neg-req="horario"]'), ul = $('#hours');
    if (!fila || !ul) return;
    fila.hidden = false;

    /* dia y hora actuales en Costa Rica, sin importar la zona del visitante */
    const partesHora = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Costa_Rica', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const val = t => (partesHora.find(p => p.type === t) || {}).value;
    const hoy = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(val('weekday'));
    const ahora = (+val('hour')) * 60 + (+val('minute'));
    const aMin = s => { const p = String(s).split(':'); return (+p[0]) * 60 + (+p[1] || 0); };
    const fmt = s => { const p = String(s).split(':'); let hh = +p[0]; const ap = hh >= 12 ? 'p. m.' : 'a. m.'; hh = hh % 12 || 12; return hh + ':' + (p[1] || '00') + ' ' + ap; };

    let abierto = false;
    h.forEach(t => {
      const li = document.createElement('li');
      const esHoy = (t.d || []).indexOf(hoy) > -1;
      if (esHoy) li.className = 'is-today';
      li.innerHTML = '<span>' + esc(t.dias) + '</span><span>' + (t.abre ? fmt(t.abre) + ' – ' + fmt(t.cierra) : 'Cerrado') + '</span>';
      ul.appendChild(li);
      if (esHoy && t.abre && ahora >= aMin(t.abre) && ahora < aMin(t.cierra)) abierto = true;
    });
    const badge = $('#open-badge');
    if (badge){
      badge.hidden = false;
      badge.textContent = abierto ? 'Abierto ahora' : 'Cerrado ahora';
      badge.className = 'open-badge ' + (abierto ? 'is-open' : 'is-closed');
    }
  }

  /* ---------- Mapa ---------- */
  function initMapa(){
    const f = $('#map');
    if (f && NEGOCIO.mapsEmbed) f.src = NEGOCIO.mapsEmbed;
  }

  /* ---------- Cita por WhatsApp (bandera SM_CITAS_WHATSAPP) ---------- */
  function initCitaWa(){
    const f = $('#cita-wa');
    if (!f || !SM_CITAS_WHATSAPP) return;
    const sel = $('#c-servicio');
    $$('.svc__i').forEach(li => { if (!li.hidden){ const n = li.querySelector('h3').textContent.trim(); sel.add(new Option(n, n)); } });
    sel.add(new Option('Otro o no estoy seguro', 'Otro o no estoy seguro'));
    const v = id => $(id).value.trim();
    const msg = () => {
      const L = ['Hola, Repuestos Salazar y Monge. Les escribo desde su sitio web para solicitar una cita de taller.', ''];
      L.push('*Vehículo:* ' + (v('#c-vehiculo') || '—'));
      L.push('*Servicio:* ' + (sel.value || '—'));
      if (v('#c-detalle')) L.push('*Detalle:* ' + v('#c-detalle'));
      if (v('#c-dia')) L.push('*Día preferido:* ' + v('#c-dia'));
      if (v('#c-nombre')) L.push('*Nombre:* ' + v('#c-nombre'));
      return L.join('\n');
    };
    const enviar = $('#c-send');
    const actualizar = () => { enviar.href = waLink(msg()); };
    f.addEventListener('input', actualizar);
    f.addEventListener('change', actualizar);
    f.addEventListener('submit', e => e.preventDefault());
    actualizar();
    enviar.addEventListener('click', e => {
      const faltan = [];
      if (!v('#c-vehiculo')) faltan.push('el vehículo');
      if (!sel.value) faltan.push('el servicio');
      const box = $('#c-err');
      if (faltan.length){
        e.preventDefault();
        box.textContent = 'Para solicitar la cita falta ' + lista(faltan) + '.';
        box.hidden = false;
      } else {
        box.hidden = true;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initBanderas();
    initGoogle();
    initAnios();
    initCatalogo();
    initConsulta();
    initMarcas();
    initPill();
    initHorario();
    initMapa();
    initCitaWa();
  });
})();

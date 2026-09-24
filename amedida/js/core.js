/* ==========================================================================
   REPUESTOS SALAZAR Y MONGE — Nucleo compartido
   Fuente unica. Al editar, re-copiar a amedida/js/core.js
   - Configuracion unica del negocio (un solo lugar que editar)
   - Enlaces de WhatsApp con mensaje contextual y enlaces tel: derivados del mismo dato
   - Placeholders de fotografia (la foto real aparece sola al copiarla en img/)
   - Header, menu movil, animaciones de entrada
   ========================================================================== */

/* --------------------------------------------------------------------------
   1) CONFIGURACION DEL NEGOCIO
   Todo dato real vive aqui. Nada de datos sueltos por el HTML.
   Campo vacio = la seccion NO se dibuja. Nunca se rellena con algo inventado.
   La fuente de cada dato esta en README.md.
   -------------------------------------------------------------------------- */
const NEGOCIO = {
  nombre: 'Repuestos Salazar y Monge',

  // CONFIRMADO
  whatsapp: '50684395880',            // formato internacional sin signos (cliente + su sitio Wix)
  telefonoTaller: '+506 2259-0088',   // citas de taller (cliente). Es tambien el telefono de su ficha de Google
  direccion: 'Del cementerio de Desamparados 200 sur, 300 oeste y 100 sur',
  ciudad: 'Desamparados',
  provincia: 'San José',
  codigoPostal: '10301',
  lat: 9.901592,                      // coincide con el Plus Code de su ficha de Google: WW2G+JC
  lng: -84.07393,
  mapsUrl: 'https://maps.google.com/?cid=2924783293189263944',
  wazeUrl: 'https://www.waze.com/ul?ll=9.901592%2C-84.07393&navigate=yes',
  mapsEmbed: 'https://www.google.com/maps?q=Repuestos%20Salazar%20y%20Monge%2C%20Desamparados%2C%20San%20Jos%C3%A9&z=16&output=embed',
  facebook: 'https://www.facebook.com/repuestossalazar.monge',   // enlazado desde su propio sitio Wix
  tallerDesde: 1981,                  // "Centro de afinamiento automotriz Salazar y Monge" (su sitio Wix)
  repuestosDesde: 2009,               // (su sitio Wix)

  // Resenas: solo el dato publico real de Google (consultado el 16/9/2026).
  // Actualizar de vez en cuando. No se agregan resenas ni testimonios redactados.
  google: { rating: '4.4', total: 83, url: 'https://maps.google.com/?cid=2924783293189263944' },

  // [PENDIENTE CONFIRMAR CON CLIENTE] — vacio = no se publica. Ver PENDIENTES-CLIENTE.md
  email: '',        // su sitio Wix muestra un hotmail: confirmar que lo revisan antes de publicarlo
  instagram: '',    // existe @taller_salazar_monge: confirmar que es de ellos
  sitioWeb: '',     // dominio definitivo (canonical y Open Graph)

  // Horario: Google y el sitio Wix NO coinciden. Mientras no se confirme, queda vacio
  // y el bloque de horario no se dibuja. Formato cuando se confirme:
  //   { dias: 'Lunes a viernes', d: [1,2,3,4,5], abre: '07:30', cierra: '18:00' },
  //   { dias: 'Sábado',          d: [6],         abre: '07:45', cierra: '12:00' }
  horario: []
};

/* Utilidades de formato: el numero visible y el href salen del MISMO dato */
function telHref(visible){ return 'tel:' + String(visible).replace(/[^\d+]/g, ''); }
function waVisible(num){
  const n = String(num);
  return '+' + n.slice(0,3) + ' ' + n.slice(3,7) + '-' + n.slice(7);
}

/* --------------------------------------------------------------------------
   2) WHATSAPP — mensajes contextuales, nunca "Hola, quiero informacion"
   -------------------------------------------------------------------------- */
function waLink(mensaje){
  return 'https://wa.me/' + NEGOCIO.whatsapp + '?text=' + encodeURIComponent(mensaje);
}

/* Cada enlace declara su propio contexto con data-wa="..." */
function initWhatsApp(){
  document.querySelectorAll('[data-wa]').forEach(function(el){
    el.setAttribute('href', waLink(el.dataset.wa));
    el.setAttribute('target','_blank');
    el.setAttribute('rel','noopener');
  });
}

/* Enlaces de telefono: <a data-tel="telefonoTaller"> */
function initTel(){
  document.querySelectorAll('[data-tel]').forEach(function(el){
    const v = NEGOCIO[el.dataset.tel];
    if (v) el.setAttribute('href', telHref(v));
  });
}

/* --------------------------------------------------------------------------
   3) PLACEHOLDERS DE FOTOGRAFIA
   <img data-ph="Taller - vista general" src="img/taller.jpg" data-alt-src="URL">
   - Primero se intenta la foto local (img/...). Si existe, aparece sola.
   - Si falta y hay data-alt-src, se usa esa imagen de respaldo.
     Con data-generica, ademas se rotula "Imagen referencial".
   - Si tampoco hay respaldo, queda el marcador "Fotografia pendiente".
   -------------------------------------------------------------------------- */
const PH_ICON = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 16l-5.5-5.5L7 19"/></svg>';

/* El marcador se dibuja por defecto DEBAJO de la imagen y se retira en cuanto
   la fotografia carga bien. Se hace en este orden a proposito: con
   loading="lazy" el navegador puede no intentar nunca la descarga, y entonces
   el evento "error" no llega a dispararse y el hueco quedaria vacio. */
function initPlaceholders(){
  document.querySelectorAll('img[data-ph]').forEach(function(img){
    if (img.dataset.phInit) return;
    img.dataset.phInit = '1';
    const cont = img.parentNode;
    if (!cont) return;

    const box = document.createElement('div');
    box.className = 'ph';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = PH_ICON +
      '<b>Fotografía pendiente</b>' +
      '<span>' + (img.dataset.ph || 'Imagen del negocio') + '</span>';
    cont.insertBefore(box, img);

    const cargo = function(){
      if (img.naturalWidth > 0){
        box.remove(); img.style.display = '';
        if (img.dataset.usandoAlt && img.hasAttribute('data-generica') && !cont.querySelector('.ref-chip')){
          const chip = document.createElement('span');
          chip.className = 'ref-chip';
          chip.textContent = 'Imagen referencial';
          cont.appendChild(chip);
        }
      }
    };
    const fallo = function(){
      if (img.dataset.altSrc && !img.dataset.usandoAlt){
        img.dataset.usandoAlt = '1';
        img.src = img.dataset.altSrc;
        return;
      }
      img.style.display = 'none';
    };
    img.addEventListener('load', cargo);
    img.addEventListener('error', fallo);
    if (img.complete){ img.naturalWidth > 0 ? cargo() : (img.currentSrc || img.src) && fallo(); }
  });
}

/* --------------------------------------------------------------------------
   4) HEADER / MENU / ANIMACIONES
   -------------------------------------------------------------------------- */
function initHeader(){
  const hdr = document.querySelector('.hdr');
  if (hdr){
    const onScroll = function(){ hdr.classList.toggle('is-stuck', window.scrollY > 24); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive:true });
  }
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  if (burger && nav){
    const cerrar = function(){
      nav.classList.remove('is-open'); burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menú');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', function(){
      const open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open){ const a = nav.querySelector('a'); if (a) a.focus(); }
    });
    nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', cerrar); });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && nav.classList.contains('is-open')){ cerrar(); burger.focus(); }
    });
  }
}

function initReveal(){
  const items = document.querySelectorAll('.rv');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)){
    items.forEach(function(el){ el.classList.add('in'); }); return;
  }
  const io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){
        const d = e.target.dataset.delay || 0;
        setTimeout(function(){ e.target.classList.add('in'); }, d);
        io.unobserve(e.target);
      }
    });
  }, { threshold:.12, rootMargin:'0px 0px -60px 0px' });
  items.forEach(function(el){ io.observe(el); });
}

/* Rellena datos del negocio marcados con data-neg="telefonoTaller" etc.
   data-neg-req="campo" oculta el elemento si ese campo esta vacio. */
function vacio(v){ return v === '' || v == null || (Array.isArray(v) && v.length === 0); }
function initDatos(){
  document.querySelectorAll('[data-neg]').forEach(function(el){
    const k = el.dataset.neg;
    const v = k === 'whatsappVisible' ? waVisible(NEGOCIO.whatsapp) : NEGOCIO[k];
    if (!vacio(v)) el.textContent = v;
  });
  document.querySelectorAll('[data-neg-req]').forEach(function(el){
    if (vacio(NEGOCIO[el.dataset.negReq])) el.hidden = true;
  });
  document.querySelectorAll('[data-href]').forEach(function(el){
    const v = NEGOCIO[el.dataset.href];
    if (vacio(v)) { el.hidden = true; return; }
    el.setAttribute('href', v);
  });
  document.querySelectorAll('[data-year]').forEach(function(y){ y.textContent = new Date().getFullYear(); });
}

document.addEventListener('DOMContentLoaded', function(){
  initDatos();
  initWhatsApp();
  initTel();
  initPlaceholders();
  initHeader();
  initReveal();
});

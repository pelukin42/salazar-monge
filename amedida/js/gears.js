/* ==========================================================================
   ENGRANAJES — decoracion animada, sin dependencias
   Se generan por codigo y engranan de verdad: la posicion, la fase y la
   velocidad de cada rueda salen de su numero de dientes. Giran despacio y
   aceleran con el scroll. Con "reducir movimiento" activado quedan quietos.

   Uso en el HTML:  <svg class="gearset" data-gearset="hero"></svg>
   Los conjuntos se definen en CONJUNTOS. Ruedas que se tocan comparten "m".
   ========================================================================== */
(function(){
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* m = modulo (tamano del diente) · speed = grados/segundo de la rueda base
     scroll = grados por pixel de scroll · angle = direccion desde la rueda "mesh"
     bounds:false = no cuenta para el encuadre (puede salirse del dibujo)       */
  var CONJUNTOS = {
    hero: { m: 10, speed: 6, scroll: .12, pad: 6, gears: [
      { id: 'a', teeth: 28, style: 'brand' },
      { id: 'b', teeth: 14, mesh: 'a', angle: -52, style: 'steel' },
      { id: 'c', teeth: 18, mesh: 'a', angle: 160, style: 'steel' },
      { id: 'd', teeth: 12, mesh: 'b', angle: 16, style: 'line' }
    ]},
    since: { m: 5, speed: 10, scroll: .14, pad: 2, gears: [
      { id: 'a', teeth: 26, style: 'ring' },
      { id: 'b', teeth: 10, mesh: 'a', angle: -42, style: 'steel', bounds: false }
    ]},
    ring: { m: 8, speed: 3, scroll: .06, pad: 2, gears: [
      { id: 'a', teeth: 44, style: 'line', hub: false },
      { id: 'b', teeth: 12, mesh: 'a', angle: -40, style: 'steel', bounds: false },
      { id: 'c', teeth: 10, mesh: 'b', angle: -100, style: 'line', bounds: false }
    ]},
    seal: { m: 3.2, speed: 8, scroll: .1, pad: 2, gears: [
      { id: 'a', teeth: 30, style: 'line', hub: false }
    ]},
    cta: { m: 7, speed: 5, scroll: .08, pad: 4, gears: [
      { id: 'a', teeth: 22, style: 'steel' },
      { id: 'b', teeth: 12, mesh: 'a', angle: 150, style: 'line' }
    ]},
    footer: { m: 12, speed: 2, scroll: .04, pad: 4, gears: [
      { id: 'a', teeth: 36, style: 'ghost' },
      { id: 'b', teeth: 16, mesh: 'a', angle: -128, style: 'ghost' }
    ]}
  };

  /* ---------- Geometria ---------- */
  function r2(n){ return Math.round(n * 100) / 100; }

  function dientes(teeth, m){
    var rp = m * teeth / 2, ro = rp + m, rr = rp - 1.25 * m;
    var paso = 2 * Math.PI / teeth, punta = paso * .14, raiz = paso * .26;
    function pt(r, a){ return r2(r * Math.cos(a)) + ' ' + r2(r * Math.sin(a)); }
    var d = 'M' + pt(rr, -raiz);
    for (var i = 0; i < teeth; i++){
      var a = i * paso;
      d += 'L' + pt(ro, a - punta) + 'A' + r2(ro) + ' ' + r2(ro) + ' 0 0 1 ' + pt(ro, a + punta) +
           'L' + pt(rr, a + raiz) + 'A' + r2(rr) + ' ' + r2(rr) + ' 0 0 1 ' + pt(rr, a + paso - raiz);
    }
    return d + 'Z';
  }

  function circulo(cx, cy, r){
    return 'M' + r2(cx + r) + ' ' + r2(cy) +
           'A' + r2(r) + ' ' + r2(r) + ' 0 1 0 ' + r2(cx - r) + ' ' + r2(cy) +
           'A' + r2(r) + ' ' + r2(r) + ' 0 1 0 ' + r2(cx + r) + ' ' + r2(cy) + 'Z';
  }

  function agujeros(n, radio, r, desfase){
    var d = '';
    for (var i = 0; i < n; i++){
      var a = desfase + i * 2 * Math.PI / n;
      d += circulo(radio * Math.cos(a), radio * Math.sin(a), r);
    }
    return d;
  }

  function el(nombre, attrs, padre){
    var n = document.createElementNS(NS, nombre);
    for (var k in attrs){ if (attrs.hasOwnProperty(k) && attrs[k] != null) n.setAttribute(k, attrs[k]); }
    if (padre) padre.appendChild(n);
    return n;
  }

  /* Posicion, sentido, relacion y fase de cada rueda.
     La fase deja un diente de la rueda madre frente a un hueco de la hija. */
  function acomodar(cfg){
    var porId = {};
    return cfg.gears.map(function(g0){
      var g = {};
      for (var k in g0) g[k] = g0[k];
      g.m = g.m || cfg.m;
      g.rp = g.m * g.teeth / 2; g.ro = g.rp + g.m; g.rr = g.rp - 1.25 * g.m;
      porId[g.id] = g;
      if (!g.mesh){
        g.x = g.x || 0; g.y = g.y || 0;
        g.dir = g.dir || 1; g.ratio = g.ratio || 1; g.phase = g.phase || 0;
        return g;
      }
      var p = porId[g.mesh], ang = g.angle * Math.PI / 180;
      g.x = p.x + (p.rp + g.rp) * Math.cos(ang);
      g.y = p.y + (p.rp + g.rp) * Math.sin(ang);
      g.dir = -p.dir;
      g.ratio = p.ratio * p.teeth / g.teeth;
      var fase = (((g.angle - p.phase) / (360 / p.teeth)) % 1 + 1) % 1;
      g.phase = g.angle + 180 - (360 / g.teeth) * (.5 - fase);
      return g;
    });
  }

  var PARADAS = [[0, '#4a5551'], [.55, '#333c39'], [.8, '#46514d'], [.9, '#6f7b77'], [1, '#2e3633']];

  function dibujar(svg, nombre, cfg){
    var ruedas = acomodar(cfg);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var defs = el('defs', {}, svg);

    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    ruedas.forEach(function(g){
      if (g.bounds === false) return;
      x0 = Math.min(x0, g.x - g.ro); x1 = Math.max(x1, g.x + g.ro);
      y0 = Math.min(y0, g.y - g.ro); y1 = Math.max(y1, g.y + g.ro);
    });
    var pad = cfg.pad || 0;
    svg.setAttribute('viewBox', [r2(x0 - pad), r2(y0 - pad), r2(x1 - x0 + 2 * pad), r2(y1 - y0 + 2 * pad)].join(' '));
    svg.setAttribute('focusable', 'false');

    ruedas.forEach(function(g){
      var grupo = el('g', { 'class': 'gear gear--' + g.style, transform: 'translate(' + r2(g.x) + ' ' + r2(g.y) + ')' }, svg);
      var gira = el('g', {}, grupo);
      g.nodo = gira;
      var perfil = dientes(g.teeth, g.m);

      if (g.style === 'line'){
        el('path', { d: perfil, 'class': 'gear__edge' }, gira);
        el('circle', { r: r2(g.rp), 'class': 'gear__pitch' }, gira);
        el('circle', { r: r2(g.rr - 1.2 * g.m), 'class': 'gear__edge' }, gira);
        if (g.hub !== false){
          var h = Math.max(g.m * .9, g.rr * .18);
          el('circle', { r: r2(h), 'class': 'gear__edge' }, gira);
          el('path', { d: 'M' + r2(-h * .5) + ' 0H' + r2(h * .5) + 'M0 ' + r2(-h * .5) + 'V' + r2(h * .5), 'class': 'gear__edge' }, gira);
        }
        return;
      }

      var relleno = null;
      if (g.style !== 'ghost'){
        var gid = 'gg-' + nombre + '-' + g.id;
        var grad = el('radialGradient', { id: gid, gradientUnits: 'userSpaceOnUse', cx: 0, cy: 0, r: r2(g.ro) }, defs);
        PARADAS.forEach(function(s){ el('stop', { offset: s[0], 'stop-color': s[1] }, grad); });
        relleno = 'url(#' + gid + ')';
      }

      var d = perfil;
      if (g.style === 'ring'){
        d += circulo(0, 0, g.rr - 1.1 * g.m);
      } else {
        if (g.teeth >= 12){
          var n = g.teeth >= 24 ? 6 : 5;
          var grande = g.teeth >= 20;
          d += agujeros(n, g.rr * (grande ? .6 : .55), g.rr * (grande ? .2 : .17), Math.PI / n);
        }
        if (g.style !== 'brand') d += circulo(0, 0, Math.max(g.m * .7, g.rr * .13));
      }
      el('path', { d: d, 'fill-rule': 'evenodd', fill: relleno, 'class': 'gear__body' }, gira);

      if (g.style !== 'ring' && g.teeth >= 20){
        el('circle', { r: r2(g.rr - 1.4 * g.m), 'class': 'gear__groove' }, gira);
      }

      if (g.style === 'brand'){
        /* Centro fijo (no gira): el carro de su logo queda siempre derecho */
        var cubo = g.rr * .34;
        var fijo = el('g', { 'class': 'gear__hub' }, grupo);
        el('circle', { r: r2(cubo), 'class': 'gear__hubdisc' }, fijo);
        el('circle', { r: r2(cubo * .86), 'class': 'gear__hubring' }, fijo);
        var s = cubo * 1.08;
        el('use', { href: '#i-car', x: r2(-s / 2), y: r2(-s / 2), width: r2(s), height: r2(s), 'class': 'gear__car' }, fijo);
      }
    });
    return ruedas;
  }

  /* ---------- Movimiento ---------- */
  var conjuntos = [], reloj = 0, ultimo = 0, corriendo = false;

  function girar(c, theta){
    for (var i = 0; i < c.ruedas.length; i++){
      var g = c.ruedas[i];
      var a = g.phase + g.dir * g.ratio * theta;
      g.nodo.setAttribute('transform', 'rotate(' + r2(a) + ')');
    }
  }

  function cuadro(ts){
    if (!ultimo) ultimo = ts;
    reloj += Math.min(50, ts - ultimo);
    ultimo = ts;
    var y = window.pageYOffset || 0, alguno = false;
    for (var i = 0; i < conjuntos.length; i++){
      var c = conjuntos[i];
      if (!c.visible) continue;
      alguno = true;
      girar(c, reloj / 1000 * c.cfg.speed + y * c.cfg.scroll);
    }
    if (alguno) requestAnimationFrame(cuadro);
    else { corriendo = false; ultimo = 0; }
  }

  function arrancar(){
    if (corriendo || reduce) return;
    corriendo = true;
    requestAnimationFrame(cuadro);
  }

  function init(){
    var svgs = document.querySelectorAll('svg[data-gearset]');
    if (!svgs.length) return;
    var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entradas){
      entradas.forEach(function(e){
        var c = e.target.__engranajes;
        if (!c) return;
        c.visible = e.isIntersecting;
        if (c.visible) arrancar();
      });
    }, { rootMargin: '120px 0px' }) : null;

    Array.prototype.forEach.call(svgs, function(svg){
      var nombre = svg.getAttribute('data-gearset'), cfg = CONJUNTOS[nombre];
      if (!cfg) return;
      var c = { cfg: cfg, ruedas: dibujar(svg, nombre, cfg), visible: !io };
      svg.__engranajes = c;
      conjuntos.push(c);
      girar(c, 0);
      if (io) io.observe(svg);
    });
    if (!io) arrancar();
  }

  window.Engranajes = { conjuntos: CONJUNTOS, init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

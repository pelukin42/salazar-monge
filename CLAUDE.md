# Repuestos Salazar y Monge — convenciones del proyecto

Propuesta web para **Repuestos Salazar y Monge** (Desamparados, San José, Costa Rica): repuestos para
vehículos americanos y taller mecánico desde 1981. Una sola versión, `amedida/`; el `index.html` de la
raíz solo redirige.

Para el método completo de construcción, usar el skill **`nuevo-cliente`**.

## Reglas duras

**No inventar ningún dato del negocio.** Ni precios, garantías, plazos, correos, horarios, cobertura ni
testimonios. Campo sin confirmar = vacío en `NEGOCIO` = la sección no se dibuja. Se anota en
`PENDIENTES-CLIENTE.md`. La fuente de cada dato publicado está en `README.md`.

**Fotos**: el usuario autorizó imágenes genéricas mientras llegan las del negocio. Son de Unsplash, van
rotuladas "Imagen referencial" y se reemplazan solas al copiar la foto real en `amedida/img/`.

**Opiniones**: solo la cifra pública de Google con enlace a la ficha. Sin `aggregateRating` propio en el JSON-LD.

**Logos de marcas**: vectores oficiales (Simple Icons / Wikimedia Commons) en el sprite, símbolos `b-*`.
Siempre con la nota legal del pie y sin afirmar que el negocio sea distribuidor autorizado. Los colores de
marca se activan con variables CSS (`--chevy-gold`, `--dodge-red`, `--gmc-red`). Facebook usa su logo
oficial (`i-fb`, azul #0866FF).

**Tono**: de usted, como se comunica el propio negocio. Sin frases vacías ("los mejores", "calidad #1").

## Fuente única

`assets/core.css` y `assets/core.js` son la fuente. Al editarlos, re-copiar:

```bash
cp assets/core.css amedida/css/styles.css && cp assets/core.js amedida/js/core.js
```

Todos los datos del negocio viven en `NEGOCIO` (`assets/core.js`). Los números visibles y los `tel:`
salen del mismo campo. El JSON-LD del `<head>` repite datos: mantenerlo sincronizado.

## Sistema visual

Grafito oscuro + verde de su logo (tokens en el `:root` de `core.css`; `--brass` es el verde). Barlow
Condensed para títulos y Barlow para texto. Engranajes como motivo: su logo es un engranaje con un carro.

## Engranajes

`amedida/js/gears.js` los genera por código a partir de `CONJUNTOS` (dientes, módulo, ángulo). Las ruedas
que se tocan deben compartir el módulo `m`; posición, fase y velocidad se calculan solas. Con
`prefers-reduced-motion` quedan quietos.

## Banderas

Al inicio de `amedida/js/main.js` (`SM_ENVIOS`, `SM_DIRECCIONES`, `SM_MARCAS_REPUESTOS`,
`SM_MARCAS_EXTRA`, `SM_CITAS_WHATSAPP`). Los elementos llevan `data-flag`. Estado y fuente de cada una en
`PENDIENTES-CLIENTE.md`.

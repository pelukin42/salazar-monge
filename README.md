# Repuestos Salazar y Monge — propuesta de sitio web

Sitio de una página para **Repuestos Salazar y Monge** (Desamparados, San José): repuestos para
vehículos americanos y taller mecánico. Nivel **A Medida**: catálogo filtrable y consulta armada por WhatsApp.

HTML, CSS y JS planos. Sin dependencias ni paso de build: se sube por FTP y funciona.

## Cómo verlo

```bash
python -m http.server 5181
```

Abrir <http://localhost:5181/> (redirige a `amedida/`). En Claude Code está configurado como `propuesta`
en `.claude/launch.json`.

## Qué incluye

- **Portada** con engranajes animados que engranan de verdad y giran con el scroll. El engranaje
  grande lleva al centro el carro de su logo.
- **Catálogo de 17 repuestos** con íconos dibujados a mano, búsqueda (sin importar tildes), filtros por
  categoría y botón para preguntar cada repuesto por WhatsApp.
- **Consulta armada**: el visitante agrega repuestos desde el catálogo, llena marca, modelo, año, motor y
  VIN, y ve en vivo el mensaje de WhatsApp que va a enviar. Se recuerda en su navegador.
- **Taller**: 8 servicios, "Desde 1981" y citas por teléfono (2259-0088).
- **Logos de las marcas** (Ford, Dodge, Jeep, Chrysler, Chevrolet, GMC) en una franja bajo la portada, en
  las tarjetas de marcas (con sus colores: moño dorado de Chevrolet, franjas rojas de Dodge, GMC en rojo) y
  en los botones de marca de la consulta. Nota legal de marcas registradas en el pie.
- **Marcas**: al tocar una, queda preseleccionada en la consulta.
- **Facebook con su logo oficial** en el encabezado, el menú móvil, el contacto y el pie.
- **Trayectoria**: los años se calculan desde 1981, línea de tiempo y foto real de la fachada.
- **Opiniones**: la calificación pública de Google (4.4 · 83) con enlace a la ficha. Sin testimonios inventados.
- **Ubicación**: mapa, Google Maps, Waze, WhatsApp, teléfono y Facebook.
- SEO local: metadatos, Open Graph con imagen propia y JSON-LD `AutoPartsStore` + `AutoRepair`,
  **sin `aggregateRating` propio**.
- Accesible: navegación por teclado, `aria-label` en controles, avisos para lectores de pantalla y
  respeto a "reducir movimiento" (los engranajes quedan quietos).

## Estructura

```
index.html               Redirige a amedida/
PENDIENTES-CLIENTE.md    Agenda para la reunión con el dueño
assets/core.css          Sistema visual — FUENTE ÚNICA
assets/core.js           Datos del negocio (NEGOCIO), WhatsApp, fotos — FUENTE ÚNICA
amedida/
  index.html             El sitio (incluye el sprite de íconos)
  css/styles.css         copia de assets/core.css
  css/site.css           estilos de esta versión
  js/core.js             copia de assets/core.js
  js/gears.js            motor de engranajes
  js/main.js             banderas, catálogo, consulta, horario, mapa
  img/                   favicon, imagen para compartir y LEEME.txt de fotos
```

Después de editar `assets/`, re-copiar:

```bash
cp assets/core.css amedida/css/styles.css && cp assets/core.js amedida/js/core.js
```

Todos los datos del negocio viven en `NEGOCIO` (`assets/core.js`). El JSON-LD del `<head>` repite algunos:
mantenerlo sincronizado.

## De dónde sale cada dato

| Dato publicado | Fuente |
|---|---|
| WhatsApp 8439-5880 | Cliente (16/9/2026) y su sitio Wix |
| Citas de taller al 2259-0088 | Cliente (16/9/2026); es también el teléfono de su ficha de Google |
| Listado de 17 repuestos y 7 servicios de taller | Cliente (WhatsApp, 16/9/2026) |
| Marcas Ford, Dodge, Jeep, Chrysler, Chevrolet, GMC | Cliente |
| Dirección y ubicación en el mapa | Ficha de Google Maps (Plus Code WW2G+JC) y su sitio Wix |
| 4.4 ★ · 83 opiniones | Google, consultado el 16/9/2026 |
| Taller desde 1981 (Centro de Afinamiento Automotriz Salazar y Monge), empresa desde 2009 | Su sitio Wix: ventassalazarmonge.wixsite.com/repuestos |
| Importadores directos, repuestos originales y alternativos, pedidos especiales | Su sitio Wix |
| Encomiendas y mensajería en la GAM | Su sitio Wix (bandera `SM_ENVIOS`) |
| Transmisiones automáticas, direcciones hidráulicas, repuestos eléctricos | Página "Servicios" de su Wix |
| Marcas de repuestos (ACDelco, Motorcraft, Mopar…) | Página "Marcas" de su Wix (bandera `SM_MARCAS_REPUESTOS`) |
| Facebook | Enlazado desde su propio sitio Wix |
| Lema "You drive it, we fix it" | Pie de su sitio Wix |
| Foto de la fachada | Su sitio Wix (foto del negocio) |

**No se publicó** (queda en `PENDIENTES-CLIENTE.md`): horario (Google y Wix no coinciden), correo,
teléfono 2259-3365, Instagram, parqueo, plazo de pedidos especiales, garantías, precios y métodos de pago.

Los textos van de **usted**, porque así se dirige el negocio a sus clientes en su sitio y en Facebook.

## Banderas

Al inicio de `amedida/js/main.js`:

| Bandera | Valor | Qué controla |
|---|---|---|
| `SM_ENVIOS` | `true` | Encomiendas y mensajería en la GAM (tira de datos, consulta y ubicación) |
| `SM_DIRECCIONES` | `true` | Servicio de direcciones hidráulicas |
| `SM_MARCAS_REPUESTOS` | `true` | Fila de marcas de repuestos |
| `SM_MARCAS_EXTRA` | `false` | Buick, Pontiac, Cadillac y versiones argentina y brasileña |
| `SM_CITAS_WHATSAPP` | `false` | Formulario para pedir cita por WhatsApp |

## Fotografías

Mientras llegan las del negocio, portada, taller y pedido especial usan **imágenes referenciales de
Unsplash** (licencia Unsplash), rotuladas en pantalla. Al copiar la foto real con el nombre indicado en
`amedida/img/LEEME.txt`, reemplaza a la referencial sola.

| Archivo esperado | Imagen referencial actual |
|---|---|
| `hero.jpg` | `photo-1619642751034-765dfdf7c58e` |
| `taller.jpg` | `photo-1625047509248-ec889cbff17f` |
| `pedido-especial.jpg` | `photo-1760317890322-364a810cd4da` |
| `local.jpg` | Foto de la fachada tomada de su sitio Wix |

## Créditos técnicos

- **Logos de marcas** (vectores, en el sprite de `amedida/index.html`). Son marcas registradas de sus dueños y
  se usan solo para identificar los vehículos que atiende el negocio (nota legal en el pie):
  - Ford, Jeep, Chrysler, Chevrolet y Facebook: Simple Icons 16.31.0 (dibujo CC0).
  - Dodge (`Dodge black logo.svg`) y GMC (`GMC.svg`): Wikimedia Commons, dominio público.
  - Los trazos se verificaron número por número contra los originales.
- Íconos de interfaz basados en Feather Icons (MIT); ícono de WhatsApp de Simple Icons (CC0).
- Íconos de repuestos y servicios, engranajes, favicon e imagen para compartir: dibujo propio.
- Tipografías Barlow y Barlow Condensed (Google Fonts, OFL).

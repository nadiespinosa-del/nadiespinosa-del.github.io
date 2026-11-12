# Camino de Azahar · Sitio web

Sitio turístico de **Camino de Azahar**, el circuito turístico y educativo de la naranja en la Chacra La Victoria (Colonia Osimani, Salto, Uruguay). Está hecho con **Astro** y **Tailwind CSS**.

El brief completo está en [`Master-Prompt-Camino-de-Azahar.md`](Master-Prompt-Camino-de-Azahar.md).

## Cómo ver el sitio en tu computadora

1. Abrí una terminal en esta carpeta.
2. La primera vez, instalá las dependencias:
   ```bash
   npm install
   ```
3. Arrancá el sitio:
   ```bash
   npm run dev
   ```
4. Abrí <http://localhost:4321/es/> en el navegador. El sistema de diseño está en <http://localhost:4321/es/sistema/>.

Para generar la versión final (carpeta `dist/`): `npm run build`.

## Cómo editar el contenido sin programar

Todo el contenido que cambia con frecuencia está en archivos de datos, en `src/data/`:

| Qué querés cambiar | Archivo | Qué tocar |
|---|---|---|
| WhatsApp, email, Instagram, Facebook | `src/data/site.json` | Sección `contacto`. Para activar Instagram o Facebook, reemplazá `null` por el usuario (Instagram) o la URL (Facebook), entre comillas |
| Tarifas y lo que incluye | `src/data/site.json` | Sección `tarifas` |
| Cupo mínimo y máximo de las salidas | `src/data/site.json` | Sección `cupo` |
| Meses con fruto y floración del azahar | `src/data/site.json` | Sección `temporada` (números de mes: 1 = enero) |
| Créditos de diseño y fotografía | `src/data/site.json` | Sección `creditos` |
| Fechas de salidas | `src/data/salidas.json` | Una línea por salida (ver ejemplo abajo) |
| Etapas y modalidades | `src/data/experiencia.json` | Textos y minutos de cada etapa |
| Historia en tres momentos | `src/data/historia.json` | Año, título, texto y fuente |

Ejemplo de `salidas.json` con dos salidas:

```json
[
  { "fecha": "2027-05-15", "hora": "09:30", "modalidad": "con-fruto", "lugaresLibres": 25, "estado": "abierta" },
  { "fecha": "2027-05-22", "hora": "09:30", "modalidad": "con-fruto", "lugaresLibres": 4, "estado": "abierta" }
]
```

- `modalidad`: `con-fruto`, `interpretativa` o `educativa`.
- `estado`: `abierta` o `a-confirmar`. Con 5 lugares o menos aparece "Últimos lugares"; con 0, "Completa".

Guardá el archivo y el sitio se actualiza solo mientras corre `npm run dev`.

## Estructura: VÍA y sus experiencias

El sitio es de **VÍA**. Cada experiencia vive dentro de «Experiencias»; la primera es **Camino de Azahar**.

El sitio está en **español, portugués e inglés** (`/es/`, `/pt/`, `/en/`). Cada página tiene su contenido en una **vista** de `src/vistas/`, con un bloque de textos por idioma (`es`, `pt`, `en`). Los archivos de `src/pages/` son solo accesos cortos que llaman a la vista en cada idioma. Para cambiar un texto, buscalo en la vista y cambialo en los tres bloques.

| Página | Vista |
|---|---|
| Inicio de VÍA | `src/vistas/Inicio.astro` |
| Catálogo de experiencias (con filtros) | `src/vistas/Experiencias.astro` (datos: `src/data/experiencias.json`, con sus traducciones) |
| Camino de Azahar: portada inmersiva (naranja 3D) | `src/vistas/Azahar.astro` |
| Camino de Azahar: con fruto e interpretativa, escuelas | `src/vistas/FichaModalidad.astro`, `src/vistas/Grupos.astro` |
| Camino de Azahar: la naranja en Salto, la chacra, planificá, sobre el proyecto | `Naranja`, `Chacra`, `Planifica`, `Sobre` en `src/vistas/` |
| VÍA Educa, Diseñá tu experiencia, Nosotros, Contacto | `ViaEduca`, `Disena`, `Nosotros`, `Contacto` en `src/vistas/` |
| Sostenibilidad, Prensa, Accesibilidad, Privacidad, Términos, Mapa del sitio | misma carpeta |

Las direcciones (URL) de cada página en los tres idiomas están en `src/i18n/ui.ts` (`rutas`), junto con los textos del menú y el pie.

### Sumar una experiencia nueva

1. Agregala en `src/data/experiencias.json` (nombre, destino, tipos, resumen, duración, precio desde, color) con sus `traducciones` a portugués e inglés.
2. Creá sus vistas y sus páginas en los tres idiomas (podés copiar las de Camino de Azahar como modelo) y sumá sus rutas en `src/i18n/ui.ts`.
3. Si tiene un color propio, agregá su tema en `src/styles/tokens.css` (como `data-tema="azahar"`).

Aparece sola en el inicio, en el catálogo, en el pie y en «VÍA Educa» si es educativa.

### Logo

El logo de VÍA está dibujado en vector en `src/components/MarcaVia.astro` (a partir del boceto de la marca), con una versión clara para fondos oscuros y la frase «Conectamos lugares, creamos experiencias.» en el pie. El ícono de la pestaña es `public/favicon.svg`.

Preguntas frecuentes: `src/data/preguntas.json` (cada pregunta indica en qué páginas aparece con `temas`).

Cuando tengas la ubicación de la Chacra La Victoria, completá `"chacra": { "lat": ..., "lng": ... }` en `src/data/destinos.json` y aparece en el mapa.

## Recursos 3D (licencia CC0, Poly Haven)

- Cáscara de la naranja: escaneo "Food Lime 01" de Oliver Harries, recoloreado a naranja (`public/3d/lima/`).
- Luz y reflejos: HDRI "Citrus Orchard" (`public/3d/citrus_orchard_1k.hdr`).
- El corte (gajos, vesículas, albedo), la hoja y los pétalos se generan por código en `src/scripts/escena-naranja.ts`.

CC0 no exige atribución, pero se deja el crédito por transparencia.

## Fotos

- **Camino de Azahar:** fotos propias de la Chacra La Victoria en `public/fotos/camino-de-azahar/` (optimizadas a 1600 px, sin datos de ubicación). Cada foto tiene su texto alternativo en español, portugués e inglés en `src/lib/fotos.ts`. Para cambiar una foto de lugar, cambiá su nombre en el componente que la usa (`SlidesEtapas`, `DelArbolALaMesa`, `TarjetaModalidad`, `vistas/FichaModalidad`). Para sumar una nueva, guardala en esa carpeta y agregala a `src/lib/fotos.ts`.
- **Portada de VÍA:** fotos propias (atardecer en el río Uruguay, Plaza 33 y un fogón), definidas en `src/vistas/Inicio.astro`.
- **Video:** `public/videos/camino-de-azahar.mp4` (naranjal, vertical, sin sonido) junto a la frase de presentación de Camino de Azahar (`src/components/inmersivo/Manifiesto.astro`). Se reproduce solo cuando está en pantalla, tiene botón de pausa y no arranca solo si la persona pidió reducir el movimiento.
- Los espacios que todavía no tienen foto muestran la descripción de la toma que hace falta.

## Datos pendientes

Los datos que faltan se ven en pantalla con un recuadro punteado `[DATO: …]`. En el código están marcados con el componente `Pendiente` o con valores `null` en `src/data/site.json`. La lista completa está en el Anexo C del Master Prompt.

## Estructura

```
src/
  components/   Componentes reutilizables (Encabezado, Pie, LineaEtapas, FormularioReserva…)
  layouts/      Base.astro: plantilla de todas las páginas
  pages/es/     Páginas en español (pt/ y en/ llegan en la Etapa 5)
  data/         Contenido editable (JSON)
  i18n/         Textos de la interfaz por idioma
  styles/       tokens.css (colores, tipografía) y global.css
  scripts/      Validación y envío de formularios
public/         Archivos estáticos (favicon, imágenes)
```

| Componente | Para qué sirve |
|---|---|
| `Rodaja`, `Separador` | Recurso gráfico firma (rodaja de naranja) |
| `Imagen` | Marco de foto con la descripción de la toma pendiente |
| `Pendiente` | Marca visible de un dato que falta |
| `IndicadorTemporada` | "Ahora: zafra" o "Ahora: modalidad interpretativa", según el mes |
| `LineaEtapas` | Las cinco etapas con sus minutos |
| `TarjetaModalidad` | Tarjeta de cada modalidad |
| `TablaTarifas` | Tarifas con la leyenda "tarifa propuesta" |
| `AvisoAccesibilidad` | Accesibilidad y exigencia física (antes de reservar) |
| `ListaSalidas` | Próximas salidas, con estados y estado vacío |
| `FormularioReserva`, `FormularioGrupos` | Consultas que se envían por WhatsApp |
| `BotonWhatsApp`, `EnlaceEmail` | Contacto (el email está protegido contra spam) |
| `RetratoPersona` | Retrato con cita |
| `LineaHistoria` | Historia en tres momentos |
| `CalendarioTemporada` | Calendario anual con el mes actual marcado |
| `Llamado`, `Boletin` | Llamado a la acción y suscripción (boletín todavía no activo) |

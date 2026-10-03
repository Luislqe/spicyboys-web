# SPICY BOYS — SB—SYS v2.6

Web oficial de SPICY BOYS (IZIAL × DBØ) · Hard techno · Castelldefels / BCN.
Next.js (App Router) · TypeScript · React 19 · Tailwind v4 (tokens) · CSS a medida · 0 librerías de animación.

## Arrancar

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
STATIC_EXPORT=1 npm run build   # web 100% estática en /out (Netlify, Vercel, GitHub Pages…)
```

Pon el dominio real en `.env.local` para SEO / sitemap / Open Graph:

```
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

## Dónde se edita cada cosa

| Qué | Archivo |
|---|---|
| Nombre, links, coordenadas, BPM, textos base | `src/data/site.ts` |
| Tracks / sets / selecciones de SoundCloud | `src/data/music.ts` |
| Fotos de la galería VISUALS | `src/data/visuals.ts` (+ imágenes en `/public/visuals`) |
| Colores, tipografía, todo el diseño | `src/app/globals.css` (tokens en `:root`) |

### Añadir un track o set de SoundCloud
En `src/data/music.ts` añade un objeto con la URL pública:

```ts
{ id: "sb-001", title: "SB—001", kind: "original", year: "2026",
  url: "https://soundcloud.com/sasha-borrego-672612851/nombre-del-track",
  meta: "ORIGINAL MIX · 148 BPM", seed: 1 }
```

`kind`: `original` · `set` · `selection`. Sin `url` la fila sale como “LOCKED / SOON”.
`cover` (opcional) → tu propia portada; si no, se genera una automáticamente.

**Estado actual del perfil (sept. 2026):** 0 subidas propias y 3 playlists públicas
(The Lake Groove, Electro, Localito 16) con temas de otros artistas. Por eso la web las
presenta como **SELECTIONS**, nunca como lanzamientos propios.

### Audio
Todo suena a través del **reproductor oficial de SoundCloud** (iframe) y su **Widget API**
oficial. No se descarga ni se hace proxy de audio. PLAY/PAUSE, tiempo, avance y salto de
pista del dock son reales (controlan el widget). La forma de onda es decorativa y lleva la
etiqueta “WAVE / VISUAL”. Si el Widget API no carga, los controles propios se ocultan y el
reproductor oficial sigue funcionando.

### Vídeos y fotos (VISUALS)
Cada marco de VISUALS acepta, por prioridad:
1. `video: "/visuals/clip.mp4"` (+ `poster: "/visuals/clip.jpg"`) → se reproduce en bucle y
   sin sonido mientras está en pantalla; al hacer click se abre a pantalla completa con sonido.
2. `src: "/visuals/foto.jpg"` → foto.
3. Nada → arte generativo 1-bit.

Sube los archivos a `public/visuals/` en GitHub y edita `src/data/visuals.ts`.
Recomendado: clips de 6–20 s, 720p, MP4 (H.264), menos de 6 MB cada uno.
Usa solo material vuestro o con permiso.

## Mapa de interacciones

- **Cursor** (solo ratón): anillo con trail y squash por velocidad. Estados vía
  `data-cursor="play|open|follow|view|soon|lens|hover"` (+ `data-cursor-label`).
- **Hero “thermal lens”**: dos capas del logo; la roja se recorta en un círculo que sigue al
  cursor (en móvil, al arrastrar el dedo; en reposo, un escáner automático). Las letras se
  estiran cerca del puntero y el scroll separa SPICY / BOYS.
- **Marquees**: 4 bandas, velocidades y sentidos distintos; el scroll las acelera, invierte
  y las inclina.
- **SOUNDS**: filas tipo discografía; hover invierte la fila, estira el título y una portada
  sigue al cursor. Click → dock NOW PLAYING.
- **VISUALS**: composición editorial solapada, parallax por profundidad, tilt, máscara de
  entrada y distorsión SVG (feDisplacementMap) al pasar el ratón. Móvil: tira deslizable.
- **INDEX**: radar con el rumbo/distancia reales de BCN desde Castelldefels (20.4 km, 054°);
  las palabras se comprimen (eje de anchura) y los datos se “descifran” al pasar.
  Líneas dibujadas con scroll-driven animations nativas (`animation-timeline: view()`).
- **CONNECTED / GRUVINK**: única sección clara; el panel se abre desde una rendija con el
  scroll y el cursor es una linterna que revela GRUVINK. Texto neutral: referencia de escena,
  sin afirmar relación oficial.
- **FOLLOW THE NOISE**: disco magnético; al pasar, el grano de toda la página sube.

### Easter eggs
- Escribe **R-A-V-E** → 8 compases de rave mode a 150 BPM (flash muy suave < 3 Hz; desactivado con reduced motion).
- **G** → rejilla de diseño · **1–5** → saltar a secciones · **K** → play/pause · **?** → la cabina responde.
- Triple click en el logo **SB** · mensaje en la consola del navegador.

## Rendimiento y accesibilidad
- Un único `requestAnimationFrame` para toda la web (`src/lib/engine.ts`); todo se pausa fuera de pantalla o con la pestaña oculta.
- Solo `transform`/`opacity`/`clip-path` en bucles; canvas de partículas a DPR ≤ 1.5 (24 partículas en móvil).
- Smooth scroll propio (solo rueda de ratón), sincronizado con teclado, scrollbar y anclas.
- `prefers-reduced-motion`: sin smooth scroll, sin loader, sin parallax ni flashes.
- Loader: 0.9 s la primera visita, 0.26 s después, nunca más de 1.4 s.
- HTML semántico, skip link, foco visible, `aria-*` en controles, JSON-LD `MusicGroup`, sitemap y robots.

## Estructura
```
src/
  app/        layout (fuentes, metadata), page (JSON-LD), globals.css, sitemap, robots, icon
  components/ Site, Loader, Cursor, Background, HUD, Hero, Marquee, Music, Player,
              Visuals, About, Connected, Follow, Footer, Extras, Art, Split, SectionHead
  data/       site.ts, music.ts, visuals.ts
  lib/        engine.ts (loop, scroll, bus), hooks.ts, generative.ts (arte 1-bit)
preview/      harness para generar una preview estática sin Next (esbuild)
```

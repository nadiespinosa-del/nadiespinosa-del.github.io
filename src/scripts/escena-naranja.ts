// Escena 3D del hero: una naranja fotorrealista que se abre en dos y muestra sus gajos.
//
// Recursos (licencia CC0, Poly Haven, en /public/3d):
// - Cáscara: escaneo fotogramétrico "Food Lime 01" (Oliver Harries). Se recolorea a naranja
//   conservando el relieve, los poros y la rugosidad reales del escaneo.
// - Luz y reflejos: HDRI "Citrus Orchard" (un naranjal real).
// El corte (gajos, vesículas de jugo, albedo) se pinta en canvas con mapas de relieve y rugosidad.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

export interface EscenaNaranja {
  setProgreso(p: number): void;
  setPuntero(x: number, y: number): void;
  renderizar(): void;
  pausar(pausa: boolean): void;
  destruir(): void;
}

interface Opciones {
  movil: boolean;
  reducido: boolean;
}

const RUTA_MODELO = '/3d/lima/food_lime_01_2k.gltf';
const RUTA_HDRI = '/3d/citrus_orchard_1k.hdr';

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;

function lienzo(ancho: number, alto = ancho) {
  const c = document.createElement('canvas');
  c.width = ancho;
  c.height = alto;
  return [c, c.getContext('2d', { willReadFrequently: true })!] as const;
}

/* ---------- Cáscara: recoloreo del escaneo a naranja ---------- */

function recolorearCascara(imagen: CanvasImageSource & { width: number; height: number }) {
  const [c, ctx] = lienzo(imagen.width, imagen.height);
  ctx.drawImage(imagen, 0, 0);
  const datos = ctx.getImageData(0, 0, c.width, c.height);
  const p = datos.data;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], g = p[i + 1], b = p[i + 2];
    if (r + g + b < 18) continue; // fondo del atlas UV
    const luz = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Cicatriz del pedúnculo (marrón): se conserva, apenas más cálida
    if (r > g * 1.08 && r > 90) {
      p[i] = Math.min(255, r * 0.95);
      p[i + 1] = g * 0.78;
      p[i + 2] = b * 0.6;
      continue;
    }
    // Zonas amarillas del escaneo → naranja más dorado; zonas verdes → naranja profundo
    const amarillez = Math.min(1, Math.max(0, (r - b) / 140));
    const t = Math.min(1, Math.max(0, (luz - 50) / 130));
    const tono = 0.25 + amarillez * 0.45;
    const oscuro = [168, 46, 2];
    const claro = [mezclar(250, 255, tono), mezclar(112, 150, tono), mezclar(8, 26, tono)];
    p[i] = mezclar(oscuro[0], claro[0], t);
    p[i + 1] = mezclar(oscuro[1], claro[1], t);
    p[i + 2] = mezclar(oscuro[2], claro[2], t);
  }
  ctx.putImageData(datos, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false; // las texturas glTF no se invierten
  tex.anisotropy = 8;
  return tex;
}

/* ---------- Corte transversal fotorrealista ---------- */

/** Convierte un mapa de altura (canvas en grises) en un mapa de normales. */
function normalesDesdeAltura(alto: HTMLCanvasElement, fuerza: number) {
  const w = alto.width, h = alto.height;
  const src = alto.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, w, h).data;
  const [c, ctx] = lienzo(w, h);
  const out = ctx.createImageData(w, h);
  const a = (x: number, y: number) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (a(x + 1, y - 1) + 2 * a(x + 1, y) + a(x + 1, y + 1)) - (a(x - 1, y - 1) + 2 * a(x - 1, y) + a(x - 1, y + 1));
      const dy = (a(x - 1, y + 1) + 2 * a(x, y + 1) + a(x + 1, y + 1)) - (a(x - 1, y - 1) + 2 * a(x, y - 1) + a(x + 1, y - 1));
      let nx = -dx * fuerza, ny = dy * fuerza, nz = 1;
      const l = Math.hypot(nx, ny, nz);
      nx /= l; ny /= l; nz /= l;
      const i = (y * w + x) * 4;
      out.data[i] = (nx * 0.5 + 0.5) * 255;
      out.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      out.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return c;
}

function texturasCorte(tam: number) {
  const [cColor, color] = lienzo(tam);
  const [cAlto, alto] = lienzo(tam);
  const [cRug, rug] = lienzo(tam);
  const cx = tam / 2;
  const R = tam * 0.495;
  const azar = (a: number, b: number) => a + Math.random() * (b - a);
  const circulo = (ctx: CanvasRenderingContext2D, r: number, estilo: string | CanvasGradient) => {
    ctx.fillStyle = estilo;
    ctx.beginPath();
    ctx.arc(cx, cx, r, 0, Math.PI * 2);
    ctx.fill();
  };

  // Fondo neutro de los mapas auxiliares
  alto.fillStyle = '#7a7a7a'; alto.fillRect(0, 0, tam, tam);
  rug.fillStyle = '#8c8c8c'; rug.fillRect(0, 0, tam, tam);

  // Cáscara (flavedo) con glándulas de aceite
  const gCascara = color.createRadialGradient(cx, cx, R * 0.88, cx, cx, R);
  gCascara.addColorStop(0, '#f08a24');
  gCascara.addColorStop(0.6, '#e2680f');
  gCascara.addColorStop(1, '#b84a08');
  circulo(color, R, gCascara);
  circulo(alto, R, '#9a9a9a');
  circulo(rug, R, '#8a8a8a');
  for (let i = 0; i < tam * 1.6; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = azar(R * 0.915, R * 0.995);
    const x = cx + Math.cos(a) * r, y = cx + Math.sin(a) * r;
    const s = azar(0.6, 2.2) * (tam / 2048);
    color.fillStyle = Math.random() > 0.5 ? 'rgba(255,190,90,0.35)' : 'rgba(150,50,0,0.3)';
    color.beginPath(); color.arc(x, y, s * 1.6, 0, Math.PI * 2); color.fill();
    alto.fillStyle = 'rgba(200,200,200,0.5)';
    alto.beginPath(); alto.arc(x, y, s * 1.6, 0, Math.PI * 2); alto.fill();
  }

  // Albedo (la parte blanca), esponjoso
  const gAlbedo = color.createRadialGradient(cx, cx, R * 0.83, cx, cx, R * 0.915);
  gAlbedo.addColorStop(0, '#f6e7c7');
  gAlbedo.addColorStop(1, '#fbeed3');
  circulo(color, R * 0.912, gAlbedo);
  circulo(alto, R * 0.912, '#8a8a8a');
  circulo(rug, R * 0.912, '#d0d0d0');
  for (let i = 0; i < tam * 2; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = azar(R * 0.83, R * 0.91);
    color.fillStyle = `rgba(${Math.random() > 0.5 ? '230,205,160' : '255,250,235'},0.35)`;
    color.fillRect(cx + Math.cos(a) * r, cx + Math.sin(a) * r, 1.5, 1.5);
  }

  // Gajos: entre 10 y 12, con anchos levemente irregulares
  const gajos = 11;
  const anchos = Array.from({ length: gajos }, () => azar(0.85, 1.15));
  const suma = anchos.reduce((s, v) => s + v, 0);
  let angulo = Math.random() * Math.PI * 2;
  const rNucleo = R * 0.12;
  const rGajo = R * 0.83;
  const bordes: number[] = [];
  for (let gI = 0; gI < gajos; gI++) {
    const ancho = (anchos[gI] / suma) * Math.PI * 2;
    const a0 = angulo + 0.006, a1 = angulo + ancho - 0.006;
    bordes.push(angulo);
    angulo += ancho;

    const camino = new Path2D();
    const am = (a0 + a1) / 2;
    camino.moveTo(cx + Math.cos(am) * rNucleo, cx + Math.sin(am) * rNucleo);
    camino.lineTo(cx + Math.cos(a0) * rGajo * 0.97, cx + Math.sin(a0) * rGajo * 0.97);
    camino.arc(cx, cx, rGajo, a0 + 0.015, a1 - 0.015);
    camino.closePath();

    for (const [ctx, base] of [[color, '#e2700f'], [alto, '#555555'], [rug, '#262626']] as const) {
      ctx.save();
      ctx.clip(camino);
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, tam, tam);
      ctx.restore();
    }

    // Vesículas de jugo: gotas alargadas orientadas hacia el centro
    const cantidad = Math.round(560 * (tam / 2048) * anchos[gI]);
    for (const ctx of [color, alto, rug]) { ctx.save(); ctx.clip(camino); }
    for (let k = 0; k < cantidad; k++) {
      const a = azar(a0, a1);
      const r = azar(rNucleo * 1.1, rGajo * 0.98);
      const x = cx + Math.cos(a) * r, y = cx + Math.sin(a) * r;
      const largo = azar(0.045, 0.1) * R;
      const grosor = largo * azar(0.22, 0.32);
      const giro = a + azar(-0.12, 0.12);
      const pintar = (ctx: CanvasRenderingContext2D, centro: string, borde: string) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(giro);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, largo / 2);
        g.addColorStop(0, centro);
        g.addColorStop(1, borde);
        ctx.fillStyle = g;
        ctx.scale(1, grosor / largo);
        ctx.beginPath();
        ctx.arc(0, 0, largo / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      const calidez = Math.random();
      pintar(color, calidez > 0.5 ? 'rgba(255,184,82,0.95)' : 'rgba(255,160,50,0.95)', 'rgba(214,96,10,0.95)');
      pintar(alto, 'rgba(255,255,255,0.95)', 'rgba(70,70,70,0.9)');
      pintar(rug, 'rgba(10,10,10,1)', 'rgba(60,60,60,1)');
      // Brillo húmedo
      if (Math.random() > 0.55) {
        color.fillStyle = 'rgba(255,240,210,0.45)';
        color.beginPath();
        color.ellipse(x + Math.cos(giro + 1.2) * grosor * 0.25, y + Math.sin(giro + 1.2) * grosor * 0.25, largo * 0.14, grosor * 0.12, giro, 0, Math.PI * 2);
        color.fill();
      }
    }
    for (const ctx of [color, alto, rug]) ctx.restore();
  }

  // Membranas entre gajos y núcleo central
  for (const a of bordes) {
    for (const [ctx, estilo, ancho] of [[color, 'rgba(250,236,206,0.72)', 0.008], [alto, 'rgba(40,40,40,1)', 0.012], [rug, 'rgba(190,190,190,1)', 0.008]] as const) {
      ctx.strokeStyle = estilo;
      ctx.lineWidth = R * ancho;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * rNucleo, cx + Math.sin(a) * rNucleo);
      ctx.lineTo(cx + Math.cos(a) * R * 0.86, cx + Math.sin(a) * R * 0.86);
      ctx.stroke();
    }
  }
  const gNucleo = color.createRadialGradient(cx, cx, 0, cx, cx, rNucleo * 1.15);
  gNucleo.addColorStop(0, '#fff3dc');
  gNucleo.addColorStop(1, '#f2dcb4');
  circulo(color, rNucleo * 1.15, gNucleo);
  circulo(alto, rNucleo * 1.15, '#6a6a6a');
  circulo(rug, rNucleo * 1.15, '#c8c8c8');
  for (let i = 0; i < 260; i++) {
    const a = Math.random() * Math.PI * 2;
    color.strokeStyle = 'rgba(225,195,150,0.35)';
    color.lineWidth = 1.2;
    color.beginPath();
    color.moveTo(cx, cx);
    color.lineTo(cx + Math.cos(a) * rNucleo * azar(0.5, 1.1), cx + Math.sin(a) * rNucleo * azar(0.5, 1.1));
    color.stroke();
  }

  const mapa = new THREE.CanvasTexture(cColor);
  mapa.colorSpace = THREE.SRGBColorSpace;
  const normales = new THREE.CanvasTexture(normalesDesdeAltura(cAlto, 1.1));
  const rugosidad = new THREE.CanvasTexture(cRug);
  for (const t of [mapa, normales, rugosidad]) t.anisotropy = 8;
  return { mapa, normales, rugosidad };
}

/* ---------- Hoja con nervaduras ---------- */

function texturasHoja(tam: number) {
  const [c, ctx] = lienzo(tam);
  const [cAlto, alto] = lienzo(tam);
  const g = ctx.createLinearGradient(0, 0, tam, 0);
  g.addColorStop(0, '#1d4a24');
  g.addColorStop(0.5, '#2f6b33');
  g.addColorStop(1, '#1d4a24');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, tam, tam);
  alto.fillStyle = '#808080';
  alto.fillRect(0, 0, tam, tam);
  const nervio = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    for (const [cx2, estilo] of [[ctx, 'rgba(150,190,110,0.55)'], [alto, 'rgba(210,210,210,1)']] as const) {
      cx2.strokeStyle = estilo;
      cx2.lineWidth = w;
      cx2.lineCap = 'round';
      cx2.beginPath();
      cx2.moveTo(x0, y0);
      cx2.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - tam * 0.02, x1, y1);
      cx2.stroke();
    }
  };
  nervio(tam / 2, tam, tam / 2, 0, tam * 0.012);
  for (let i = 1; i < 11; i++) {
    const y = tam * (1 - i / 11);
    nervio(tam / 2, y, tam * 0.08, y - tam * 0.1, tam * 0.004);
    nervio(tam / 2, y, tam * 0.92, y - tam * 0.1, tam * 0.004);
  }
  const mapa = new THREE.CanvasTexture(c);
  mapa.colorSpace = THREE.SRGBColorSpace;
  return { mapa, normales: new THREE.CanvasTexture(normalesDesdeAltura(cAlto, 1.5)) };
}

function texturaHalo() {
  const [c, ctx] = lienzo(256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,200,110,0.7)');
  g.addColorStop(0.35, 'rgba(242,150,60,0.25)');
  g.addColorStop(1, 'rgba(242,150,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Contorno real del modelo en el plano y = 0 (para que la tapa del corte calce exacto). */
function contornoEnCero(geo: THREE.BufferGeometry) {
  const pos = geo.attributes.position;
  const idx = geo.index!;
  const puntos: { a: number; x: number; z: number }[] = [];
  const v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  for (let i = 0; i < idx.count; i += 3) {
    for (let k = 0; k < 3; k++) v[k].fromBufferAttribute(pos, idx.getX(i + k));
    for (let k = 0; k < 3; k++) {
      const a = v[k], b = v[(k + 1) % 3];
      if ((a.y > 0) === (b.y > 0)) continue;
      const t = a.y / (a.y - b.y);
      const x = a.x + (b.x - a.x) * t;
      const z = a.z + (b.z - a.z) * t;
      puntos.push({ a: Math.atan2(z, x), x, z });
    }
  }
  // Los puntos de cruce están sobre la superficie real: se ordenan por ángulo y se depuran
  puntos.sort((p, q) => p.a - q.a);
  const contorno: THREE.Vector2[] = [];
  let ultimo = -Infinity;
  for (const p of puntos) {
    if (p.a - ultimo < 0.015) continue;
    contorno.push(new THREE.Vector2(p.x, p.z));
    ultimo = p.a;
  }
  return contorno;
}

/* ---------- Escena ---------- */

export function crearEscenaNaranja(canvas: HTMLCanvasElement, opciones: Opciones): EscenaNaranja | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  const { movil, reducido } = opciones;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, movil ? 1.6 : 2));
  // Tone mapping "neutral" (Khronos PBR): respeta el tono y la saturación reales del naranja
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
  camara.position.set(0, 0, 8);

  const pmrem = new THREE.PMREMGenerator(renderer);

  // Luces de apoyo: clave cálida (sol de tarde) y contraluz dorado. El HDRI aporta el resto.
  const clave = new THREE.DirectionalLight(0xffe0b0, 1.6);
  clave.position.set(-3, 4, 5);
  escena.add(clave);
  const contra = new THREE.DirectionalLight(0xffc46b, 2.4);
  contra.position.set(3, 2, -4);
  escena.add(contra);
  escena.add(new THREE.AmbientLight(0xffe2b8, 0.15));

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaHalo(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  halo.scale.setScalar(7.5);
  halo.position.z = -2;
  escena.add(halo);

  const R = 1.15;
  const fruta = new THREE.Group();
  fruta.visible = false;
  escena.add(fruta);

  const planos: { plano: THREE.Plane; local: THREE.Plane; malla: THREE.Object3D }[] = [];
  let mitadIzq = new THREE.Group();
  let mitadDer = new THREE.Group();
  let aparicion = 0;

  /* — Hoja y pedúnculo — */
  const formaHoja = new THREE.Shape();
  formaHoja.moveTo(0, 0);
  formaHoja.bezierCurveTo(0.34, 0.16, 0.4, 0.62, 0, 1.1);
  formaHoja.bezierCurveTo(-0.4, 0.62, -0.34, 0.16, 0, 0);
  const geoHoja = new THREE.ShapeGeometry(formaHoja, 32);
  const posH = geoHoja.attributes.position;
  const uvH = geoHoja.attributes.uv;
  for (let i = 0; i < posH.count; i++) {
    const x = posH.getX(i), y = posH.getY(i);
    posH.setZ(i, -x * x * 1.1 + Math.sin(y * 2.6) * 0.07);
    uvH.setXY(i, x / 0.8 + 0.5, y / 1.1);
  }
  geoHoja.computeVertexNormals();
  const texHoja = texturasHoja(movil ? 512 : 1024);
  const matHoja = new THREE.MeshPhysicalMaterial({
    map: texHoja.mapa,
    normalMap: texHoja.normales,
    roughness: 0.38,
    clearcoat: 0.7,
    clearcoatRoughness: 0.25,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const hoja = new THREE.Group();
  const mallaHoja = new THREE.Mesh(geoHoja, matHoja);
  mallaHoja.rotation.set(-0.55, 0.45, -0.9);
  mallaHoja.position.set(0.04, 0.09, 0);
  const matTallo = new THREE.MeshStandardMaterial({ color: 0x4f3a1e, roughness: 0.85, transparent: true });
  const tallo = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.035, 0.2, 12), matTallo);
  tallo.position.y = 0.05;
  tallo.rotation.z = 0.22;
  hoja.add(mallaHoja, tallo);
  hoja.scale.setScalar(0.7);

  /* — Carga del escaneo y del HDRI — */
  const cargarHdri = new HDRLoader().loadAsync(RUTA_HDRI).then((hdr) => {
    escena.environment = pmrem.fromEquirectangular(hdr).texture;
    escena.environmentIntensity = 0.85;
    escena.environmentRotation.set(0, 1.2, 0);
    hdr.dispose();
  });

  const cargarModelo = new GLTFLoader().loadAsync(RUTA_MODELO).then((gltf) => {
    let original: THREE.Mesh | null = null;
    gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh && !original) original = o as THREE.Mesh; });
    if (!original) throw new Error('Modelo sin malla');
    const malla = original as THREE.Mesh;
    const matOriginal = malla.material as THREE.MeshStandardMaterial;

    // Geometría: centrada, un poco más redonda (la lima es más alargada que la naranja) y escalada a R
    const geo = malla.geometry.clone();
    geo.computeBoundingBox();
    const caja = geo.boundingBox!;
    const centro = caja.getCenter(new THREE.Vector3());
    geo.translate(-centro.x, -centro.y, -centro.z);
    geo.scale(1, 0.84, 1);
    geo.computeBoundingBox();
    const tam = geo.boundingBox!.getSize(new THREE.Vector3());
    const escala = (R * 2) / Math.max(tam.x, tam.y, tam.z);
    geo.scale(escala, escala, escala);
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    const polo = geo.boundingBox!.max.y; // extremo del pedúnculo

    const mapa = recolorearCascara(matOriginal.map!.image as HTMLImageElement);
    const matBase = new THREE.MeshPhysicalMaterial({
      map: mapa,
      normalMap: matOriginal.normalMap,
      normalScale: new THREE.Vector2(1.6, 1.6),
      roughnessMap: matOriginal.roughnessMap,
      roughness: 0.92,
      metalness: 0,
      clearcoat: 0.25,
      clearcoatRoughness: 0.32,
      side: THREE.DoubleSide,
    });

    const contorno = contornoEnCero(geo);
    const corte = texturasCorte(movil ? 1024 : 2048);
    const matCorte = new THREE.MeshPhysicalMaterial({
      map: corte.mapa,
      normalMap: corte.normales,
      normalScale: new THREE.Vector2(0.6, 0.6),
      roughnessMap: corte.rugosidad,
      roughness: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      emissive: new THREE.Color(0xff7a1a),
      emissiveMap: corte.mapa,
      emissiveIntensity: 0.06,
    });
    const radioMax = Math.max(...contorno.map((p) => p.length()));

    function crearTapa(invertir: boolean) {
      const forma = new THREE.Shape(contorno.map((p) => new THREE.Vector2(p.x, invertir ? -p.y : p.y)));
      const g = new THREE.ShapeGeometry(forma, 1);
      const pos = g.attributes.position;
      const uv = g.attributes.uv;
      for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / (2 * radioMax) + 0.5, pos.getY(i) / (2 * radioMax) + 0.5);
      g.rotateX(invertir ? -Math.PI / 2 : Math.PI / 2);
      return new THREE.Mesh(g, matCorte);
    }

    function crearMitad(superior: boolean) {
      const pivote = new THREE.Group();
      const interno = new THREE.Group();
      const mat = matBase.clone();
      const local = new THREE.Plane(new THREE.Vector3(0, superior ? 1 : -1, 0), 0);
      const plano = local.clone();
      mat.clippingPlanes = [plano];
      const cascara = new THREE.Mesh(geo, mat);
      interno.add(cascara);
      interno.add(crearTapa(!superior));
      // La hoja nace del pedúnculo real del escaneo y gira con la fruta
      if (superior) {
        hoja.position.set(0, polo - 0.04, 0);
        interno.add(hoja);
      }
      interno.rotation.z = Math.PI / 2; // la fruta se corta de izquierda a derecha
      pivote.add(interno);
      planos.push({ plano, local, malla: cascara });
      return pivote;
    }
    mitadIzq = crearMitad(true);
    mitadDer = crearMitad(false);
    fruta.add(mitadIzq, mitadDer);
  });

  Promise.all([cargarHdri, cargarModelo])
    .then(() => {
      fruta.visible = true;
      canvas.dispatchEvent(new CustomEvent('naranja-lista'));
      if (reducido || pausado) renderizar();
    })
    .catch((error) => {
      console.error('[escena-naranja] No se pudo cargar el modelo 3D', error);
      canvas.dispatchEvent(new CustomEvent('naranja-error'));
    });

  /* — Pétalos de azahar y polen — */
  const cantidad = movil ? 55 : 140;
  const formaPetalo = new THREE.Shape();
  formaPetalo.moveTo(0, 0);
  formaPetalo.bezierCurveTo(0.09, 0.05, 0.08, 0.2, 0, 0.26);
  formaPetalo.bezierCurveTo(-0.08, 0.2, -0.09, 0.05, 0, 0);
  const geoPetalo = new THREE.ShapeGeometry(formaPetalo, 8);
  const pp = geoPetalo.attributes.position;
  for (let i = 0; i < pp.count; i++) pp.setZ(i, -Math.pow(pp.getX(i) * 4, 2) * 0.03);
  geoPetalo.computeVertexNormals();
  const matPetalo = new THREE.MeshPhysicalMaterial({
    color: 0xfff6ea,
    roughness: 0.55,
    sheen: 0.6,
    sheenColor: new THREE.Color(0xffffff),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
  });
  const petalos = new THREE.InstancedMesh(geoPetalo, matPetalo, cantidad);
  const datosPetalos = Array.from({ length: cantidad }, () => ({
    x: (Math.random() - 0.5) * 12,
    y: (Math.random() - 0.5) * 8,
    z: -4 + Math.random() * 6,
    vy: 0.12 + Math.random() * 0.22,
    giro: Math.random() * Math.PI * 2,
    vgiro: (Math.random() - 0.5) * 1.4,
    fase: Math.random() * Math.PI * 2,
    escala: 0.35 + Math.random() * 0.55,
  }));
  escena.add(petalos);
  const auxiliar = new THREE.Object3D();

  const nPolen = movil ? 140 : 320;
  const geoPolen = new THREE.BufferGeometry();
  const posPolen = new Float32Array(nPolen * 3);
  for (let i = 0; i < nPolen; i++) {
    posPolen[i * 3] = (Math.random() - 0.5) * 14;
    posPolen[i * 3 + 1] = (Math.random() - 0.5) * 9;
    posPolen[i * 3 + 2] = -5 + Math.random() * 7;
  }
  geoPolen.setAttribute('position', new THREE.BufferAttribute(posPolen, 3));
  const polen = new THREE.Points(
    geoPolen,
    new THREE.PointsMaterial({ color: 0xf2c14e, size: 0.03, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  escena.add(polen);

  /* — Estado y encuadre — */
  let progreso = 0;
  let punteroX = 0;
  let punteroY = 0;
  let giroLibre = 0.6;
  let pausado = false;
  let cuadro = 0;
  let escalaVista = 1;
  let desplazamientoX = 0;
  let alturaBase = 0;
  let alturaAbierta = 0;
  let separacionBase = 1.5;
  const reloj = new THREE.Clock();

  function ajustarTamano() {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement ?? canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    escalaVista = camara.aspect < 0.7 ? 0.5 : camara.aspect < 1 ? 0.62 : camara.aspect < 1.3 ? 0.82 : 1;
    desplazamientoX = camara.aspect >= 1.3 ? 1.55 : 0;
    alturaBase = camara.aspect < 0.7 ? 0.85 : camara.aspect < 1 ? 0.5 : 0;
    alturaAbierta = camara.aspect < 1 ? -0.35 : 0;
    separacionBase = camara.aspect < 0.7 ? 1.12 : 1.5;
    camara.updateProjectionMatrix();
  }
  const observador = new ResizeObserver(() => {
    ajustarTamano();
    if (reducido || pausado) renderizar();
  });
  observador.observe(canvas.parentElement ?? canvas);
  ajustarTamano();

  function actualizar(dt: number, t: number) {
    const apertura = suave(0.22, 0.7, progreso);
    const zoom = suave(0.72, 1, progreso);
    if (fruta.visible && aparicion < 1) aparicion = Math.min(1, aparicion + dt * 0.9);
    const entrada = reducido ? 1 : 1 - Math.pow(1 - aparicion, 3);

    if (apertura < 0.02) giroLibre += dt * 0.3;
    else giroLibre += (Math.round(giroLibre / (Math.PI * 2)) * Math.PI * 2 - giroLibre) * Math.min(1, dt * 4);
    fruta.rotation.y = giroLibre;
    fruta.rotation.x += (punteroY * 0.22 - fruta.rotation.x) * Math.min(1, dt * 3);
    fruta.position.y = Math.sin(t * 0.8) * 0.05 * (1 - apertura) + alturaBase + (alturaAbierta - alturaBase) * apertura - (1 - entrada) * 0.6;
    fruta.position.x = desplazamientoX * (1 - suave(0.1, 0.4, progreso));
    fruta.scale.setScalar(escalaVista * (0.85 + entrada * 0.15));

    const separacion = separacionBase * apertura;
    const giro = 1.2 * apertura;
    mitadIzq.position.x = -separacion;
    mitadIzq.rotation.y = -giro;
    mitadDer.position.x = separacion;
    mitadDer.rotation.y = giro;

    matHoja.opacity = matTallo.opacity = (1 - suave(0.25, 0.5, progreso)) * entrada;
    hoja.visible = matHoja.opacity > 0.01;

    const objetivoX = mitadDer.position.x * escalaVista * zoom;
    camara.position.x += (punteroX * 0.4 * (1 - zoom) + objetivoX - camara.position.x) * Math.min(1, dt * 4 || 1);
    camara.position.z = 8 - zoom * 5.2;
    camara.lookAt(objetivoX, fruta.position.y * zoom, 0);

    halo.position.set(objetivoX + fruta.position.x, fruta.position.y, -2);
    halo.material.opacity = (0.5 + apertura * 0.35) * entrada;

    const viento = 1 + progreso * 2.5;
    datosPetalos.forEach((p, i) => {
      if (!reducido) {
        p.y -= p.vy * dt * viento;
        p.x += Math.sin(t * 0.5 + p.fase) * dt * 0.15 * viento;
        p.giro += p.vgiro * dt;
        if (p.y < -4.5) {
          p.y = 4.5;
          p.x = (Math.random() - 0.5) * 12;
        }
      }
      auxiliar.position.set(p.x, p.y, p.z);
      auxiliar.rotation.set(p.giro, p.giro * 0.7, p.fase);
      auxiliar.scale.setScalar(p.escala);
      auxiliar.updateMatrix();
      petalos.setMatrixAt(i, auxiliar.matrix);
    });
    petalos.instanceMatrix.needsUpdate = true;
    polen.rotation.y = t * 0.02;

    // Los planos de corte siguen a cada mitad en el espacio del mundo
    escena.updateMatrixWorld();
    for (const { plano, local, malla } of planos) plano.copy(local).applyMatrix4(malla.matrixWorld);
  }

  function renderizar() {
    actualizar(0, reloj.elapsedTime);
    renderer.render(escena, camara);
  }

  function bucle() {
    cuadro = requestAnimationFrame(bucle);
    const dt = Math.min(reloj.getDelta(), 0.05);
    actualizar(dt, reloj.elapsedTime);
    renderer.render(escena, camara);
  }

  if (reducido) {
    progreso = 0.6;
    giroLibre = 0;
    renderizar();
  } else {
    bucle();
  }

  return {
    setProgreso(p) {
      progreso = reducido ? 0.6 : p;
    },
    setPuntero(x, y) {
      punteroX = x;
      punteroY = y;
    },
    renderizar,
    pausar(pausa) {
      if (reducido || pausa === pausado) return;
      pausado = pausa;
      if (pausa) cancelAnimationFrame(cuadro);
      else {
        reloj.getDelta();
        bucle();
      }
    },
    destruir() {
      cancelAnimationFrame(cuadro);
      observador.disconnect();
      renderer.dispose();
      pmrem.dispose();
    },
  };
}

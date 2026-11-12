// Configuración compartida de movimiento: GSAP + ScrollTrigger + SplitText y scroll suave con Lenis.
// Con "movimiento reducido" activado en el dispositivo, no hay scroll suave ni animaciones de scroll.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esMovil = window.matchMedia('(max-width: 899px)').matches;

let lenis: Lenis | null = null;
let anclaPreparada = false;

// Al llegar desde otra página con una sección en la dirección (por ejemplo /es/via-educa/#propuesta),
// el navegador salta antes de que las fotos, las fuentes y el scroll suave terminen de acomodar la página,
// y la sección queda más abajo. Volvemos a ubicarla cuando la página ya está armada.
function irAlAncla() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const destino = document.getElementById(id);
  if (!destino) return;
  if (lenis) lenis.scrollTo(destino, { offset: -72, immediate: true, force: true });
  else window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY - 72, behavior: 'auto' });
}
function prepararAncla() {
  if (anclaPreparada || !location.hash) return;
  anclaPreparada = true;
  const ajustar = () => { ScrollTrigger.refresh(); irAlAncla(); };
  requestAnimationFrame(ajustar);
  if (document.readyState === 'complete') setTimeout(ajustar, 150);
  else window.addEventListener('load', () => { ajustar(); setTimeout(ajustar, 400); }, { once: true });
  document.fonts?.ready.then(() => setTimeout(ajustar, 50));
}

export function iniciarScrollSuave() {
  prepararAncla();
  if (reducido || lenis) return lenis;
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((tiempo) => lenis?.raf(tiempo * 1000));
  gsap.ticker.lagSmoothing(0);

  // Los enlaces internos (#seccion) también se desplazan suave
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href') || '';
      if (id.length < 2) return;
      const destino = document.querySelector<HTMLElement>(id);
      if (!destino) return;
      e.preventDefault();
      lenis?.scrollTo(destino, { offset: -72 });
      history.replaceState(null, '', id);
    });
  });
  // Con el scroll suave ya activo, volvemos a ubicar la sección pedida en la dirección
  if (location.hash) requestAnimationFrame(irAlAncla);
  return lenis;
}

export { gsap, ScrollTrigger, SplitText };

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

export function iniciarScrollSuave() {
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
  return lenis;
}

export { gsap, ScrollTrigger, SplitText };

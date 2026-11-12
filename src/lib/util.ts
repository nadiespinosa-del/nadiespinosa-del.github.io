// Funciones de ayuda compartidas por los componentes (con soporte de idioma).
import site from '../data/site.json';
import { idiomas, type Idioma } from '../i18n/ui';

export type Temporada = 'fruto' | 'interpretativa';

/** Nombres de los meses en el idioma pedido, con mayúscula inicial. */
export function meses(idioma: Idioma = 'es'): string[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = new Date(2026, i, 15).toLocaleDateString(idiomas[idioma].locale, { month: 'long' });
    return m.charAt(0).toUpperCase() + m.slice(1);
  });
}
export const MESES = meses('es');

/** Devuelve la modalidad que corresponde a un mes (1–12) según site.json. */
export function temporadaDelMes(mes: number): Temporada {
  return site.temporada.mesesConFruto.includes(mes) ? 'fruto' : 'interpretativa';
}

const SIN_COSTO: Record<Idioma, string> = { es: 'Sin costo', pt: 'Grátis', en: 'Free' };

/** Formatea un precio en pesos uruguayos. 0 = "Sin costo". */
export function formatoPrecio(valor: number, idioma: Idioma = 'es'): string {
  if (valor === 0) return SIN_COSTO[idioma];
  return `${site.tarifas.moneda} ${valor.toLocaleString('es-UY')}`;
}

/** Precio mínimo publicado (para mostrar "desde"). Ignora las tarifas sin costo. */
export function precioDesde(): number {
  return Math.min(...site.tarifas.items.map((t) => t.precio).filter((p) => p > 0));
}

/** Arma un enlace de WhatsApp con mensaje prellenado. Devuelve null si no hay número cargado. */
export function enlaceWhatsApp(mensaje: string): string | null {
  const numero = site.contacto.whatsapp?.numero;
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/** Fecha larga: "Sábado 16 de mayo de 2027" / "Sábado, 16 de maio de 2027" / "Saturday, May 16, 2027". */
export function fechaLarga(iso: string, idioma: Idioma = 'es'): string {
  const fecha = new Date(`${iso}T12:00:00`);
  let texto = fecha.toLocaleDateString(idiomas[idioma].locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  if (idioma === 'es') texto = texto.replace(',', '');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Duración en minutos a texto: 170 → "2 h 50 min". */
export function formatoDuracion(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h > 0 ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
}

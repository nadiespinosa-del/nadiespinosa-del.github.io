// Acceso a los datos de contenido según el idioma.
// Español: src/data/*.json · Portugués: src/data/pt/*.json · Inglés: src/data/en/*.json
import type { Idioma } from '../i18n/ui';
import experienciaEs from '../data/experiencia.json';
import experienciaPt from '../data/pt/experiencia.json';
import experienciaEn from '../data/en/experiencia.json';
import historiaEs from '../data/historia.json';
import historiaPt from '../data/pt/historia.json';
import historiaEn from '../data/en/historia.json';
import lineaEs from '../data/linea-tiempo.json';
import lineaPt from '../data/pt/linea-tiempo.json';
import lineaEn from '../data/en/linea-tiempo.json';
import preguntasEs from '../data/preguntas.json';
import preguntasPt from '../data/pt/preguntas.json';
import preguntasEn from '../data/en/preguntas.json';
import textosSitio from '../data/textos-sitio.json';
import site from '../data/site.json';
import catalogoEs from '../data/experiencias.json';

/** Catálogo de experiencias de VÍA en el idioma pedido (los filtros usan siempre los tipos en español). */
export function catalogo(idioma: Idioma) {
  return catalogoEs.experiencias.map(({ traducciones, ...e }) => {
    const local = idioma === 'es' ? {} : (traducciones as Record<string, Partial<typeof e>>)[idioma] ?? {};
    return { ...e, ...local, tiposFiltro: e.tipos };
  });
}

export const experiencia = (idioma: Idioma) => ({ es: experienciaEs, pt: experienciaPt, en: experienciaEn })[idioma];
export const historia = (idioma: Idioma) => ({ es: historiaEs, pt: historiaPt, en: historiaEn })[idioma];
export const lineaTiempo = (idioma: Idioma) => ({ es: lineaEs, pt: lineaPt, en: lineaEn })[idioma];
export const preguntas = (idioma: Idioma) => ({ es: preguntasEs, pt: preguntasPt, en: preguntasEn })[idioma];
export const textos = (idioma: Idioma) => textosSitio[idioma];

/** Tarifas con montos de site.json y nombres en el idioma pedido. */
export function tarifas(idioma: Idioma) {
  const tx = textosSitio[idioma];
  return site.tarifas.items.map((item) => {
    const local = tx.tarifas[item.id as keyof typeof tx.tarifas] as { nombre: string; nota?: string; etiqueta?: string };
    // precio null = sin monto fijo (descuentos especiales o a consultar): se muestra la etiqueta
    return { id: item.id, precio: item.precio as number | null, nombre: local.nombre, nota: local.nota, etiqueta: local.etiqueta };
  });
}

// Validación accesible y envío por WhatsApp de los formularios del sitio.
// Mientras no haya un servicio de formularios conectado, las consultas se envían
// armando un mensaje de WhatsApp con los datos completados.
// Los textos de error llegan en el atributo data-textos del formulario (según el idioma de la página).

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const TEXTOS_ES = {
  obligatorio: 'Completá este campo.',
  punto: 'Este punto es obligatorio.',
  email: 'Revisá el email: parece que falta algo (ejemplo: nombre@correo.com).',
  numero: 'Ingresá un número entero válido.',
  maximo: 'El máximo es {n}.',
  fecha: 'Elegí una fecha a partir de hoy.',
  opcion: 'Elegí una opción.',
  revisa1: 'Revisá un dato antes de enviar:',
  revisaN: 'Revisá {n} datos antes de enviar:',
  si: 'Sí',
};
export type TextosFormulario = typeof TEXTOS_ES;

function textos(form: HTMLFormElement): TextosFormulario {
  try {
    return { ...TEXTOS_ES, ...JSON.parse(form.dataset.textos || '{}') };
  } catch {
    return TEXTOS_ES;
  }
}

/** Muestra u oculta el error de un campo. El contenedor del error tiene id = `${campo.id}-error`. */
export function marcarError(campo: Control | HTMLElement, mensaje: string) {
  const id = campo.id || campo.getAttribute('data-grupo') || '';
  const contenedor = document.getElementById(`${id}-error`);
  if (contenedor) contenedor.textContent = mensaje;
  if (mensaje) campo.setAttribute('aria-invalid', 'true');
  else campo.removeAttribute('aria-invalid');
}

/** Revisa los campos obligatorios y los formatos básicos. Devuelve la lista de errores. */
export function validarCampos(form: HTMLFormElement): { campo: HTMLElement; mensaje: string }[] {
  const tx = textos(form);
  const errores: { campo: HTMLElement; mensaje: string }[] = [];
  const campos = Array.from(form.querySelectorAll<Control>('input, select, textarea')).filter((c) => c.type !== 'radio' && c.type !== 'submit');

  campos.forEach((campo) => {
    let mensaje = '';
    const valor = campo.value.trim();
    if (campo instanceof HTMLInputElement && campo.type === 'checkbox') {
      if (campo.required && !campo.checked) mensaje = campo.dataset.error || tx.punto;
    } else if (campo.required && !valor) {
      mensaje = campo.dataset.error || tx.obligatorio;
    } else if (valor && campo instanceof HTMLInputElement && campo.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) {
      mensaje = tx.email;
    } else if (valor && campo instanceof HTMLInputElement && campo.type === 'number') {
      const n = Number(valor);
      if (!Number.isInteger(n) || n < Number(campo.min || 0)) mensaje = tx.numero;
      else if (campo.max && n > Number(campo.max)) mensaje = tx.maximo.replace('{n}', campo.max);
    } else if (valor && campo instanceof HTMLInputElement && campo.type === 'date' && campo.min && valor < campo.min) {
      mensaje = tx.fecha;
    }
    if (campo.id) marcarError(campo, mensaje);
    if (mensaje) errores.push({ campo, mensaje });
  });

  // Grupos de opciones (radio) obligatorios: <fieldset data-grupo="id" data-requerido>
  form.querySelectorAll<HTMLFieldSetElement>('fieldset[data-requerido]').forEach((grupo) => {
    const elegido = grupo.querySelector<HTMLInputElement>('input[type="radio"]:checked');
    const mensaje = elegido ? '' : grupo.dataset.error || tx.opcion;
    marcarError(grupo, mensaje);
    if (mensaje) errores.push({ campo: grupo, mensaje });
  });

  return errores;
}

/** Muestra el resumen de errores arriba del formulario y lleva el foco ahí. */
export function mostrarResumen(form: HTMLFormElement, errores: { campo: HTMLElement; mensaje: string }[]) {
  const tx = textos(form);
  const resumen = form.querySelector<HTMLElement>('[data-resumen-errores]');
  if (!resumen) return;
  if (errores.length === 0) {
    resumen.hidden = true;
    resumen.innerHTML = '';
    return;
  }
  const items = errores
    .map(({ campo, mensaje }) => {
      const destino = campo.id || campo.querySelector('input')?.id || '';
      return `<li><a href="#${destino}">${mensaje}</a></li>`;
    })
    .join('');
  const encabezado = errores.length === 1 ? tx.revisa1 : tx.revisaN.replace('{n}', String(errores.length));
  resumen.innerHTML = `<p class="font-semibold">${encabezado}</p><ul class="mt-2 grid list-disc gap-1 pl-5">${items}</ul>`;
  resumen.hidden = false;
  resumen.focus();
}

/** Arma el texto del mensaje con los campos que tienen data-etiqueta. */
export function armarMensaje(form: HTMLFormElement, introduccion: string): string {
  const tx = textos(form);
  const locale = form.dataset.locale || 'es-UY';
  const lineas: string[] = [introduccion, ''];
  form.querySelectorAll<HTMLElement>('[data-etiqueta]').forEach((el) => {
    const etiqueta = el.dataset.etiqueta;
    let valor = '';
    if (el instanceof HTMLSelectElement) valor = el.selectedOptions[0]?.textContent?.trim() || '';
    else if (el instanceof HTMLInputElement && el.type === 'checkbox') valor = el.checked ? tx.si : '';
    else if (el instanceof HTMLInputElement && el.type === 'number') valor = Number(el.value) > 0 ? el.value : '';
    else if (el instanceof HTMLInputElement && el.type === 'date' && el.value) {
      valor = new Date(`${el.value}T12:00:00`).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } else if (el instanceof HTMLFieldSetElement) valor = el.querySelector<HTMLInputElement>('input:checked')?.value || '';
    else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) valor = el.value.trim();
    else valor = el.textContent?.trim() || '';
    if (valor) lineas.push(`• ${etiqueta}: ${valor}`);
  });
  return lineas.join('\n');
}

/** Abre WhatsApp con el mensaje y muestra el estado de éxito con un enlace de respaldo. */
export function enviarPorWhatsApp(form: HTMLFormElement, mensaje: string) {
  const numero = form.dataset.whatsapp;
  const exito = form.querySelector<HTMLElement>('[data-exito]');
  if (!numero) return;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank', 'noopener');
  if (exito) {
    const enlace = exito.querySelector<HTMLAnchorElement>('a');
    if (enlace) enlace.href = url;
    exito.hidden = false;
    exito.focus();
  }
}

/** Limpia el error de un campo apenas la persona lo corrige. */
export function limpiarAlEditar(form: HTMLFormElement) {
  form.addEventListener('input', (e) => {
    const campo = e.target as HTMLElement;
    if (campo.getAttribute('aria-invalid') === 'true' && campo.id) marcarError(campo, '');
    const grupo = campo.closest<HTMLFieldSetElement>('fieldset[data-grupo]');
    if (grupo?.getAttribute('aria-invalid') === 'true') marcarError(grupo, '');
  });
}

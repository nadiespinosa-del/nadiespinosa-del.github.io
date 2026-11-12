// Textos de validación de formularios por idioma (se pasan al navegador en data-textos).
import type { Idioma } from './ui';

export const textosValidacion: Record<Idioma, Record<string, string>> = {
  es: {
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
  },
  pt: {
    obligatorio: 'Preencha este campo.',
    punto: 'Este item é obrigatório.',
    email: 'Confira o e-mail: parece que falta algo (exemplo: nome@email.com).',
    numero: 'Digite um número inteiro válido.',
    maximo: 'O máximo é {n}.',
    fecha: 'Escolha uma data a partir de hoje.',
    opcion: 'Escolha uma opção.',
    revisa1: 'Confira um dado antes de enviar:',
    revisaN: 'Confira {n} dados antes de enviar:',
    si: 'Sim',
  },
  en: {
    obligatorio: 'Fill in this field.',
    punto: 'This item is required.',
    email: 'Check the email address: something seems to be missing (example: name@email.com).',
    numero: 'Enter a valid whole number.',
    maximo: 'The maximum is {n}.',
    fecha: 'Choose a date from today onwards.',
    opcion: 'Choose an option.',
    revisa1: 'Check one detail before sending:',
    revisaN: 'Check {n} details before sending:',
    si: 'Yes',
  },
};

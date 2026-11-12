// Fotos reales de Camino de Azahar (Chacra La Victoria, Colonia Osimani, Salto).
// Fotos propias del equipo, optimizadas en public/fotos/camino-de-azahar/ (sin datos EXIF ni GPS).
// Para usar una: foto('entrada', idioma) devuelve { src, alt } listo para <Imagen>.
import type { Idioma } from '../i18n/ui';

type Textos = Record<Idioma, string>;
const carpeta = '/fotos/camino-de-azahar';

const registro = {
  entrada: { es: 'Portera de entrada de la Chacra La Victoria, con el naranjal al fondo al atardecer', pt: 'Porteira de entrada da Chacra La Victoria, com o laranjal ao fundo ao entardecer', en: 'Entrance gate of Chacra La Victoria, with the orange grove behind it at sunset' },
  'atardecer-filas': { es: 'Atardecer entre dos filas de naranjos de la chacra', pt: 'Entardecer entre duas fileiras de laranjeiras da chácara', en: 'Sunset between two rows of orange trees at the farm' },
  'filas-naranjos': { es: 'Filas de naranjos cargados de fruta bajo el cielo azul', pt: 'Fileiras de laranjeiras carregadas de frutas sob o céu azul', en: 'Rows of orange trees full of fruit under a blue sky' },
  'mandarino-cargado': { es: 'Árbol cargado de mandarinas maduras', pt: 'Árvore carregada de tangerinas maduras', en: 'A tree heavy with ripe mandarins' },
  'arbol-desde-abajo': { es: 'Copa de un naranjo llena de fruta, vista desde abajo', pt: 'Copa de uma laranjeira cheia de frutas, vista de baixo', en: 'The crown of an orange tree full of fruit, seen from below' },
  'hilera-mandarinas': { es: 'Racimo de mandarinas en primer plano y la hilera de árboles al fondo', pt: 'Cacho de tangerinas em primeiro plano e a fileira de árvores ao fundo', en: 'A cluster of mandarins up close, with the row of trees behind' },
  'rama-naranjas': { es: 'Naranjas maduras colgando de una rama', pt: 'Laranjas maduras penduradas em um galho', en: 'Ripe oranges hanging from a branch' },
  'rama-naranjas-2': { es: 'Rama de naranjo con frutos maduros', pt: 'Galho de laranjeira com frutos maduros', en: 'An orange branch with ripe fruit' },
  'mandarinas-bokeh': { es: 'Dos mandarinas colgando de una rama, con el campo desenfocado detrás', pt: 'Duas tangerinas penduradas em um galho, com o campo desfocado atrás', en: 'Two mandarins hanging from a branch, with the field blurred behind' },
  'arbol-c7': { es: 'Naranjo joven con su cartel de identificación del cuadro C-7', pt: 'Laranjeira jovem com a placa de identificação do talhão C-7', en: 'A young orange tree with its C-7 block marker' },
  'naranjo-pastizal': { es: 'Naranjo con fruta entre pastizales de la chacra', pt: 'Laranjeira com frutas entre o capim da chácara', en: 'An orange tree with fruit among the farm grasses' },
  'naranjo-joven': { es: 'Naranjo joven con naranjas maduras en el campo', pt: 'Laranjeira jovem com laranjas maduras no campo', en: 'A young orange tree with ripe oranges in the field' },
  'naranjo-persona': { es: 'Naranjo con fruta y una persona recorriendo la chacra al fondo', pt: 'Laranjeira com frutas e uma pessoa percorrendo a chácara ao fundo', en: 'An orange tree with fruit and someone walking the farm in the background' },
  'recorrida-grupo': { es: 'Tres mujeres sonriendo entre las filas de mandarinos', pt: 'Três mulheres sorrindo entre as fileiras de tangerineiras', en: 'Three women smiling between rows of mandarin trees' },
  'recorrida-perro': { es: 'Recorrida entre los mandarinos, con el perro de la chacra', pt: 'Passeio entre as tangerineiras, com o cachorro da chácara', en: 'Walking among the mandarin trees, with the farm dog' },
  'recorrido-visitantes': { es: 'Grupo de visitantes caminando por el borde del monte durante el recorrido', pt: 'Grupo de visitantes caminhando pela borda do bosque durante o percurso', en: 'A group of visitors walking along the edge of the woods during the tour' },
  'huerta-visitantes': { es: 'Visitantes cosechando en la huerta con un balde', pt: 'Visitantes colhendo na horta com um balde', en: 'Visitors picking vegetables in the garden with a bucket' },
  'mesa-degustacion': { es: 'Mesas de degustación bajo los árboles, con mermeladas, panes y jugo', pt: 'Mesas de degustação sob as árvores, com geleias, pães e suco', en: 'Tasting tables under the trees, with jams, bread and juice' },
  'feria-visitantes': { es: 'Visitantes recorriendo los puestos de la feria de productos locales', pt: 'Visitantes percorrendo as bancas da feira de produtos locais', en: 'Visitors browsing the stalls at the local produce market' },
  'feria-frascos': { es: 'Mermeladas, jugos, budines y dulces de los emprendedores de la feria', pt: 'Geleias, sucos, bolos e doces dos empreendedores da feira', en: 'Jams, juices, cakes and sweets from the market makers' },
  'feria-miel-huevos': { es: 'Miel, panales y huevos de campo en cajones de la feria', pt: 'Mel, favos e ovos caipiras em caixotes da feira', en: 'Honey, honeycomb and free-range eggs on market crates' },
  'mandarinos-contraluz': { es: 'Mandarinos cargados de fruta a contraluz, al caer la tarde', pt: 'Tangerineiras carregadas de frutas contra a luz, no fim da tarde', en: 'Mandarin trees full of fruit, backlit in the late afternoon' },
  'mano-naranjas': { es: 'Mano sosteniendo tres naranjas recién cortadas con sus hojas', pt: 'Mão segurando três laranjas recém-colhidas com suas folhas', en: 'A hand holding three freshly picked oranges with their leaves' },
  'galpon-seleccion': { es: 'Galpón de la chacra con la máquina de selección y cajones de fruta', pt: 'Galpão da chácara com a máquina de seleção e caixas de frutas', en: 'The farm shed with the sorting machine and crates of fruit' },
  'fruta-seleccion': { es: 'Fruta recién cosechada en la mesa de selección', pt: 'Fruta recém-colhida na mesa de seleção', en: 'Freshly picked fruit on the sorting table' },
  'maquina-seleccion': { es: 'Mesa de selección con fruta y la cinta de rodillos al fondo', pt: 'Mesa de seleção com frutas e a esteira de rolos ao fundo', en: 'Sorting table with fruit and the roller belt behind' },
  'linea-empaque': { es: 'Canales de la línea de selección y empaque en el galpón de la chacra', pt: 'Canais da linha de seleção e embalagem no galpão da chácara', en: 'Channels of the sorting and packing line in the farm shed' },
  'rio-uruguay-atardecer': { es: 'Atardecer sobre el río Uruguay en Salto', pt: 'Pôr do sol sobre o rio Uruguai em Salto', en: 'Sunset over the Uruguay River in Salto' },
  fogon: { es: 'Grupo de jóvenes alrededor de un fogón de noche, entre pinos', pt: 'Grupo de jovens ao redor de uma fogueira à noite, entre pinheiros', en: 'A group of young people around a campfire at night, among pine trees' },
  'manos-pelando': { es: 'Manos pelando una naranja recién cortada en el naranjal', pt: 'Mãos descascando uma laranja recém-colhida no laranjal', en: 'Hands peeling a freshly picked orange in the grove' },
  'recorrida-espaldas': { es: 'Dos mujeres recorriendo el naranjal, de espaldas', pt: 'Duas mulheres percorrendo o laranjal, de costas', en: 'Two women walking through the orange grove, seen from behind' },
  'sol-naranjal': { es: 'El sol de la tarde sobre las filas del naranjal', pt: 'O sol da tarde sobre as fileiras do laranjal', en: 'The afternoon sun over the rows of the orange grove' },
  'plaza-33': { es: 'Fuente de la Plaza 33 con la Catedral de Salto al fondo', pt: 'Chafariz da Praça 33 com a Catedral de Salto ao fundo', en: 'The Plaza 33 fountain with Salto Cathedral behind' },
  'camino-rural': { es: 'Camino rural de balasto entre eucaliptos y árboles, al atardecer', pt: 'Estrada rural de cascalho entre eucaliptos e árvores, ao entardecer', en: 'A gravel country road between eucalyptus and other trees, late in the day' },
  'atardecer-rio': { es: 'Atardecer rojo sobre el río, con la silueta de un árbol y la ciudad en la otra orilla', pt: 'Pôr do sol vermelho sobre o rio, com a silhueta de uma árvore e a cidade na outra margem', en: 'A red sunset over the river, with a tree in silhouette and the town on the far bank' },
  'sendero-chacra': { es: 'Sendero de tierra bajo grandes árboles, con la sombra de las ramas sobre el camino', pt: 'Trilha de terra sob grandes árvores, com a sombra dos galhos no caminho', en: 'A dirt track under large trees, with the shadows of the branches across it' },
  'hojas-citricos': { es: 'Brotes y hojas nuevas de un cítrico al sol', pt: 'Brotos e folhas novas de um cítrico ao sol', en: 'New shoots and leaves on a citrus tree in the sun' },
  'retrato-nadia': { es: 'Retrato de Nadia Espinosa', pt: 'Retrato de Nadia Espinosa', en: 'Portrait of Nadia Espinosa' },
  'retrato-sthefanie': { es: 'Retrato de Sthefanie Machado', pt: 'Retrato de Sthefanie Machado', en: 'Portrait of Sthefanie Machado' },
  'feria-mesa': { es: 'Mesa de la feria con frascos, panes, huevos y jugo de naranja', pt: 'Mesa da feira com potes, pães, ovos e suco de laranja', en: 'A market table with jars, bread, eggs and orange juice' },
} satisfies Record<string, Textos>;

export type ClaveFoto = keyof typeof registro;

// Fotos de archivo (Biblioteca Nacional de Uruguay, Colecciones Digitales; licencia indicada en cada ficha: Creative Commons 2.0)
// y fotos del edificio de Dieste de la FADU (Universidad de la República), con su crédito.
// Se guardan recortadas (sin bordes de escaneo) en public/fotos/archivo/ y siempre se muestran con su crédito.
const archivo = {
  'salto-1888': {
    es: 'Salto en 1888: vista desde el Cerro hacia la calle Yacuy y el puerto', pt: 'Salto em 1888: vista do Cerro para a rua Yacuy e o porto', en: 'Salto in 1888: view from the Cerro towards Yacuy street and the port',
    credito: 'Lorenzo Spátola, 1888. Biblioteca Nacional de Uruguay, Álbum Batallón de Cazadores N.º 4',
  },
  'naranjal-solari-1960': {
    es: 'Tractor abriendo surcos en uno de los naranjales de Pedro B. Solari, hacia 1960', pt: 'Trator abrindo sulcos em um dos laranjais de Pedro B. Solari, por volta de 1960', en: 'A tractor ploughing one of Pedro B. Solari\'s orange groves, around 1960',
    credito: 'Biblioteca Nacional de Uruguay, Colección Aníbal Barrios Pintos (Salto), c. 1960',
  },
  'recolectando-1960': {
    es: 'Dos mujeres recolectando naranjas en Salto, hacia 1960', pt: 'Duas mulheres colhendo laranjas em Salto, por volta de 1960', en: 'Two women picking oranges in Salto, around 1960',
    credito: 'Biblioteca Nacional de Uruguay, Colección Aníbal Barrios Pintos (Salto), c. 1960',
  },
  'puerto-salto-1920': {
    es: 'El puerto de Salto hacia 1920, en una postal coloreada', pt: 'O porto de Salto por volta de 1920, em um cartão-postal colorido', en: 'The port of Salto around 1920, on a hand-coloured postcard',
    credito: 'Biblioteca Nacional de Uruguay, Colección Aníbal Barrios Pintos (Salto), c. 1920',
  },
  'cosecheros-1961': {
    es: 'Cosecheros vuelcan naranjas en cajones junto al naranjal, en Salto, 1961', pt: 'Colhedores despejam laranjas em caixas junto ao laranjal, em Salto, 1961', en: 'Pickers tip oranges into crates beside the grove in Salto, 1961',
    credito: 'Biblioteca Nacional de Uruguay, Colección Aníbal Barrios Pintos (Salto), 1961',
  },
  'calle-uruguay-1900': {
    es: 'La calle Uruguay de Salto a principios del siglo XX, con las vías del tranvía', pt: 'A rua Uruguay de Salto no início do século XX, com os trilhos do bonde', en: 'Uruguay street in Salto in the early 20th century, with its tram tracks',
    credito: 'Biblioteca Nacional de Uruguay, Colección Aníbal Barrios Pintos (Salto), principios del siglo XX',
  },
  'fabrica-solari-1960': {
    es: 'Trabajadoras de la fábrica de jugo de naranja de Pedro Solari, hacia 1960', pt: 'Trabalhadoras da fábrica de suco de laranja de Pedro Solari, por volta de 1960', en: "Workers at Pedro Solari's orange juice factory, around 1960",
    credito: 'Biblioteca Nacional de Uruguay, Colección Aníbal Barrios Pintos (Salto), c. 1960',
  },
  'termas-arapey-1960': {
    es: 'Una de las piscinas de las Termas del Arapey, en 1960', pt: 'Uma das piscinas das Termas do Arapey, em 1960', en: 'One of the pools at the Arapey hot springs, in 1960',
    credito: 'Biblioteca Nacional de Uruguay, Colección Aníbal Barrios Pintos (Salto), 1960',
  },
  'jovenes-recolectando-1960': {
    es: 'Dos jóvenes salteñas cosechan naranjas con canastas, en 1960', pt: 'Duas jovens de Salto colhem laranjas com cestos, em 1960', en: 'Two young women from Salto pick oranges into baskets, in 1960',
    credito: 'Biblioteca Nacional de Uruguay, Colección Aníbal Barrios Pintos (Salto), 1960',
  },
  // Foto actual del edificio de Dieste, pasada a blanco y negro (FADU, Universidad de la República)
  'dieste-bovedas': {
    es: 'Bóvedas de doble curvatura de Eladio Dieste sobre el galpón de Citrícola Salteña, con cajones de fruta apilados', pt: 'Abóbadas de dupla curvatura de Eladio Dieste sobre o galpão da Citrícola Salteña, com caixas de fruta empilhadas', en: "Eladio Dieste's double-curvature vaults over the Citrícola Salteña shed, with stacked fruit crates",
    credito: 'Facultad de Arquitectura, Diseño y Urbanismo (FADU), Universidad de la República, sitio Eladio Dieste. En blanco y negro',
  },
  'dieste-bovedas-vertical': {
    es: 'Bóvedas de Eladio Dieste con la luz de sus lucernarios, en el galpón de Citrícola Salteña', pt: 'Abóbadas de Eladio Dieste com a luz de suas claraboias, no galpão da Citrícola Salteña', en: "Eladio Dieste's vaults lit by their skylights, in the Citrícola Salteña shed",
    credito: 'Facultad de Arquitectura, Diseño y Urbanismo (FADU), Universidad de la República, sitio Eladio Dieste. En blanco y negro',
  },
} satisfies Record<string, Textos & { credito: string }>;

export type ClaveArchivo = keyof typeof archivo;

/** Foto de archivo con su crédito (para mostrar debajo de la imagen o en las fuentes). */
export function fotoArchivo(clave: ClaveArchivo, idioma: Idioma = 'es') {
  return { src: `/fotos/archivo/${clave}.jpg`, alt: archivo[clave][idioma], credito: archivo[clave].credito };
}

/** Lista de créditos de todas las fotos de archivo usadas en el sitio. */
export const creditosArchivo = [...new Set(Object.values(archivo).map((a) => a.credito))];

export function foto(clave: ClaveFoto, idioma: Idioma = 'es') {
  return { src: `${carpeta}/${clave}.jpg`, alt: registro[clave][idioma] };
}

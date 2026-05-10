/// Datos de seed para las rutas de cada evento.
/// Los poiTitles deben coincidir con los title definidos en points-of-interest.ts.
/// El orden del array determina el sort_order de los POIs en la ruta.
export default [
  {
    eventName: 'Festival de les Arts',
    name: 'Ruta por el Recinto del Festival',
    description: 'Recorrido por los espacios principales del Festival de les Arts: desde el escenario central frente al Palau de les Arts Reina Sofía hasta las actividades del Agora.',
    poiTitles: ['Escenario Principal - Palau de les Arts', 'Agora - Zona de Actividades'],
  },
  {
    eventName: 'IVAM - Exposición de Arte Contemporáneo',
    name: 'Ruta por la Colección Permanente del IVAM',
    description: 'Recorrido por dos obras clave de la colección permanente del IVAM: el informalismo matérico de Antoni Tàpies y el constructivismo lumínico de László Moholy-Nagy.',
    poiTitles: ['Gran díptico rojo y negro', 'Leda y el cisne'],
  },
  {
    eventName: 'Tour por el Centro Histórico de Valencia',
    name: 'Ruta Monumental Clàssica',
    description: 'Itinerario por los monumentos más representativos del centre històric de Valencia.',
    poiTitles: ['Catedral de València', 'Plaça de la Reina'],
  },
];

/// Datos de seed para las rutas de cada evento.
/// Los poiTitles deben coincidir con los title definidos en points-of-interest.ts.
/// El orden del array determina el sort_order de los POIs en la ruta.
export default [
  {
    eventName: 'Museo del Prado',
    name: 'Ruta de las Obras Maestras',
    description: 'Recorrido por las obras más icónicas del museo, desde Velázquez hasta El Bosco.',
    poiTitles: ['Las Meninas', 'El Jardín de las Delicias'],
  },
  {
    eventName: 'Concierto Sinfónico de Verano',
    name: 'Ruta de Acceso al Recinto',
    description: 'Recorrido desde la entrada principal hasta la zona VIP.',
    poiTitles: ['Entrada Principal', 'Zona VIP'],
  },
  {
    eventName: 'Tour por el Madrid de los Austrias',
    name: 'Ruta Monumental Clásica',
    description: 'Itinerario por los monumentos más representativos del Madrid de los siglos XVI-XVII.',
    poiTitles: ['Catedral de la Almudena', 'Plaza Mayor'],
  },
];

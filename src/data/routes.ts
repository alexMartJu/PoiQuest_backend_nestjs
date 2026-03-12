/// Datos de seed para las rutas de cada evento.
/// Los poiQrCodes deben coincidir con los qrCode definidos en points-of-interest.ts.
/// El orden del array determina el sort_order de los POIs en la ruta.
export default [
  {
    eventName: 'Museo del Prado',
    name: 'Ruta de las Obras Maestras',
    description: 'Recorrido por las obras más icónicas del museo, desde Velázquez hasta El Bosco.',
    poiQrCodes: ['QR_PRADO_MENINAS_001', 'QR_PRADO_JARDIN_002'],
  },
  {
    eventName: 'Concierto Sinfónico de Verano',
    name: 'Ruta de Acceso al Recinto',
    description: 'Recorrido desde la entrada principal hasta la zona VIP.',
    poiQrCodes: ['QR_ROCK_ENTRADA_001', 'QR_ROCK_VIP_002'],
  },
  {
    eventName: 'Tour por el Madrid de los Austrias',
    name: 'Ruta Monumental Clásica',
    description: 'Itinerario por los monumentos más representativos del Madrid de los siglos XVI-XVII.',
    poiQrCodes: ['QR_MADRID_ALMUDENA_001', 'QR_MADRID_PLAZA_MAYOR_002'],
  },
];

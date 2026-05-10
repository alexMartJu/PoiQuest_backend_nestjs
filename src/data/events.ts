import { EventStatus } from '../events/domain/enums/event-status.enum';

export default [
  {
    name: 'Festival de les Arts',
    description: 'Festival multidisciplinar organizado por la Generalitat Valenciana que reúne música en directo, teatro, danza y circo en el icónico recinto del Palau de les Arts Reina Sofía y el Agora de la Ciutat de les Arts i les Ciències de Valencia.',
    categoryName: 'Concierto',
    cityName: 'Valencia',
    organizerName: 'Valencia Promotor Cultural',
    sponsorName: 'Fundación Bancaja',
    status: EventStatus.ACTIVE,
    isPremium: true,
    price: 35.00,
    capacityPerDay: 8000,
    startDate: '2026-05-28',
    endDate: '2026-06-01',
    imageFiles: [
      'event1.jpg',
      'event1_1.jpg'
    ]
  },
  {
    name: 'IVAM - Exposición de Arte Contemporáneo',
    description: 'Visita guiada premium a la colección permanente del Institut Valencià d Art Modern (IVAM), uno de los museos de arte contemporáneo más importantes de España. Incluye acceso a exposiciones temporales y guía especializado.',
    categoryName: 'Museo',
    cityName: 'Valencia',
    organizerName: 'Institut Valencià de Cultura',
    sponsorName: 'Amstel Valencia',
    status: EventStatus.ACTIVE,
    isPremium: true,
    price: 12.00,
    capacityPerDay: 300,
    startDate: '2026-01-15',
    endDate: '2026-12-31',
    imageFiles: [
      'event2.jpg'
    ]
  },
  {
    name: 'Cinema Jove - Festival Internacional de Cine',
    description: 'Festival internacional de cine orientado a jóvenes creadores y amantes del séptimo arte. Proyecciones, cortometrajes, largometrajes y talleres en la Filmoteca de Valencia y otros espacios de la ciudad.',
    categoryName: 'Otros',
    cityName: 'Valencia',
    organizerName: 'Institut Valencià de Cultura',
    sponsorName: null,
    status: EventStatus.ACTIVE,
    isPremium: false,
    price: null,
    capacityPerDay: 500,
    startDate: '2026-06-15',
    endDate: '2026-06-28',
    imageFiles: [
      'event3.jpg'
    ]
  },
  {
    name: 'Tour por el Centro Histórico de Valencia',
    description: 'Recorrido guiado por el casco histórico de Valencia, visitando la Catedral, la Plaça de la Reina, la Llotja de la Seda y el Mercat Central.',
    categoryName: 'Tour',
    cityName: 'Valencia',
    organizerName: 'Ayuntamiento de Valencia',
    sponsorName: null,
    status: EventStatus.ACTIVE,
    isPremium: false,
    price: null,
    capacityPerDay: 25,
    startDate: '2026-02-01',
    endDate: '2026-11-30',
    imageFiles: [
      'event4.jpg'
    ]
  },
  {
    name: 'Feria de las Ciencias - Ciutat de les Arts i les Ciències',
    description: 'Exposición interactiva de innovaciones científicas y tecnológicas en el icónico complejo de la Ciutat de les Arts i les Ciències de Valencia.',
    categoryName: 'Otros',
    cityName: 'Valencia',
    organizerName: 'Institut Valencià de Cultura',
    sponsorName: 'Fundación Trinidad Alfonso',
    status: EventStatus.ACTIVE,
    isPremium: false,
    price: null,
    capacityPerDay: 2500,
    startDate: '2026-05-20',
    endDate: '2026-09-14',
    imageFiles: [
      'event5.jpg'
    ]
  },
  {
    name: 'Feria de Julio de Valencia 2025',
    description: 'Feria de Julio de Valencia, celebración estival en los Jardines del Vivero con actividades culturales, conciertos y espectáculos para toda la familia.',
    categoryName: 'Otros',
    cityName: 'Valencia',
    organizerName: 'Ayuntamiento de Valencia',
    sponsorName: null,
    status: EventStatus.FINISHED,
    isPremium: false,
    price: null,
    capacityPerDay: null,
    startDate: '2025-07-01',
    endDate: '2025-08-31',
    imageFiles: [
      'event6.jpg'
    ]
  },
];


import { EventStatus } from '../events/domain/enums/event-status.enum';

export default [
  {
    name: 'Museo del Prado',
    description: 'Visita guiada al Museo Nacional del Prado, uno de los museos de arte más importantes del mundo.',
    categoryName: 'Museo',
    cityName: 'Madrid',
    organizerName: 'Ayuntamiento de Madrid',
    sponsorName: 'Banco Santander Cultural',
    status: EventStatus.ACTIVE,
    isPremium: false,
    price: null,
    capacityPerDay: 500,
    startDate: '2025-01-15',
    endDate: '2025-12-31',
    imageFiles: [
      'event1.jpg',
      'event1_1.jpg'
    ]
  },
  {
    name: 'Concierto Sinfónico de Verano',
    description: 'Gran concierto sinfónico al aire libre con la Orquesta Nacional.',
    categoryName: 'Concierto',
    cityName: 'Madrid',
    organizerName: 'EventPro España',
    sponsorName: 'Coca-Cola España',
    status: EventStatus.ACTIVE,
    isPremium: true,
    price: 25.00,
    capacityPerDay: 2000,
    startDate: '2025-07-20',
    endDate: '2025-07-22',
    imageFiles: [
      'event2.jpg'
    ]
  },
  {
    name: 'Romeo y Julieta',
    description: 'Representación teatral clásica de la obra de William Shakespeare.',
    categoryName: 'Teatro',
    cityName: 'Madrid',
    organizerName: 'Carlos Ruiz Promotor',
    sponsorName: null,
    status: EventStatus.ACTIVE,
    isPremium: true,
    price: 18.50,
    capacityPerDay: 300,
    startDate: '2025-03-10',
    endDate: '2025-04-15',
    imageFiles: [
      'event3.jpg'
    ]
  },
  {
    name: 'Tour por el Madrid de los Austrias',
    description: 'Recorrido guiado por el casco histórico de Madrid, visitando los principales monumentos del Madrid de los Austrias.',
    categoryName: 'Tour',
    cityName: 'Madrid',
    organizerName: 'Ayuntamiento de Madrid',
    sponsorName: null,
    status: EventStatus.ACTIVE,
    isPremium: false,
    price: null,
    capacityPerDay: 30,
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    imageFiles: [
      'event4.jpg'
    ]
  },
  {
    name: 'Feria de Ciencias y Tecnología',
    description: 'Exposición interactiva de innovaciones científicas y tecnológicas para todas las edades.',
    categoryName: 'Otros',
    cityName: 'Madrid',
    organizerName: 'Fundación IFEMA',
    sponsorName: 'Repsol Foundation',
    status: EventStatus.ACTIVE,
    isPremium: false,
    price: null,
    capacityPerDay: 3000,
    startDate: '2025-05-10',
    endDate: '2025-05-14',
    imageFiles: [
      'event5.jpg'
    ]
  },
  {
    name: 'Feria del Automovilismo',
    description: 'Exposición interactiva de innovaciones en el mundo del automovilismo.',
    categoryName: 'Otros',
    cityName: 'Madrid',
    organizerName: 'Fundación IFEMA',
    sponsorName: null,
    status: EventStatus.FINISHED,
    isPremium: false,
    price: null,
    capacityPerDay: null,
    startDate: '2025-05-10',
    endDate: '2025-05-14',
    imageFiles: [
      'event6.jpg'
    ]
  },
];


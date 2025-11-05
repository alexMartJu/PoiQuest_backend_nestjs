import { EventType } from '../events/domain/enums/event-type.enum';

export default [
  {
    name: 'Museo del Prado',
    description: 'Visita guiada al Museo Nacional del Prado, uno de los museos de arte más importantes del mundo.',
    type: EventType.MUSEUM,
    location: 'Madrid, España',
    startDate: '2025-01-15',
    endDate: '2025-12-31',
  },
  {
    name: 'Concierto Sinfónico de Verano',
    description: 'Gran concierto sinfónico al aire libre con la Orquesta Nacional.',
    type: EventType.CONCERT,
    location: 'Parque del Retiro, Madrid',
    startDate: '2025-07-20',
    endDate: '2025-07-22',
  },
  {
    name: 'Romeo y Julieta',
    description: 'Representación teatral clásica de la obra de William Shakespeare.',
    type: EventType.THEATER,
    location: 'Teatro Real, Madrid',
    startDate: '2025-03-10',
    endDate: '2025-04-15',
  },
  {
    name: 'Tour por el Madrid de los Austrias',
    description: 'Recorrido guiado por el casco histórico de Madrid, visitando los principales monumentos del Madrid de los Austrias.',
    type: EventType.TOUR,
    location: 'Centro histórico de Madrid',
    startDate: '2025-02-01',
    endDate: '2025-11-30',
  },
  {
    name: 'Feria de Ciencias y Tecnología',
    description: 'Exposición interactiva de innovaciones científicas y tecnológicas para todas las edades.',
    type: EventType.OTHER,
    location: 'IFEMA, Madrid',
    startDate: '2025-05-10',
    endDate: '2025-05-14',
  },
];

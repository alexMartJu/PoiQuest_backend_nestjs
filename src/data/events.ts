import { EventStatus } from '../events/domain/enums/event-status.enum';

export default [
  {
    name: 'Museo del Prado',
    description: 'Visita guiada al Museo Nacional del Prado, uno de los museos de arte más importantes del mundo.',
    categoryName: 'Museo',
    status: EventStatus.ACTIVE,
    location: 'Madrid, España',
    startDate: '2025-01-15',
    endDate: '2025-12-31',
    imageUrls: [
      'https://images.unsplash.com/photo-1648309665249-896e1a8163d7',
      'https://images.unsplash.com/photo-1550897621-1deef9bdeb0e'
    ]
  },
  {
    name: 'Concierto Sinfónico de Verano',
    description: 'Gran concierto sinfónico al aire libre con la Orquesta Nacional.',
    categoryName: 'Concierto',
    status: EventStatus.ACTIVE,
    location: 'Parque del Retiro, Madrid',
    startDate: '2025-07-20',
    endDate: '2025-07-22',
    imageUrls: [
      'https://images.unsplash.com/photo-1692707483537-8f5e57e71531',
      'https://images.unsplash.com/photo-1632652304944-440624f680e9'
    ]
  },
  {
    name: 'Romeo y Julieta',
    description: 'Representación teatral clásica de la obra de William Shakespeare.',
    categoryName: 'Teatro',
    status: EventStatus.ACTIVE,
    location: 'Teatro Real, Madrid',
    startDate: '2025-03-10',
    endDate: '2025-04-15',
    imageUrls: [
      'https://images.unsplash.com/photo-1683295550245-e957a39d2e67',
      'https://images.unsplash.com/photo-1582152492025-4d3dba658fc7'
    ]
  },
  {
    name: 'Tour por el Madrid de los Austrias',
    description: 'Recorrido guiado por el casco histórico de Madrid, visitando los principales monumentos del Madrid de los Austrias.',
    categoryName: 'Tour',
    status: EventStatus.ACTIVE,
    location: 'Centro histórico de Madrid',
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    imageUrls: [
      'https://images.unsplash.com/photo-1714849702561-005bbaa816ff',
      'https://images.unsplash.com/photo-1704133931035-65772e746917'
    ]
  },
  {
    name: 'Feria de Ciencias y Tecnología',
    description: 'Exposición interactiva de innovaciones científicas y tecnológicas para todas las edades.',
    categoryName: 'Otros',
    status: EventStatus.ACTIVE,
    location: 'IFEMA, Madrid',
    startDate: '2025-05-10',
    endDate: '2025-05-14',
    imageUrls: [
      'https://images.unsplash.com/photo-1573757056004-065ad36e2cf4',
      'https://images.unsplash.com/photo-1554475901-4538ddfbccc2'
    ]
  },
  {
    name: 'Feria del Automovilismo',
    description: 'Exposición interactiva de innovaciones en el mundo del automovilismo.',
    categoryName: 'Otros',
    status: EventStatus.FINISHED,
    location: 'IFEMA, Madrid',
    startDate: '2025-05-10',
    endDate: '2025-05-14',
    imageUrls: [
      'https://images.unsplash.com/photo-1756147782837-67a523b75330',
      'https://images.unsplash.com/photo-1664911200744-8c3a496baa2a'
    ]
  },
];

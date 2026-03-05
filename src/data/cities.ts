import { PartnerStatus } from '../partners/domain/enums/partner-status.enum';

export default [
  {
    name: 'Madrid',
    country: 'España',
    region: 'Comunidad de Madrid',
    description: 'Capital del Reino de España y una de las ciudades más vibrantes de Europa, con una oferta cultural y de ocio inigualable.',
    status: PartnerStatus.ACTIVE,
  },
  {
    name: 'Barcelona',
    country: 'España',
    region: 'Cataluña',
    description: 'Ciudad mediterránea de vanguardia, conocida por su arquitectura modernista, sus playas y su activa vida cultural.',
    status: PartnerStatus.ACTIVE,
  },
  {
    name: 'Sevilla',
    country: 'España',
    region: 'Andalucía',
    description: 'Ciudad del sur de España famosa por la Semana Santa, la Feria de Abril, la Giralda y su rica gastronomía.',
    status: PartnerStatus.ACTIVE,
  },
  {
    name: 'Valencia',
    country: 'España',
    region: 'Comunidad Valenciana',
    description: 'Ciudad costera española conocida por las Fallas, la paella y su moderno distrito de la Ciudad de las Artes y las Ciencias.',
    status: PartnerStatus.ACTIVE,
  },
];

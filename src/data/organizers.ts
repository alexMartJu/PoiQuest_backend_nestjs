import { OrganizerType } from '../partners/domain/enums/organizer-type.enum';
import { PartnerStatus } from '../partners/domain/enums/partner-status.enum';

export default [
  {
    name: 'Ayuntamiento de Valencia',
    type: OrganizerType.CITY_COUNCIL,
    contactEmail: 'cultura@valencia.es',
    contactPhone: '+34 96 352 54 78',
    description: 'Organismo municipal responsable de la gestión cultural y de eventos de la ciudad de Valencia.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['organizer1.jpg'],
  },
  {
    name: 'Institut Valencià de Cultura',
    type: OrganizerType.COMPANY,
    contactEmail: 'info@ivc.gva.es',
    contactPhone: '+34 96 387 40 00',
    description: 'Entidad pública de la Generalitat Valenciana que impulsa actividades culturales, musicales y escénicas en la Comunidad Valenciana.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['organizer2.jpg'],
  },
  {
    name: 'Fundació Palau de la Música de València',
    type: OrganizerType.COMPANY,
    contactEmail: 'info@palauvalencia.com',
    contactPhone: '+34 96 337 50 20',
    description: 'Fundación que gestiona el Palau de la Música de València, referente en la programación de conciertos, festivales y actividades musicales en la ciudad.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['organizer3.jpg'],
  },
  {
    name: 'Valencia Promotor Cultural',
    type: OrganizerType.COMPANY,
    contactEmail: 'contacto@valenciapromotor.es',
    contactPhone: '+34 96 100 20 30',
    description: 'Promotora especializada en la organización de actividades culturales, eventos escénicos y propuestas artísticas en la Comunidad Valenciana.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['organizer4.jpg'],
  },
];

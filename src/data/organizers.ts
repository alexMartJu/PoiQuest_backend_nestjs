import { OrganizerType } from '../partners/domain/enums/organizer-type.enum';
import { PartnerStatus } from '../partners/domain/enums/partner-status.enum';

export default [
  {
    name: 'Ayuntamiento de Madrid',
    type: OrganizerType.CITY_COUNCIL,
    contactEmail: 'cultura@madrid.es',
    contactPhone: '+34 91 000 00 00',
    description: 'Organismo municipal responsable de la gestión cultural y de eventos de la ciudad de Madrid.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['organizer1.jpg'],
  },
  {
    name: 'EventPro España',
    type: OrganizerType.COMPANY,
    contactEmail: 'info@eventpro.es',
    contactPhone: '+34 91 100 20 30',
    description: 'Empresa especializada en la organización de eventos culturales, conciertos y ferias en toda España.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['organizer2.jpg'],
  },
  {
    name: 'Fundación IFEMA',
    type: OrganizerType.COMPANY,
    contactEmail: 'info@ifema.es',
    contactPhone: '+34 91 722 50 00',
    description: 'Institución ferial de Madrid, referente a nivel nacional e internacional en la organización de ferias y congresos.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['organizer3.jpg'],
  },
  {
    name: 'Carlos Ruiz Promotor',
    type: OrganizerType.INDIVIDUAL,
    contactEmail: 'carlos@crpromotor.com',
    contactPhone: '+34 620 100 200',
    description: 'Promotor independiente especializado en espectáculos teatrales y musicales en el centro de Madrid.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['organizer4.jpg'],
  },
];

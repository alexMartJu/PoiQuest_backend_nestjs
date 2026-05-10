import { PartnerStatus } from '../partners/domain/enums/partner-status.enum';

export default [
  {
    name: 'Fundación Bancaja',
    websiteUrl: 'https://www.fundacionbancaja.es',
    contactEmail: 'comunicacion@fundacionbancaja.es',
    description: 'Fundación valenciana referente en la organización de exposiciones, talleres y actividades culturales y artísticas en la Comunidad Valenciana.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['sponsor1.jpg'],
  },
  {
    name: 'Amstel Valencia',
    websiteUrl: 'https://www.amstel.es',
    contactEmail: 'patrocinios@amstel.es',
    description: 'Marca de cerveza con fuerte arraigo en Valencia, patrocinadora habitual de eventos culturales, festivales y las Fallas de Valencia.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['sponsor2.jpg'],
  },
  {
    name: 'Fundación Trinidad Alfonso',
    websiteUrl: 'https://fundaciontrinidadalfonso.org',
    contactEmail: 'info@fundaciontrinidadalfonso.org',
    description: 'Fundación valenciana comprometida con la cultura y los proyectos sociales, impulsando iniciativas de impacto en la Comunidad Valenciana.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['sponsor3.jpg'],
  },
];

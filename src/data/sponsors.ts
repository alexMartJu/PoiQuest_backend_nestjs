import { PartnerStatus } from '../partners/domain/enums/partner-status.enum';

export default [
  {
    name: 'Banco Santander Cultural',
    websiteUrl: 'https://www.fundacionbancosantander.com/es/cultura',
    contactEmail: 'patrocinios@santander.com',
    description: 'División cultural del Banco Santander, patrocinador oficial de exposiciones y eventos artísticos en España.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['sponsor1.jpg'],
  },
  {
    name: 'Coca-Cola España',
    websiteUrl: 'https://www.cocacola.es',
    contactEmail: 'eventos@cocacola.es',
    description: 'Marca líder en bebidas refrescantes, patrocinador habitual de conciertos, festivales y eventos de ocio.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['sponsor2.jpg'],
  },
  {
    name: 'Repsol Foundation',
    websiteUrl: 'https://fundacion.repsol.com',
    contactEmail: 'fundacion@repsol.com',
    description: 'Fundación de Repsol dedicada al apoyo de proyectos culturales, medioambientales y sociales en España.',
    status: PartnerStatus.ACTIVE,
    imageFiles: ['sponsor3.jpg'],
  },
];

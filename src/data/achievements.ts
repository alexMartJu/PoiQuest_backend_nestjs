import { AchievementCategory } from '../gamification/domain/entities/achievement.entity';

export const achievements = [
  // Exploración - Escaneo de POIs
  {
    key: 'scan_1',
    name: 'Primer descubrimiento',
    description: 'Escanea tu primer punto de interés',
    category: AchievementCategory.EXPLORATION,
    threshold: 1,
    points: 20,
  },
  {
    key: 'scan_5',
    name: 'Explorador curioso',
    description: 'Escanea 5 puntos de interés',
    category: AchievementCategory.EXPLORATION,
    threshold: 5,
    points: 40,
  },
  {
    key: 'scan_15',
    name: 'Aventurero incansable',
    description: 'Escanea 15 puntos de interés',
    category: AchievementCategory.EXPLORATION,
    threshold: 15,
    points: 80,
  },
  {
    key: 'scan_30',
    name: 'Maestro explorador',
    description: 'Escanea 30 puntos de interés',
    category: AchievementCategory.EXPLORATION,
    threshold: 30,
    points: 120,
  },

  // Rutas completadas
  {
    key: 'route_1',
    name: 'Primera ruta',
    description: 'Completa tu primera ruta',
    category: AchievementCategory.ROUTES,
    threshold: 1,
    points: 50,
  },
  {
    key: 'route_5',
    name: 'Caminante experto',
    description: 'Completa 5 rutas',
    category: AchievementCategory.ROUTES,
    threshold: 5,
    points: 100,
  },
  {
    key: 'route_10',
    name: 'Conquistador de rutas',
    description: 'Completa 10 rutas',
    category: AchievementCategory.ROUTES,
    threshold: 10,
    points: 150,
  },

  // Eventos premium
  {
    key: 'premium_1',
    name: 'Primera experiencia premium',
    description: 'Compra tu primer evento premium',
    category: AchievementCategory.PREMIUM_EVENTS,
    threshold: 1,
    points: 120,
  },
  {
    key: 'premium_attend_1',
    name: 'Asistente premium',
    description: 'Asiste a un evento premium',
    category: AchievementCategory.PREMIUM_EVENTS,
    threshold: 1,
    points: 80,
  },
  {
    key: 'premium_5',
    name: 'Coleccionista premium',
    description: 'Compra 5 eventos premium',
    category: AchievementCategory.PREMIUM_EVENTS,
    threshold: 5,
    points: 200,
  },
  {
    key: 'premium_10',
    name: 'Mecenas cultural',
    description: 'Compra 10 eventos premium',
    category: AchievementCategory.PREMIUM_EVENTS,
    threshold: 10,
    points: 240,
  },
];

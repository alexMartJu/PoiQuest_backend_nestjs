import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { CityEntity } from '../../../partners/domain/entities/city.entity';
import citiesData from '../../../data/cities';

export class CitySeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const cityRepo = dataSource.getRepository(CityEntity);

    // Evitar insertar duplicados si ya existen
    const existing = await cityRepo.find();
    const existingNames = new Set(existing.map(c => c.name.toLowerCase()));

    const citiesToInsert = citiesData.filter(
      c => !existingNames.has(c.name.toLowerCase()),
    );

    if (citiesToInsert.length === 0) {
      console.log('Cities already seeded — skipping.');
      return;
    }

    const baseTime = Date.now() - 3600000;

    await dataSource.transaction(async (manager) => {
      for (let idx = 0; idx < citiesToInsert.length; idx++) {
        const data = citiesToInsert[idx];
        const ts = new Date(baseTime + idx * 1);

        const city = cityRepo.create({
          name: data.name,
          country: data.country,
          region: data.region ?? null,
          description: data.description ?? null,
          status: data.status,
          createdAt: ts,
          updatedAt: ts,
        });

        await manager.save(CityEntity, city);
      }
    });

    console.log(`Cities seeded successfully (${citiesToInsert.length} inserted)`);
  }
}

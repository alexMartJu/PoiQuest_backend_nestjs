import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { SponsorEntity } from '../../../partners/domain/entities/sponsor.entity';
import sponsorsData from '../../../data/sponsors';

export class SponsorSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const sponsorRepo = dataSource.getRepository(SponsorEntity);

    // Evitar insertar duplicados
    const existing = await sponsorRepo.find();
    const existingNames = new Set(existing.map(s => s.name.toLowerCase()));

    const toInsert = sponsorsData.filter(
      s => !existingNames.has(s.name.toLowerCase()),
    );

    if (toInsert.length === 0) {
      console.log('Sponsors already seeded — skipping.');
      return;
    }

    const baseTime = Date.now() - 3600000;

    await dataSource.transaction(async (manager) => {
      for (let idx = 0; idx < toInsert.length; idx++) {
        const data = toInsert[idx];
        const ts = new Date(baseTime + idx * 1);

        const sponsor = sponsorRepo.create({
          name: data.name,
          websiteUrl: data.websiteUrl ?? null,
          contactEmail: data.contactEmail ?? null,
          description: data.description ?? null,
          status: data.status,
          createdAt: ts,
          updatedAt: ts,
        });

        await manager.save(SponsorEntity, sponsor);
      }
    });

    console.log(`Sponsors seeded successfully (${toInsert.length} inserted)`);
  }
}

import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { OrganizerEntity } from '../../../partners/domain/entities/organizer.entity';
import organizersData from '../../../data/organizers';

export class OrganizerSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const organizerRepo = dataSource.getRepository(OrganizerEntity);

    // Evitar insertar duplicados
    const existing = await organizerRepo.find();
    const existingNames = new Set(existing.map(o => o.name.toLowerCase()));

    const toInsert = organizersData.filter(
      o => !existingNames.has(o.name.toLowerCase()),
    );

    if (toInsert.length === 0) {
      console.log('Organizers already seeded — skipping.');
      return;
    }

    const baseTime = Date.now() - 3600000;

    await dataSource.transaction(async (manager) => {
      for (let idx = 0; idx < toInsert.length; idx++) {
        const data = toInsert[idx];
        const ts = new Date(baseTime + idx * 1);

        const organizer = organizerRepo.create({
          name: data.name,
          type: data.type,
          contactEmail: data.contactEmail ?? null,
          contactPhone: data.contactPhone ?? null,
          description: data.description ?? null,
          status: data.status,
          createdAt: ts,
          updatedAt: ts,
        });

        await manager.save(OrganizerEntity, organizer);
      }
    });

    console.log(`Organizers seeded successfully (${toInsert.length} inserted)`);
  }
}

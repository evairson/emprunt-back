import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.material.createMany({
    data: [
      {
        name: 'Tente 4 places',
        description: 'Tente légère 4 saisons, idéale pour le camping.',
        photoUrl: null,
      },
      {
        name: 'Vélo de route',
        description: 'Vélo de route aluminium 21 vitesses.',
        photoUrl: null,
      },
      {
        name: 'Appareil photo reflex',
        description: 'Canon EOS 2000D avec objectif 18-55mm.',
        photoUrl: null,
      },
      {
        name: 'Sono portable',
        description: 'Enceinte Bluetooth 50W avec micro sans fil.',
        photoUrl: null,
      },
      {
        name: 'Vidéoprojecteur',
        description: 'Projecteur HD 3000 lumens avec câble HDMI.',
        photoUrl: null,
      },
    ],
  });

  console.log('Seed terminé : 5 matériels créés.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

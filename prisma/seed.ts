import { prisma } from '@/gateways/prismaClient';

const main = async (): Promise<void> => {
  await prisma.todo.createMany({
    data: [
      { completed: false, title: 'READMEを読む' },
      { completed: true, title: '開発環境を構築する' },
    ],
  });
};

await main();
await prisma.$disconnect();

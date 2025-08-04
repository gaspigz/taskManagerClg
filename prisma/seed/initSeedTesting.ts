import { PrismaClient, Role, TaskStatus, TaskType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const saltRounds = 10;

const randomFrom = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

async function main() {
  console.log('Seeding database...');

  const admin = await prisma.user.upsert({
    where: { username: 'ADMIN' },
    update: {},
    create: {
      username: 'ADMIN',
      name: 'Admin User',
      password: await bcrypt.hash('ADMIN', saltRounds),
      role: Role.ADMIN,
    },
  });

  const users: any[] = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        username: `user${i}`,
        name: `User ${i}`,
        password: await bcrypt.hash(`pass${i}`, saltRounds),
      },
    });
    users.push(user);
  }

  const taskTypes = [TaskType.URGENT, TaskType.MEDIUM, TaskType.LOW];
  const taskStatuses = [
    TaskStatus.PENDING,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.ARCHIVED,
  ];

  for (let i = 1; i <= 30; i++) {
    await prisma.task.create({
      data: {
        title: `Task ${i}`,
        description: `This is task ${i}`,
        type: randomFrom(taskTypes),
        status: randomFrom(taskStatuses),
        ownerId: randomFrom(users).id,
      },
    });
  }

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

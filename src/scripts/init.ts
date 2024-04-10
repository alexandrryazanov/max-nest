import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';
import { AuthService } from '../modules/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

async function main() {
  console.log('Seeding test data in DB...');
  const prismaInstance = new PrismaService();

  await prismaInstance.$transaction(async (prisma) => {
    const salt = randomBytes(32).toString('hex');
    const password = new AuthService(
      new PrismaService(),
      new ConfigService(),
      new JwtService(),
    ).hashPassword('qwerty', salt);

    await prisma.user.create({
      data: {
        name: 'Alex',
        email: 'test@test.ru',
        age: 32,
        password,
        salt,
      },
    });
  });

  console.log('Seeding test data in DB finished');
}

main()
  .catch((e) => console.error(String(e)))
  .finally(async () => {
    process.exit(0);
  });

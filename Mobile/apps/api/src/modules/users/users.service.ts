import { prisma } from '../../lib/prisma.js';

export class UsersService {
  getUserById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  getUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  createUser(input: { name: string; email: string; phone?: string }) {
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
      },
    });
  }
}

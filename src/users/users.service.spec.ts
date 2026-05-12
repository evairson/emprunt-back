import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

jest.mock('../prisma/prisma.service');
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UsersService } from './users.service';

const mockUser = { id: 'u1', email: 'a@test.com', username: 'alice', role: 'USER' as const };

const prismaMock = {
  client: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto: CreateUserDto = { id: 'u1', email: 'a@test.com', username: 'alice' };

    it('crée un utilisateur avec le rôle USER par défaut', async () => {
      prismaMock.client.user.findUnique.mockResolvedValue(null);
      prismaMock.client.user.create.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(prismaMock.client.user.create).toHaveBeenCalledWith({ data: dto });
      expect(result.role).toBe('USER');
    });

    it('lève ConflictException si l\'utilisateur existe déjà', async () => {
      prismaMock.client.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(prismaMock.client.user.create).not.toHaveBeenCalled();
    });
  });

  describe('makeAdmin', () => {
    it('passe le rôle à ADMIN', async () => {
      prismaMock.client.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.client.user.update.mockResolvedValue({ ...mockUser, role: 'ADMIN' });

      const result = await service.makeAdmin('u1');

      expect(prismaMock.client.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { role: 'ADMIN' },
      });
      expect(result.role).toBe('ADMIN');
    });

    it('lève NotFoundException si l\'utilisateur n\'existe pas', async () => {
      prismaMock.client.user.findUnique.mockResolvedValue(null);

      await expect(service.makeAdmin('u1')).rejects.toThrow(NotFoundException);
      expect(prismaMock.client.user.update).not.toHaveBeenCalled();
    });
  });
});

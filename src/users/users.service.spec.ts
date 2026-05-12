import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
import { PrismaService } from '../prisma/prisma.service';
import { FindOrCreateUserDto, UsersService } from './users.service';

const mockUser = { id: 'u1', email: 'a@test.com', username: 'alice', role: 'USER' as const };

const prismaMock = {
  client: {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
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

  describe('findOrCreate', () => {
    const dto: FindOrCreateUserDto = { id: 'u1', email: 'a@test.com', username: 'alice' };

    it('crée un utilisateur s\'il n\'existe pas', async () => {
      prismaMock.client.user.upsert.mockResolvedValue(mockUser);

      const result = await service.findOrCreate(dto);

      expect(prismaMock.client.user.upsert).toHaveBeenCalledWith({
        where: { id: dto.id },
        update: {},
        create: dto,
      });
      expect(result.role).toBe('USER');
    });

    it('retourne l\'utilisateur existant sans le modifier', async () => {
      prismaMock.client.user.upsert.mockResolvedValue(mockUser);

      await service.findOrCreate(dto);

      expect(prismaMock.client.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: {} }),
      );
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

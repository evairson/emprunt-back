import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export class CreateMaterialDto {
  name!: string;
  description!: string;
  photoUrl?: string;
}

export class UpdateMaterialDto {
  name?: string;
  description?: string;
  photoUrl?: string;
}

/** Matériel + Photo uploadée. */
@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    /* Liste tout le matériel */
    return this.prisma.client.material.findMany();
  }

  async findOne(id: string) {
    /* Détail d'un matériel */
    const material = await this.prisma.client.material.findUnique({ where: { id } });
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  create(dto: CreateMaterialDto) {
    /* Crée un matériel */
    return this.prisma.client.material.create({ data: dto });
  }

  async update(id: string, dto: UpdateMaterialDto) {
    /* Modifie un matériel */
    const material = await this.prisma.client.material.findUnique({ where: { id } });
    if (!material) throw new NotFoundException('Material not found');

    return this.prisma.client.material.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    /* Supprime un matériel */
    const material = await this.prisma.client.material.findUnique({ where: { id } });
    if (!material) throw new NotFoundException('Material not found');

    return this.prisma.client.material.delete({ where: { id } });
  }

  async setPhoto(id: string, filename: string) {
    /* Enregistre l'URL de la photo d'un matériel */
    const material = await this.prisma.client.material.findUnique({ where: { id } });
    if (!material) throw new NotFoundException('Material not found');

    return this.prisma.client.material.update({
      where: { id },
      data: { photoUrl: `/uploads/${filename}` },
    });
  }
}

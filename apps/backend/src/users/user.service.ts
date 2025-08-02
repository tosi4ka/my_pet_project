import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    return this.prismaService.client.user.create({
      data: createUserDto,
    });
  }

  findAll(): Promise<User[]> {
    return this.prismaService.client.user.findMany();
  }

  findById(id: string): Promise<User | null> {
    return this.prismaService.client.user.findUnique({
      where: { id },
    });
  }
}

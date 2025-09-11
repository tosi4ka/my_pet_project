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

  async getById(id: string): Promise<User | null> {
    return this.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.client.user.findUnique({
      where: { email },
    });
  }

  /**
   * @param userId
   * @param refreshTokenHash
   */
  async setCurrentRefreshToken(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<User> {
    return this.prismaService.client.user.update({
      where: { id: userId },
      data: { refreshToken: refreshTokenHash },
    });
  }
}

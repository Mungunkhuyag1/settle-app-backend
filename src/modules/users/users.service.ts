import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { In, Repository } from 'typeorm';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { User } from './entities/user.entity';
import { FilterDto, SortOrder } from 'src/common/dto/filter.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(dto: SignUpDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException(
        'Энэ имэйлтэй хэрэглэгч аль хэдийн бүртгэлтэй байна',
      );
    }

    const passwordHash = await hash(dto.password, 10);

    const user = this.usersRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      imageUrl: null,
      lastSeenAt: new Date(),
    });

    return this.usersRepository.save(user);
  }

  async getById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.getByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Имэйл эсвэл нууц үг буруу байна');
    }

    const isPasswordValid = await compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Имэйл эсвэл нууц үг буруу байна');
    }

    user.lastSeenAt = new Date();

    return this.usersRepository.save(user);
  }

  async findManyByIds(userIds: string[]): Promise<User[]> {
    if (!userIds.length) {
      return [];
    }

    return this.usersRepository.find({
      where: {
        id: In(userIds),
      },
    });
  }

  async updateMyProfile(
    userId: string,
    dto: UpdateMyProfileDto,
  ): Promise<User> {
    const user = await this.getById(userId);

    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName;
    }

    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName;
    }

    if (dto.imageUrl !== undefined) {
      user.imageUrl = dto.imageUrl;
    }

    user.lastSeenAt = new Date();

    return this.usersRepository.save(user);
  }

  async listUsers(filter: FilterDto): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = filter;

    const skip = (page - 1) * limit;

    const query = this.usersRepository.createQueryBuilder('user');

    if (search) {
      query.where(
        'user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      const order: 'ASC' | 'DESC' =
        sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';
      query.orderBy(`user.${sortBy}`, order);
    } else {
      query.orderBy('user.createdAt', 'DESC');
    }

    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  static fromEntity(user: User): UserListItemDto {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

    return {
      id: user.id,
      name: name || user.email,
      email: user.email,
    };
  }
}

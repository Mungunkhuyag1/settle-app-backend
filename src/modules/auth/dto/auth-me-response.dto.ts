import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthMeResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

import { ApiProperty } from '@nestjs/swagger';

export class GetAllUsersDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({
  })
  joinedAt: string;
}

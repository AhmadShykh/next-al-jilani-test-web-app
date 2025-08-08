import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    nam!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty()
    phoneNumber!: string;

    @ApiProperty({ enum: ['PENDING', 'ACTIVE'] })
    status: string = 'PENDING';

    @ApiProperty()
    createdAt!: Date ;

}

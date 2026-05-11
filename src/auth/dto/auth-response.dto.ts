import { ApiProperty } from '@nestjs/swagger';

export class LoginUrlDto {
  @ApiProperty({ example: 'https://auth.rezel.net/...' })
  url: string;
}

export class TokenDto {
  @ApiProperty()
  access_token: string;
}

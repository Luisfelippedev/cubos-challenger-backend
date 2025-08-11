import { ApiProperty } from '@nestjs/swagger';

export class UploadCoverResponseDto {
  @ApiProperty({ example: 'users/123/covers/1712345678-abcd12-cover.jpg' })
  key: string;

  @ApiProperty({
    example:
      'https://bucket.s3.sa-east-1.amazonaws.com/users/123/covers/1712345678-abcd12-cover.jpg',
  })
  url: string;
}

import { BadRequestException, ParseUUIDPipe } from '@nestjs/common';

export class ParseUUIDCustomPipe extends ParseUUIDPipe {
  constructor(message: string) {
    super({
      version: '7',
      exceptionFactory: () => {
        throw new BadRequestException({
          success: false,
          message,
        });
      },
    });
  }
}

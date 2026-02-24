import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';
import { JwtAuthGuard } from '@app/common/auth/guards';
import { GetUser } from '@app/common/auth/decorators';
import { AuthUser } from '@app/common/types';
import { CreateReservationDto } from '../dtos/create-reservation.dto';

@Controller({
  path: 'reservations',
  version: '1',
})
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('availability')
  async checkAvailability(
    @Query('roomId') roomId: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
  ) {
    if (!roomId || !checkIn || !checkOut) {
      throw new BadRequestException(
        'roomId, checkIn and checkOut are required',
      );
    }
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new BadRequestException('Invalid checkIn or checkOut date');
    }
    if (checkOutDate <= checkInDate) {
      throw new BadRequestException('checkOut must be after checkIn');
    }
    const result = await this.reservationsService.checkAvailability(
      roomId,
      checkInDate,
      checkOutDate,
    );
    if (!result.isSuccess) {
      throw new NotFoundException(result.error);
    }
    return result.value;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @Post()
  async create(@GetUser() user: AuthUser, @Body() dto: CreateReservationDto) {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);
    const result = await this.reservationsService.create(
      user.id,
      dto.roomId,
      checkIn,
      checkOut,
    );
    if (!result.isSuccess) {
      if (result.code === 'RESOURCE_NOT_FOUND') {
        throw new NotFoundException(result.error);
      }
      if (result.code === 'CONFLICT_ERROR') {
        throw new ConflictException(result.error);
      }
      throw new BadRequestException(result.error);
    }
    return result.value;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@GetUser() user: AuthUser) {
    return this.reservationsService.listByGuest(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @GetUser() user: AuthUser) {
    const result = await this.reservationsService.getById(id, user.id);
    if (!result.isSuccess) {
      throw new NotFoundException(result.error);
    }
    return result.value;
  }
}

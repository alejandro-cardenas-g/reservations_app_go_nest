import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
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
import { GetReservationsDto } from '../dtos/get-reservations.dto';
import { DateConverter } from '../utils/dateConverter.util';

@Controller({
  path: 'reservations',
  version: '1',
})
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('availability')
  async checkAvailability(@Query() dto: CreateReservationDto) {
    const { roomId, checkIn, checkOut } = dto;
    const checkInDate = DateConverter.FromISO8601(checkIn);
    const checkOutDate = DateConverter.FromISO8601(checkOut);
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
    const checkIn = DateConverter.FromISO8601(dto.checkIn);
    const checkOut = DateConverter.FromISO8601(dto.checkOut);
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
      throw new InternalServerErrorException(result.error);
    }
    return result.value;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@GetUser() user: AuthUser, @Query() dto: GetReservationsDto) {
    return this.reservationsService.listByGuest(user.id, dto);
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

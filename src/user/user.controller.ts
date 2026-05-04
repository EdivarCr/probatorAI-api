import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdatedUserDto } from './dto/user.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    console.log('--- REQUISIÇÃO RECEBIDA ---', createUserDto);
    return this.userService.createUser(createUserDto);
  }

  @Get('all')
  async getAllUser() {
    return this.userService.findAllUsers();
  }

  @Put('id')
  async updateUser(
    @Param('id') id: string,
    @Body() updatedUserDto: UpdatedUserDto,
  ) {
    return this.userService.updateUser(id, updatedUserDto);
  }

  @Get(':id')
  async getUserId(@Param('id') id: string) {
    return this.userService.findUser(id);
  }

  @Delete('id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}

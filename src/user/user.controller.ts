import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdatedUserDto } from './dto/user.dto';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorators';
import { JwtPayload } from 'jsonwebtoken';
import { Role } from 'src/auth/role.enum';

type AuthenticatedRequest = Request & { user: JwtPayload };
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    console.log('--- REQUISIÇÃO RECEBIDA ---', createUserDto);
    return this.userService.createUser(createUserDto);
  }

  @Roles(Role.Admin)
  @Get('all')
  async getAllUser() {
    return this.userService.findAllUsers();
  }

  @Roles(Role.Admin)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updatedUserDto: UpdatedUserDto,
  ) {
    return this.userService.updateUser(id, updatedUserDto);
  }

  @Roles(Role.Professor)
  @Put('me')
  async updateMe(
    @Request() req: AuthenticatedRequest,
    @Body() updatedUserDto: UpdatedUserDto,
  ) {
    return this.userService.updateUser(req.user.sub!, updatedUserDto);
  }

  @Roles(Role.Professor)
  @Delete('me')
  async deleteMe(@Request() req: AuthenticatedRequest) {
    return this.userService.deleteUser(req.user.sub!);
  }

  @Roles(Role.Professor)
  @Get('me')
  meProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  @Roles(Role.Admin)
  @Get(':id')
  async getUserId(@Param('id') id: string) {
    return this.userService.findUser(id);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}

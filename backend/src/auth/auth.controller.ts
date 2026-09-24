import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from '../common/auth/public.decorator';
import { AuthService, SessaoToken } from './auth.service';
import { DefinirSenhaDto } from './dto/definir-senha.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto): Promise<SessaoToken> {
    return this.authService.autenticar(dto.email, dto.senha);
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('definir-senha')
  definirSenha(@Body() dto: DefinirSenhaDto): Promise<void> {
    return this.authService.definirSenha(dto.token, dto.novaSenha);
  }
}

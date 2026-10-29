import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsNotEmpty({ message: 'O idToken do Google é obrigatório.' })
  @IsString()
  idToken: string;
}

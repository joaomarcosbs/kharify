import { Body, Controller, Get, Patch } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { UpdateProfileDto } from '../../application/dto/update-profile.dto';
import { CurrentUser } from '../../../../core/decorators/current-user.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  get(@CurrentUser() user: { userId: string }) {
    return this.authService.getProfile(user.userId);
  }

  @Patch()
  update(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.userId, dto);
  }
}

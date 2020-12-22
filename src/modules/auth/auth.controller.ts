import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from '../../decorators/auth-user.decorator';

@Controller('auth')
export class AuthController {
    
    @Get('me')
    @HttpCode(HttpStatus.OK)    
    @UseGuards(AuthGuard('firebase'))    
    async userFirebase(                
        @AuthUser() user
    ) {
        return user
    }
}

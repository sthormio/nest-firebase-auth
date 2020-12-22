import { FirebaseAdminCoreModule } from '@tfarras/nestjs-firebase-admin';
import { Module } from '@nestjs/common';
import { ConfigService } from './shared/services/config.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as admin from 'firebase-admin';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './shared/shared.module';
 
@Module({
  imports: [
    SharedModule,
    FirebaseAdminCoreModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
          credential: admin.credential.cert({
              clientEmail: configService.get('CLIENT_EMAIL'),
              privateKey: configService.get('PRIVATE_FIREBASE_KEY'),              
              projectId: configService.get('PROJECT_ADMIN_ID'),
          }),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
 
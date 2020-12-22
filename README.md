# NestJs: Firebase Auth

## Introduction

Nest (NestJS) is a framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript, is built with and fully supports TypeScript (yet still enables developers to code in pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).

## Nest Project Start
To get started, you can either scaffold the project with the Nest CLI, 
```shell
# Using CLI
npm i -g @nestjs/cli
nest new project-name
```
or clone a starter project (both will produce the same outcome).

```shell
# Cloning
git clone https://github.com/nestjs/typescript-starter.git project
cd project
npm install
npm run start
```
## Project Dependencies

To proceed in this tutorial you going to need an existing Firebase App, If you don’t know how to create one I suggest you to follow this [link](https://medium.com/sharma.vikashkr/firebase-how-to-setup-an-app-in-firebase-9ddbacfe8ad1 "link").

So, now that the project and Firebase app were created, you’re going to install the project peer dependencies.

```shell
npm install passport passport-jwt
npm install --save-dev @types/passport-jwt
npm install @nestjs/passport
```
To help with the Firebase settings, I prefer to use Tfarras libs.

```shell
npm install @tfarras/nestjs-firebase-auth
npm install @tfarras/nestjs-firebase-admin
```
## Firebase Auth
Next, you're going to create the auth module and it's controller.
```shell
nest g module modules/auth
nest g controller modules/auth
```
Firebase auth use JSON Web Token(JWT), in order to establish it's authentication you need to create a strategy with a JWT provider, like the code below.
```javascript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FirebaseAuthStrategy } from '@tfarras/nestjs-firebase-auth';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(
    FirebaseAuthStrategy,
    'firebase',
) {
    public constructor() {
        super({
            extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }
}
```
If you want to know more about NestJs strategies you can read in this [link](https://docs.nestjs.com/security/authentication#implementing-passport-strategies "link").

Next step is to include the provider created in the AuthModule.
```javascript
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { FirebaseStrategy } from "./firebase.strategy";
import { AuthController } from './auth.controller';
 
@Module({
  imports: [PassportModule],
  providers: [FirebaseStrategy],
  exports: [FirebaseStrategy],
  controllers: [AuthController],
})
export class AuthModule { }
```
The last step is the most complicated part, It's the Firebase app set up in the AppModule.
```javascript
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
```
As you can see, I created a ConfigService to protect my keys in the firebase configuration, you'll be able to check how I manage to do this later in the github link of this project, and use FirebaseAdminCoreModule from Tfarras lib to simplify the implementation complexity.
In the AuthController you can create a protected endpoint using AuthGuard and the strategy you created to check your authentication.
```javascript
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
```
Now you can run your project and verify your Firebase authentication with a valid token created from an user of your firebase console app.
![alt test token](https://00f74ba44b7f6fba897447cb2688ac6d91c209964e-apidata.googleusercontent.com/download/storage/v1/b/viralcure-org/o/artbit%2FScreenshot%20from%202020-12-22%2018-04-33.png?jk=AFshE3W8zJaxLdaF0ddGbFsjlF2Fgt8_DlWr2OP9xLpOtBMPiQpPzjgA7iizdhtlG5fEZDgzY_EEIK7eBBG9u199OWDI30w7lA3UeyYrfGl4P9EzDmGf-1dBRK-VoiOLG-35QcPfEHJtpAxKnOx02i09piuqEoMW6Ev-_ZubPPhWnAkiK91GvlHkvIh7BM4Wj-8tGGsGWmDiAae8VQDkewMxBnarK-_lu_1Enqqgh-Rw1QFhQC3Xz0hziXd8yuaSG1ldAKGXWqHauBYiIcEnPLokTKpYuCXih8M-SmkPdbvwfUm1zNP5ysVNSgW-J8rQ3kMcn5QYhbNkfHF8AycsiBnOqcTu-8CyeKJ0rz14BzVg-ZewcK8Hcff8nHOiXAykPr-Ozx82yRhI7Ca5fWOJnlzgtDxE7rozMX5VTh082TDxDhEgJknW4XJk3DEb0xIPM6QH26rn4DJ3TqnqV7Fq7XmzouHMHtYxYZHJMffue73xmGr0n0oTzH_J6Gzo0tfHYyu_dknsFE4yRV-uRA6fYvLwJv-YR4Wqzr1MN62RefHvQtlCnkXh8oDNTT4K36R7SQk6hpvzndnnVbSSGzy_dkj2jdP2dA7vJMGl6PXm6YRdwAx_F4MvjSkxWX_0hB-T7yzP9TEJaa-b9P5IW5K58yyE_qr0rNXiI2zkG2nf2enN2NmV0ElxDa6YKvBWNYRn4doDulN7u_I10qBt4yRrYa_MqW5AWwAZvHlZzwj5jgWXb3yENsSL53HtcnuQ6wAFXd9KD8d5mFPQqD83kmg2zQsao7HBqG5Y9QQgc0f2SkEX6M629haXU42D2CzDmDdOrlv2-Nq5qH55Moci3EmqcVZH9Al0GT1x5YnGHVWUboanzQozM62Lub-RzaciWq37-pqMXwvD42LN3TvMFOrJ6pZW13LuBCpl2HZSOj4vHwmZ&isca=1)

## References
- NestJs Docs: https://docs.nestjs.com/
- Tfarras Lib: https://www.npmjs.com/package/@tfarras/nestjs-firebase-auth

Project Github link: https://github.com/sthormio/nest-firebase-auth/ 

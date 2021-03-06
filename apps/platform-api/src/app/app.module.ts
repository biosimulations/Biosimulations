import { Module, CacheModule } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

import { BiosimulationsConfigModule } from '@biosimulations/config/nest';
import { BiosimulationsAuthModule } from '@biosimulations/auth/nest';

import { MongooseModule } from '@nestjs/mongoose';
import { BioModelsModule } from './models/bioModels.module';
import { SharedExceptionsFiltersModule } from '@biosimulations/shared/exceptions/filters';

@Module({
  imports: [
    BiosimulationsConfigModule,
    BiosimulationsAuthModule,
    SharedExceptionsFiltersModule,
    MongooseModule.forRootAsync({
      imports: [BiosimulationsConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('database.uri') || '',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    CacheModule.register(),
    BioModelsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

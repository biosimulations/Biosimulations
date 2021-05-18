import { Module, HttpModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { HpcService } from './services/hpc/hpc.service';
import { SbatchService } from './services/sbatch/sbatch.service';
import { SshService } from './services/ssh/ssh.service';
import { BiosimulationsConfigModule } from '@biosimulations/config/nest';
import { ScheduleModule } from '@nestjs/schedule';
import { ArchiverService } from './results/archiver.service';

import { ResultsService } from './results/results.service';
import { SharedNatsClientModule } from '@biosimulations/shared/nats-client';
import { AuthClientModule } from '@biosimulations/auth/client';
import { DispatchNestClientModule } from '@biosimulations/dispatch/nest-client';
import { ImagesModule } from '../images/images.module';
import { FileService } from './results/file.service';
import { LogService } from './results/log.service';

import { SubmissionProccessor } from './submission/submission.proccessor';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ImagesModule,
    BiosimulationsConfigModule,
    AuthClientModule,
    SharedNatsClientModule,
    DispatchNestClientModule,
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [BiosimulationsConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('queue.host'),
          port: +configService.get('queue.port'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'dispatch',
    }),
    BullModule.registerQueue({
      name: 'monitor',
    }),
    BullModule.registerQueue({
      name: 'complete',
    }),
    BullModule.registerQueue({
      name: 'failure',
    }),
  ],
  controllers: [],
  providers: [
    HpcService,
    SbatchService,
    SshService,
    ArchiverService,
    ResultsService,
    FileService,
    LogService,
    SubmissionProccessor,
  ],
})
export class AppModule {}

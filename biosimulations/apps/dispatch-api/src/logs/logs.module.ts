import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SimulationRunModel,
  SimulationRunModelSchema
} from '../simulation-run/simulation-run.model';
import { LogsController } from './logs.controller';
import { SimulationRunLog } from './logs.model';

import { LogsService } from './logs.service';

@Module({
  controllers: [LogsController],
  imports: [
    MongooseModule.forFeature([
      { name: SimulationRunLog.name, schema: SimulationRunModelSchema },
      { name: SimulationRunModel.name, schema: SimulationRunModelSchema }
    ])
  ],

  providers: [LogsService]
})
export class LogsModule {}

import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { SimulationIdMapController } from './controller/simulation-id-map.controller';
import { SimulationIdMapService } from './service/simulation-id-map.service';
import {
  SimulationIdMap,
  SimulationIdMapSchema,
} from './schemas/simulation-id-map.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SimulationIdMap.name, schema: SimulationIdMapSchema },
    ]),
  ],
  controllers: [SimulationIdMapController],
  providers: [SimulationIdMapService],
  exports: [MongooseModule, SimulationIdMapService],
})
export class SimulationIdMapModule {}

import {
  DispatchMessage,
  DispatchPayload,
} from '@biosimulations/messages/messages';
import { Controller, Logger } from '@nestjs/common';

import { MessagePattern } from '@nestjs/microservices';
import { ResultsService } from './results.service';

@Controller()
export class ResultsController {
  constructor(private service: ResultsService) {}

  private logger = new Logger(ResultsController.name);

  /**
   * 
   *  @bilal Don't activate this message pattern unless finished
   *    it'll mess with the existing JSON parsing and archiving functionality if 
   *    this is activated
   */
  // @MessagePattern(DispatchMessage.finsihed)
  async processResults(data: DispatchPayload) {
    const id = data.id;
    this.logger.log(`Simulation ${id} Finished`);
    this.service.createResults(id);
  }
}

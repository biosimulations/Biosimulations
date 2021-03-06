import { Test, TestingModule } from '@nestjs/testing';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { of } from 'rxjs';
describe('LogsController', () => {
  let controller: LogsController;
  let mockService: any;
  beforeEach(async () => {
    mockService = {
      getLog(id: string) {
        return '';
      },
      createLog(id: string, data: any) {
        return { simId: id, log: data };
      },
      getOldLogs(id: string) {
        return of({
          output: 'oldOut',
          error: 'oldErr',
        }).toPromise();
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [{ provide: LogsService, useValue: mockService }],
    }).compile();

    controller = module.get<LogsController>(LogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it(' should get logs from service', async () => {
    const getSpy = jest.spyOn(mockService, 'getLog').mockReturnValue('test');

    const log = await controller.getLogs('testId');
    expect(getSpy).toHaveBeenCalled();
    //@ts-ignore
    expect(log).toBe('test');
  });
});

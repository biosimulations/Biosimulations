import { Controller, Logger, Inject,  } from '@nestjs/common';
import {
  MessagePattern,
  ClientProxy,
  ,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { HpcService } from './services/hpc/hpc.service';
import { SbatchService } from './services/sbatch/sbatch.service';


import path from 'path';
import * as csv2Json from 'csv2json';
import { SchedulerRegistry } from '@nestjs/schedule';

import {

  MQDispatch,
} from '@biosimulations/messages/messages';
import { ArchiverService } from './services/archiver/archiver.service';
import { ModelsService } from './resources/models/models.service';

import { FileModifiers } from '@biosimulations/dispatch/file-modifiers';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private hpcService: HpcService,
    private sbatchService: SbatchService,
    @Inject('DISPATCH_MQ') private messageClient: ClientProxy,
    private schedulerRegistry: SchedulerRegistry,
    private archiverService: ArchiverService,
    private modelsService: ModelsService,

    private appService: AppService
  ) {}
  private logger = new Logger(AppController.name);
  private fileStorage: string = this.configService.get<string>(
    'hpc.fileStorage',
    ''
  );

  @MessagePattern(MQDispatch.SIM_HPC_FINISH)
  async dispatchFinish(uuid: string) {
    this.logger.log('Simulation Finished on HPC');
    const resDir = path.join(this.fileStorage, 'simulations', uuid, 'out');
    const allFilesInfo = await FileModifiers.getFilesRecursive(resDir);
    const allFiles = [];
    const directoryList = [];

    for (let index = 0; index < allFilesInfo.length; index++) {
      if (
        allFilesInfo[index].name === 'job.output' ||
        allFilesInfo[index].name === 'job.error'
      ) {

      } else if (allFilesInfo[index].name.endsWith('.csv')) {
        // Getting only relative path
        allFiles.push(allFilesInfo[index].path.substring(resDir.length + 1));
      }
    }

    // Seperating files from directory paths to create structure
    for (const filePath of allFiles) {
      const filePathSplit = filePath.split('/');

      //Removing task files
      filePathSplit.splice(filePathSplit.length - 1, 1);
      directoryList.push(filePathSplit.join('/'));
    }


    this.logger.log('Output directory: ' + resDir);

    // const directoryList = await FileModifiers.readDir(resDir);

    // NOTE: job.output is the Log file generated by the SBATCH simulation job
    const dirLength = directoryList.length;
    let dirCounter = 0;
    for (const directoryName of directoryList) {
      FileModifiers.readDir(path.join(resDir, directoryName)).then(
        (fileList: any) => {
          const fileLength = fileList.length;
          let fileCounter = 0;
          for (const filename of fileList) {
            if (filename.endsWith('csv')) {
              const filePath = path.join(resDir, directoryName, filename);
              this.logger.log('Reading file: ' + filePath);

              const jsonPath = filePath.split('.csv')[0] + '.json';

              fs.createReadStream(filePath)
                .pipe(
                  csv2Json.default({
                    separator: ',',
                  })
                )
                .pipe(fs.createWriteStream(jsonPath))
                .on('close', () => {
                  // Convert CSV to chart JSON
                  const chartJsonPath =
                    jsonPath.split('.json')[0] + '_chart.json';
                  FileModifiers.readFile(jsonPath).then((jsonData: any) => {
                    const chartResults = this.convertJsonDataToChartData(
                      JSON.parse(jsonData)
                    );
                    FileModifiers.writeFile(
                      chartJsonPath,
                      JSON.stringify(chartResults)
                    ).then(() => {
                      fileCounter++;
                      dirCounter++;
                      if (
                        fileCounter === fileLength &&
                        dirCounter === dirLength
                      ) {
                        this.messageClient.emit(
                          MQDispatch.SIM_RESULT_FINISH,
                          uuid
                        );
                      }
                    });
                  });
                })
                .on('error', (err) => {
                   this.logger.log(
                    'Error occured in file writing' + JSON.stringify(err)
                   );
                  return
                });
            }
          }
        }
      );
    }
  }

  @MessagePattern(MQDispatch.SIM_RESULT_FINISH)
  async resultFinish(uuid: string) {
    this.archiverService.createResultArchive(uuid).then(() => {});
  }

  convertJsonDataToChartData(data: any) {
    const finalRes: any = {};

    const taskKeys = Object.keys(data[0]);
    const timeKey = taskKeys[0];
    taskKeys.splice(taskKeys.indexOf(timeKey), 1);

    for (const taskKey of taskKeys) {
      finalRes[taskKey] = {};
      finalRes[taskKey]['x'] = [];
      finalRes[taskKey]['y'] = [];
      finalRes[taskKey]['type'] = 'scatter';
    }

    for (const dataObj of data) {
      for (const taskKey of taskKeys) {
        finalRes[taskKey]['x'].push(dataObj[timeKey]);
        finalRes[taskKey]['y'].push(dataObj[taskKey]);
      }
    }

    return finalRes;
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { DispatchService, SimulatorVersionsMap } from '../../../services/dispatch/dispatch.service';
import { SimulationService } from '../../../services/simulation/simulation.service';
import { environment } from '@biosimulations/shared/environments';
import { SimulationRunStatus, Simulation } from '../../../datamodel';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '@biosimulations/shared/services';

@Component({
  selector: 'biosimulations-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss'],
})
export class DispatchComponent implements OnInit {
  formGroup: FormGroup;
  simulators: string[] = [];
  simulatorVersions: string[] = [];

  simulatorVersionsMap: SimulatorVersionsMap | undefined = undefined;

  simulationId: string | undefined = undefined;

  exampleCombineArchiveUrl: string;
  exampleCombineArchivesUrl: string;

  constructor(
    private config: ConfigService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dispatchService: DispatchService,
    private simulationService: SimulationService
  ) {
    this.formGroup = formBuilder.group({
      projectFile: ['', [Validators.required]],
      simulator: ['', [Validators.required]],
      simulatorVersion: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.email]],
    });

    this.exampleCombineArchivesUrl = (
      'https://github.com/'
      + config.appConfig.exampleCombineArchives.repoOwnerName
      + '/tree'
      + '/' + config.appConfig.exampleCombineArchives.repoRef
      + '/' + config.appConfig.exampleCombineArchives.repoPath
    );
    this.exampleCombineArchiveUrl = (
      'https://github.com/'
      + config.appConfig.exampleCombineArchives.repoOwnerName
      + '/raw'
      + '/' + config.appConfig.exampleCombineArchives.repoRef
      + '/' + config.appConfig.exampleCombineArchives.repoPath
      + config.appConfig.exampleCombineArchives.examplePath
    );
  }

  ngOnInit(): void {
    this.formGroup.controls.simulator.disable();
    this.formGroup.controls.simulatorVersion.disable();

    combineLatest([this.dispatchService.getSimulatorsFromDb(), this.route.queryParams])
      .subscribe((observerableValues: [SimulatorVersionsMap, Params]): void => {
        const simulatorVersionsMap = observerableValues[0];
        const params = observerableValues[1];

        // this.simulatorVersionsMap = simulatorVersionsMap;
        // Note: Hardcoded available simulators, to make it dynamic uncomment above two lines and delete the hard-coded ones
        // TODO: Un-hardcode simulators
        this.simulatorVersionsMap = {
          amici: ['0.11.11'],
          bionetgen: ['2.5.2'],
          cbmpy: ['0.7.25'],
          cobrapy: ['0.20.0'],
          copasi: ['4.30.233', '4.29.227', '4.28.226'],
          gillespy2: ['1.5.7'],
          pysces: ['0.9.9'],
          tellurium: ['2.2.0'],
          vcell: ['7.3.0.07', '7.3.0.06', '7.3.0.0'],
        };
        this.simulators = Object.keys(this.simulatorVersionsMap);

        this.simulators.sort((a: string, b: string): number => {
          return a.localeCompare(b, undefined, { numeric: true });
        });

        this.formGroup.controls.simulator.enable();

        // process query arguments
        const simulator: string = params?.simulator?.toLowerCase();
        const simulatorVersion: string = params?.simulatorVersion;
        if (simulator) {
          this.formGroup.controls.simulator.setValue(simulator);
          this.onSimulatorChange({ value: simulator });
          if (simulatorVersion) {
            this.formGroup.controls.simulatorVersion.setValue(simulatorVersion);
          }
        }
      }
      );
  }

  onFormSubmit() {
    this.simulationId = undefined;

    if (!this.formGroup.valid) {
      return;
    }

    const projectFile: File = this.formGroup.value.projectFile;
    const simulator: string = this.formGroup.value.simulator;
    const simulatorVersion: string = this.formGroup.value.simulatorVersion;
    const name: string = this.formGroup.value.name;
    const email: string = this.formGroup.value.email;

    this.dispatchService
      .submitJob(projectFile, simulator, simulatorVersion, name, email)
      .subscribe((data: any) => {
        const simulationId = data['id'];
        this.dispatchService.uuidsDispatched.push(simulationId);
        this.dispatchService.uuidUpdateEvent.next(simulationId);
        this.simulationId = simulationId;

        const simulation: Simulation = {
          id: simulationId,
          name: name,
          email: email,
          simulator: simulator,
          simulatorVersion: simulatorVersion,
          submittedLocally: true,
          status: SimulationRunStatus.QUEUED,
          runtime: undefined,
          submitted: new Date(),
          updated: new Date(),
        };
        this.simulationService.storeNewLocalSimulation(simulation);
      });
  }

  onSimulatorChange($event: any) {
    if (this.simulatorVersionsMap !== undefined) {
      this.simulatorVersions = this.simulatorVersionsMap[$event.value];
      this.formGroup.controls.simulatorVersion.enable();
      this.formGroup.controls.simulatorVersion.setValue(
        this.simulatorVersions[0]
      );
    }
  }
}

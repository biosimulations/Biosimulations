import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import {
  DispatchService,
  SimulatorSpecsMap,
  SimulatorsData,
  OntologyTermsMap,
  OntologyTerm,
} from '../../../services/dispatch/dispatch.service';
import { SimulationService } from '../../../services/simulation/simulation.service';
import { CombineService } from '../../../services/combine/combine.service';
import { Simulation } from '../../../datamodel';
import {
  CombineArchive,
  CombineArchiveContent,
  SedDocument,
  SedModel,
  SedSimulation,
} from '../../../combine-sedml.interface';
import {
  AlgorithmSubstitutionPolicyLevels,
  ALGORITHM_SUBSTITUTION_POLICIES,
  AlgorithmSubstitution,
  AlgorithmSubstitutionPolicy,
  Algorithm as KisaoAlgorithm,
} from '../../../kisao.interface';
import { SimulationRunStatus } from '@biosimulations/datamodel/common';
import { Observable, Subscription } from 'rxjs';
import { map, concatAll, withLatestFrom } from 'rxjs/operators';
import { ConfigService } from '@biosimulations/shared/services';
import { SimulationRun } from '@biosimulations/dispatch/api-models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

interface SimulatorIdDisabled {
  id: string;
  disabled: boolean;
}

enum SubmitMethod {
  file = 'file',
  url = 'url',
}

interface Simulator {
  id: string;
  name: string;
}

interface SimulatorPolicy {
  maxPolicy: AlgorithmSubstitutionPolicy;
  simulator: Simulator;
}

interface Algorithm {
  id: string;
  name: string;
  simulatorPolicies: SimulatorPolicy[];
  disabled: boolean;
}

type AlgorithmsMap = { [id: string]: Algorithm };

@Component({
  selector: 'biosimulations-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss'],
})
export class DispatchComponent implements OnInit, OnDestroy {
  private submitMethod: SubmitMethod = SubmitMethod.file;
  formGroup: FormGroup;
  private submitMethodControl: FormControl;
  projectFileControl: FormControl;
  projectUrlControl: FormControl;
  modelFormatsControl: FormControl;
  simulationAlgorithmsControl: FormControl;
  private simulatorControl: FormControl;
  private simulatorVersionControl: FormControl;
  private cpusControl: FormControl;
  private memoryControl: FormControl; // in GB
  private maxTimeControl: FormControl; // in min
  private nameControl: FormControl;
  private emailControl: FormControl;
  private emailConsentControl: FormControl;

  exampleCombineArchiveUrl: string;
  exampleCombineArchivesUrl: string;

  private modelFormatsMap?: OntologyTermsMap;
  private simulationAlgorithmsMap?: AlgorithmsMap;

  modelFormats?: OntologyTerm[];
  simulationAlgorithms?: Algorithm[];
  ALGORITHM_SUBSTITUTION_POLICIES = ALGORITHM_SUBSTITUTION_POLICIES.filter(
    (policy: AlgorithmSubstitutionPolicy): boolean => {
      return (
        policy.level >= AlgorithmSubstitutionPolicyLevels.SAME_METHOD &&
        policy.level <= AlgorithmSubstitutionPolicyLevels.SAME_FRAMEWORK
      );
    },
  );

  private simulatorIds = new Set<string>();
  simulators: SimulatorIdDisabled[] = [];
  simulatorVersions: string[] = [];
  private simulatorSpecsMap: SimulatorSpecsMap | undefined = undefined;

  emailUrl!: string;

  submitPushed = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private config: ConfigService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dispatchService: DispatchService,
    private simulationService: SimulationService,
    private combineService: CombineService,
    private snackBar: MatSnackBar,
  ) {
    this.formGroup = this.formBuilder.group(
      {
        submitMethod: [SubmitMethod.file],
        projectFile: ['', [Validators.required, this.maxFileSizeValidator]],
        projectUrl: ['', [Validators.required]],
        modelFormats: [[]],
        simulationAlgorithms: [[]],
        simulationAlgorithmSubstitutionPolicy: [
          AlgorithmSubstitutionPolicyLevels.SAME_FRAMEWORK,
          [Validators.required],
        ],
        simulator: ['', [Validators.required]],
        simulatorVersion: ['', [Validators.required]],
        cpus: [
          1,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(24),
            this.integerValidator,
          ],
        ],
        memory: [
          8,
          [Validators.required, Validators.min(0), Validators.max(192)],
        ], // in GB
        maxTime: [
          20,
          [
            Validators.required,
            Validators.min(0),
            Validators.max(20 * 24 * 60),
          ],
        ], // in min
        name: ['', [Validators.required]],
        email: ['', [Validators.email]],
        emailConsent: [false],
      },
      {
        validators: this.formValidator,
      },
    );

    this.submitMethodControl = this.formGroup.controls
      .submitMethod as FormControl;
    this.projectFileControl = this.formGroup.controls
      .projectFile as FormControl;
    this.projectUrlControl = this.formGroup.controls.projectUrl as FormControl;
    this.modelFormatsControl = this.formGroup.controls
      .modelFormats as FormControl;
    this.simulationAlgorithmsControl = this.formGroup.controls
      .simulationAlgorithms as FormControl;
    this.simulatorControl = this.formGroup.controls.simulator as FormControl;
    this.simulatorVersionControl = this.formGroup.controls
      .simulatorVersion as FormControl;
    this.cpusControl = this.formGroup.controls.cpus as FormControl;
    this.memoryControl = this.formGroup.controls.memory as FormControl;
    this.maxTimeControl = this.formGroup.controls.maxTime as FormControl;
    this.nameControl = this.formGroup.controls.name as FormControl;
    this.emailControl = this.formGroup.controls.email as FormControl;
    this.emailConsentControl = this.formGroup.controls
      .emailConsent as FormControl;

    this.projectUrlControl.disable();
    this.modelFormatsControl.disable();
    this.simulationAlgorithmsControl.disable();
    this.simulatorControl.disable();
    this.simulatorVersionControl.disable();

    this.exampleCombineArchivesUrl =
      'https://github.com/' +
      this.config.appConfig.exampleCombineArchives.repoOwnerName +
      '/tree' +
      '/' +
      this.config.appConfig.exampleCombineArchives.repoRef +
      '/' +
      config.appConfig.exampleCombineArchives.repoPath;
    this.exampleCombineArchiveUrl =
      'https://github.com/' +
      this.config.appConfig.exampleCombineArchives.repoOwnerName +
      '/raw' +
      '/' +
      this.config.appConfig.exampleCombineArchives.repoRef +
      '/' +
      this.config.appConfig.exampleCombineArchives.repoPath +
      this.config.appConfig.exampleCombineArchives.examplePath;
    this.emailUrl = 'mailto:' + config.email;
  }

  maxFileSizeValidator(control: FormControl): ValidationErrors | null {
    if (control.value && control.value.size > 16000000) {
      return {
        maxSize: true,
      };
    } else {
      return null;
    }
  }

  integerValidator(formControl: FormControl): ValidationErrors | null {
    const value = formControl.value as number;

    if (value == Math.floor(value)) {
      return null;
    } else {
      return { integer: true };
    }
  }

  formValidator(formGroup: FormGroup): ValidationErrors | null {
    const errors: ValidationErrors = {};

    if (formGroup.value.submitMethod == SubmitMethod.file) {
      if (!formGroup.value.projectFile) {
        errors['noProjectFile'] = true;
      }
    } else {
      if (!formGroup.value.projectUrl) {
        errors['noProjectUrl'] = true;
      }
    }

    const email = formGroup.controls.email as FormControl;
    const emailConsent = formGroup.controls.emailConsent as FormControl;

    if (email.value && !email.hasError('email') && !emailConsent.value) {
      errors['emailNotConsented'] = true;
    }

    if (Object.keys(errors).length) {
      return errors;
    } else {
      return null;
    }
  }

  ngOnInit(): void {
    const simulatorsDataObs = this.dispatchService.getSimulatorsFromDb();

    const algSubObs = simulatorsDataObs.pipe(
      map(
        (
          simulatorsData: SimulatorsData,
        ): Observable<AlgorithmSubstitution[] | undefined> => {
          return this.combineService.getSimilarAlgorithms(
            Object.keys(simulatorsData.simulationAlgorithms),
          );
        },
      ),
      concatAll(),
      withLatestFrom(simulatorsDataObs, this.route.queryParams),
    );

    const sub = algSubObs.subscribe(
      (
        observerableValues: [
          AlgorithmSubstitution[] | undefined,
          SimulatorsData,
          Params,
        ],
      ): void => {
        const algSubs = observerableValues[0] as
          | AlgorithmSubstitution[]
          | undefined;
        const simulatorsData = observerableValues[1] as SimulatorsData;
        const params = observerableValues[2] as Params;

        // Setup options for select menus
        this.modelFormatsMap = simulatorsData.modelFormats;

        this.simulatorSpecsMap = simulatorsData.simulatorSpecs;

        this.modelFormats = Object.values(this.modelFormatsMap);

        const simulationAlgorithmsMap: any = {};
        if (algSubs) {
          algSubs
            .filter((algorithmSubstitution: AlgorithmSubstitution): boolean => {
              return (
                algorithmSubstitution.maxPolicy.level <=
                AlgorithmSubstitutionPolicyLevels.SAME_FRAMEWORK
              );
            })
            .forEach((algorithmSubstitution: AlgorithmSubstitution): void => {
              algorithmSubstitution.algorithms.forEach(
                (algorithm: KisaoAlgorithm): void => {
                  if (!(algorithm.id in simulationAlgorithmsMap)) {
                    simulationAlgorithmsMap[algorithm.id] = {
                      id: algorithm.id,
                      name: algorithm.name,
                      simulatorPolicies: {},
                      disabled: false,
                    };
                  }
                },
              );

              const mainAlg = algorithmSubstitution.algorithms[0];
              const altAlg = algorithmSubstitution.algorithms[1];
              const subPolicy = algorithmSubstitution.maxPolicy;

              Array.from(
                simulatorsData.simulationAlgorithms[mainAlg.id].simulators,
              ).forEach((simulator: string): void => {
                // main implementation
                simulationAlgorithmsMap[mainAlg.id].simulatorPolicies[
                  simulator
                ] = {
                  maxPolicy: {
                    id: 'SAME_METHOD',
                    name: 'Same method',
                    level: AlgorithmSubstitutionPolicyLevels.SAME_METHOD,
                  },
                  simulator: {
                    id: simulator,
                    name: simulatorsData.simulatorSpecs[simulator].name,
                  },
                };

                // alternatives
                if (
                  !(
                    simulator in
                    simulationAlgorithmsMap[altAlg.id].simulatorPolicies
                  )
                ) {
                  simulationAlgorithmsMap[altAlg.id].simulatorPolicies[
                    simulator
                  ] = {
                    maxPolicy: subPolicy,
                    simulator: {
                      id: simulator,
                      name: simulatorsData.simulatorSpecs[simulator].name,
                    },
                  };
                }

                if (
                  subPolicy.level <
                  simulationAlgorithmsMap[altAlg.id].simulatorPolicies[
                    simulator
                  ].maxPolicy.level
                ) {
                  simulationAlgorithmsMap[altAlg.id].simulatorPolicies[
                    simulator
                  ].maxPolicy = subPolicy;
                }
              });
            });

          Object.values(simulationAlgorithmsMap).forEach((alg: any): void => {
            alg.simulatorPolicies = Object.values(alg.simulatorPolicies);
          });
        } else {
          this.snackBar.open(
            'Sorry! We were unable to load information about the simularity among algorithms.',
            undefined,
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
            },
          );
        }

        this.simulationAlgorithmsMap = simulationAlgorithmsMap;
        this.simulationAlgorithms = Object.values(simulationAlgorithmsMap);

        this.modelFormats.sort((a: OntologyTerm, b: OntologyTerm): number => {
          return a.name.localeCompare(b.name, undefined, { numeric: true });
        });
        this.simulationAlgorithms.sort((a: Algorithm, b: Algorithm): number => {
          return a.name.localeCompare(b.name, undefined, { numeric: true });
        });

        this.simulatorIds = new Set(Object.keys(this.simulatorSpecsMap));
        this.simulators = Array.from(this.simulatorIds).map(
          (id: string): SimulatorIdDisabled => {
            return { id: id, disabled: false };
          },
        );

        this.simulators.sort(
          (a: SimulatorIdDisabled, b: SimulatorIdDisabled): number => {
            return a.id.localeCompare(b.id, undefined, { numeric: true });
          },
        );

        // Enable select menus
        this.modelFormatsControl.enable();
        this.simulationAlgorithmsControl.enable();
        this.simulatorControl.enable();

        // Initialize value of form according to query arguments
        const projectUrl = params?.projectUrl;
        if (projectUrl) {
          this.submitMethodControl.setValue(SubmitMethod.url);
          this.projectUrlControl.setValue(projectUrl);
          this.changeProject();
        }

        const simulator = params?.simulator?.toLowerCase();
        if (simulator) {
          for (const simulatorId of this.simulatorIds) {
            if (simulatorId.toLowerCase() === simulator) {
              this.simulatorControl.setValue(simulatorId);

              const simulatorVersion = params?.simulatorVersion;
              if (
                this.simulatorSpecsMap[simulatorId].versions.includes(
                  simulatorVersion,
                )
              ) {
                this.simulatorVersionControl.setValue(simulatorVersion);
              }

              break;
            }
          }
        }

        let cpus: any = params?.cpus;
        if (!isNaN(cpus)) {
          cpus = Math.ceil(parseFloat(cpus));
          if (cpus >= 1) {
            this.cpusControl.setValue(cpus);
          }
        }

        let memory: any = params?.memory;
        if (!isNaN(memory)) {
          memory = parseFloat(memory);
          if (memory > 0) {
            this.memoryControl.setValue(memory);
          }
        }

        let maxTime: any = params?.maxTime;
        if (!isNaN(maxTime)) {
          maxTime = parseFloat(maxTime);
          if (maxTime > 0) {
            this.maxTimeControl.setValue(maxTime);
          }
        }

        const name = params?.name;
        if (name) {
          this.nameControl.setValue(name);
        }
      },
    );
    this.subscriptions.push(sub);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  makeArray(value: string | string[] | null): string[] {
    if (!value) {
      return [];
    } else if (typeof value === 'string') {
      return [value];
    } else {
      return value;
    }
  }

  changeSubmitMethod(): void {
    const submitMethodControl = this.formGroup.controls
      .submitMethod as FormControl;
    if (submitMethodControl.value === SubmitMethod.file) {
      this.formGroup.controls.projectFile.enable();
      this.formGroup.controls.projectUrl.disable();
    } else {
      this.formGroup.controls.projectFile.disable();
      this.formGroup.controls.projectUrl.enable();
    }
  }

  changeProject(): void {
    const submitMethodControl = this.formGroup.controls
      .submitMethod as FormControl;

    let archive: File | string = '';
    if (submitMethodControl.value === SubmitMethod.file) {
      archive = this.formGroup.controls.projectFile.value;
    } else {
      archive = this.formGroup.controls.projectUrl.value;
    }

    if (archive) {
      const sub = this.combineService
        .getSpecsOfSedDocsInCombineArchive(archive)
        .subscribe((archive: CombineArchive | undefined): void => {
          if (archive) {
            const modelFormats = new Set<string>();
            const simulationAlgorithms = new Set<string>();
            const unsupportedModelFormats = new Set<string>();
            const unsupportedSimulationAlgorithms = new Set<string>();
            archive.contents.forEach((content: CombineArchiveContent): void => {
              if (content.location.value._type === 'SedDocument') {
                const sedDoc = content.location.value as SedDocument;

                sedDoc.models.forEach((model: SedModel): void => {
                  if (model.language.startsWith('urn:sedml:language:bngl')) {
                    modelFormats.add('format_3972');
                  } else if (
                    model.language.startsWith('urn:sedml:language:cellml')
                  ) {
                    modelFormats.add('format_3240');
                  } else if (
                    model.language.startsWith('urn:sedml:language:copasiml')
                  ) {
                    modelFormats.add('format_9003');
                  } else if (
                    model.language.startsWith('urn:sedml:language:ginml')
                  ) {
                    modelFormats.add('format_9009');
                  } else if (
                    model.language.startsWith('urn:sedml:language:hoc')
                  ) {
                    modelFormats.add('format_9005');
                  } else if (
                    model.language.startsWith('urn:sedml:language:lems')
                  ) {
                    modelFormats.add('format_9004');
                  } else if (
                    model.language.startsWith('urn:sedml:language:morpheusml')
                  ) {
                    modelFormats.add('format_9002');
                  } else if (
                    model.language.startsWith('urn:sedml:language:neuroml')
                  ) {
                    modelFormats.add('format_3971');
                  } else if (
                    model.language.startsWith('urn:sedml:language:sbml')
                  ) {
                    modelFormats.add('format_2585');
                  } else if (
                    model.language.startsWith('urn:sedml:language:smoldyn')
                  ) {
                    modelFormats.add('format_9001');
                  } else if (
                    model.language.startsWith('urn:sedml:language:vcml')
                  ) {
                    modelFormats.add('format_9000');
                  } else if (
                    model.language.startsWith('urn:sedml:language:zginml')
                  ) {
                    modelFormats.add('format_9008');
                  } else {
                    unsupportedModelFormats.add(model.language);
                  }
                });

                sedDoc.simulations.forEach((sim: SedSimulation): void => {
                  const kisaoId = sim.algorithm.kisaoId;
                  if (
                    kisaoId in (this.simulationAlgorithmsMap as AlgorithmsMap)
                  ) {
                    simulationAlgorithms.add(kisaoId);
                  } else {
                    unsupportedSimulationAlgorithms.add(kisaoId);
                  }
                });
              }
            });

            this.modelFormatsControl.setValue(Array.from(modelFormats));
            this.simulationAlgorithmsControl.setValue(
              Array.from(simulationAlgorithms),
            );

            if (unsupportedModelFormats.size > 0) {
              this.modelFormatsControl.setErrors({ unsupportedFormats: true });
              this.modelFormatsControl.markAsTouched();
            } else {
              this.modelFormatsControl.setErrors({ unsupportedFormats: null });
              this.modelFormatsControl.updateValueAndValidity();
            }
            if (unsupportedSimulationAlgorithms.size > 0) {
              this.simulationAlgorithmsControl.setErrors({
                unsupportedAlgorithms: true,
              });
              this.simulationAlgorithmsControl.markAsTouched();
            } else {
              this.simulationAlgorithmsControl.setErrors({
                unsupportedAlgorithms: null,
              });
              this.simulationAlgorithmsControl.updateValueAndValidity();
            }

            this.applyFilters();
          }
        });
      this.subscriptions.push(sub);
    } else {
      this.modelFormatsControl.setErrors({ unsupportedFormats: null });
      this.simulationAlgorithmsControl.setErrors({
        unsupportedAlgorithms: null,
      });
      this.modelFormatsControl.updateValueAndValidity();
      this.simulationAlgorithmsControl.updateValueAndValidity();
    }
  }

  applyFilters(): void {
    const modelFormatIds = this.formGroup.value.modelFormats;
    const simulationAlgorithmIds = this.formGroup.value.simulationAlgorithms;
    const algSubPolicy: number =
      this.formGroup.value.simulationAlgorithmSubstitutionPolicy;

    let simulators = this.simulatorIds;
    modelFormatIds.forEach((modelFormatId: string): void => {
      simulators = this.setIntersection(
        simulators,
        (this.modelFormatsMap?.[modelFormatId]?.simulators as Set<string>) ||
          new Set<string>(),
      );
    });
    simulationAlgorithmIds.forEach((simulationAlgorithmId: string): void => {
      const algSimulators = this.simulationAlgorithmsMap?.[
        simulationAlgorithmId
      ]?.simulatorPolicies
        ?.filter((simulatorPolicy: SimulatorPolicy): boolean => {
          return simulatorPolicy.maxPolicy.level <= algSubPolicy;
        })
        ?.map((simulatorPolicy: SimulatorPolicy): string => {
          return simulatorPolicy.simulator.id;
        });
      simulators = this.setIntersection(simulators, new Set(algSimulators));
    });

    this.modelFormats?.forEach((modelFormat: OntologyTerm): void => {
      modelFormat.disabled =
        this.setIntersection(simulators, modelFormat.simulators).size == 0;
    });
    this.simulationAlgorithms?.forEach(
      (simulationAlgorithm: Algorithm): void => {
        const algSimulators = simulationAlgorithm.simulatorPolicies
          ?.filter((simulatorPolicy: SimulatorPolicy): boolean => {
            return simulatorPolicy.maxPolicy.level <= algSubPolicy;
          })
          ?.map((simulatorPolicy: SimulatorPolicy): string => {
            return simulatorPolicy.simulator.id;
          });
        simulationAlgorithm.disabled =
          this.setIntersection(simulators, new Set(algSimulators)).size == 0;
      },
    );

    this.simulators.forEach((simulator: SimulatorIdDisabled): void => {
      simulator.disabled = !simulators.has(simulator.id);
    });

    if (simulators.size === 1) {
      const simulatorControl = this.formGroup.controls.simulator as FormControl;
      simulatorControl.setValue(Array.from(simulators)[0]);
    } else {
      const selectedSimulator = this.formGroup.value.simulator;
      if (selectedSimulator) {
        this.simulators.forEach((simulator: SimulatorIdDisabled): void => {
          if (simulator.id === selectedSimulator && simulator.disabled) {
            const simulatorControl = this.formGroup.controls
              .simulator as FormControl;
            simulatorControl.setValue(null);
          }
        });
      }
    }
  }

  private setIntersection(a: Set<string>, b: Set<string>): Set<string> {
    const _intersection = new Set<string>();
    for (const elem of b.values()) {
      if (a.has(elem)) {
        _intersection.add(elem);
      }
    }
    return _intersection;
  }

  onFormSubmit(): void {
    this.submitPushed = true;

    if (!this.formGroup.valid) {
      return;
    }

    const simulator: string = this.formGroup.value.simulator;
    const simulatorVersion: string = this.formGroup.value.simulatorVersion;
    const cpus: number = this.formGroup.value.cpus;
    const memory: number = this.formGroup.value.memory; // in GB
    const maxTime: number = this.formGroup.value.maxTime; // in min
    const name: string = this.formGroup.value.name;
    const email: string | null = this.formGroup.value.email || null;

    let simulationResponse: Observable<SimulationRun>;
    if (this.formGroup.value.submitMethod == SubmitMethod.file) {
      const projectFile: File = this.formGroup.value.projectFile;

      simulationResponse = this.dispatchService.submitJob(
        projectFile,
        simulator,
        simulatorVersion,
        cpus,
        memory,
        maxTime,
        name,
        email,
      );
    } else {
      const projectUrl: string = this.formGroup.value.projectUrl;
      simulationResponse = this.dispatchService.sumbitJobURL(
        projectUrl,
        simulator,
        simulatorVersion,
        cpus,
        memory,
        maxTime,
        name,
        email,
      );
    }
    const sub = simulationResponse.subscribe((data: SimulationRun) =>
      this.processSimulationResponse(
        data,
        name,
        simulator,
        simulatorVersion,
        cpus,
        memory,
        maxTime,
        email,
      ),
    );
    this.subscriptions.push(sub);
  }

  private processSimulationResponse(
    data: any,
    name: string,
    simulator: string,
    simulatorVersion: string,
    cpus: number,
    memory: number, // in GB
    maxTime: number, // min min
    email: string | null,
  ): void {
    const simulationId = data['id'];

    const simulation: Simulation = {
      id: simulationId,
      name: name,
      email: email || undefined,
      simulator: simulator,
      simulatorVersion: simulatorVersion,
      cpus: cpus,
      memory: memory,
      maxTime: maxTime,
      submittedLocally: true,
      status: SimulationRunStatus.QUEUED,
      runtime: undefined,
      submitted: new Date(),
      updated: new Date(),
    };
    this.simulationService.storeNewLocalSimulation(simulation);

    this.router.navigate(['/simulations', simulationId]);

    this.snackBar.open(
      `Your simulation was submitted. ` +
        'You can view the status of your simulation at this page ' +
        'or from the "Your simulations page". ' +
        'When your simulation completes, you will be able to ' +
        'retrieve and visualize its results here.',
      undefined,
      {
        duration: 10000,
      },
    );
  }

  onSimulatorChange() {
    if (this.simulatorSpecsMap !== undefined) {
      this.simulatorVersions =
        this.simulatorSpecsMap[this.simulatorControl.value]?.versions || [];
      this.simulatorVersionControl.enable();
      this.simulatorVersionControl.setValue(this.simulatorVersions?.[0] || '');
    }
  }
}

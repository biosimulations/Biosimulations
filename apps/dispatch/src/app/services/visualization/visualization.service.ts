import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { map, catchError, retryWhen, mergeMap } from 'rxjs/operators';
import { urls } from '@biosimulations/config/common';
import {
  CombineResults,
  SedDocumentResults,
  SedOutputResults,
  SedDatasetResults,
  SedDatasetResultsMap,
} from '../../datamodel';
import { CombineArchive, CombineArchiveContent } from '../../combine-sedml.interface';

import {
  SimulationRunOutput,
  SimulationRunResults,
  SimulationRunOutputDatum,
} from '@biosimulations/dispatch/api-models';
import { environment } from '@biosimulations/shared/environments';
import { CombineService } from '../combine/combine.service';

@Injectable({
  providedIn: 'root',
})
export class VisualizationService {
  private combineArchiveEndpoint = `${urls.dispatchApi}run/`;
  private resultsEndpoint = `${urls.dispatchApi}results`;

  public constructor(
    private http: HttpClient,
    private combineService: CombineService,
  ) {}

  public getCombineResultsStructure(
    uuid: string,
    outputId = '',
    sparse = true,
  ): Observable<CombineResults | undefined> {
    const retryStrategy = new RetryStrategy();
    // TODO Remove hardcoded string. Caused #2635
    const url = outputId
      ? `${this.resultsEndpoint}/${uuid}/${encodeURIComponent(outputId)}?includeData=${!sparse}`
      : `${this.resultsEndpoint}/${uuid}?includeData=${!sparse}`;
    return this.http
      .get<SimulationRunOutput | SimulationRunResults>(url)
      .pipe(
        retryWhen(retryStrategy.handler.bind(retryStrategy)),
        map((result: SimulationRunOutput | SimulationRunResults): CombineResults => {
          const outputs = outputId
            ? [result as SimulationRunOutput]
            : (result as SimulationRunResults).outputs;

          const structureObject: any = {};
          outputs.forEach((output: SimulationRunOutput): void => {
            const sedmlLocationOutputId = output.outputId;
            const sedmlLocation = sedmlLocationOutputId
              .split('/')
              .reverse()
              .slice(1)
              .reverse()
              .join('/');
            const outputId = sedmlLocationOutputId.split('/').reverse()[0];

            if (!structureObject?.[sedmlLocation]) {
              structureObject[sedmlLocation] = {};
            }

            structureObject[sedmlLocation][outputId] = output.data.map(
              (datum: SimulationRunOutputDatum): SedDatasetResults => {
                return {
                  uri: sedmlLocation + '/' + outputId + '/' + datum.id,
                  id: datum.id,
                  location: sedmlLocation,
                  outputId: outputId,
                  label: datum.label,
                  values: datum.values,
                };
              },
            );
          });

          const sedmlLocations = Object.keys(structureObject);
          sedmlLocations.sort((a: string, b: string): number => {
            return a.localeCompare(b, undefined, { numeric: true });
          });
          const structureArray = sedmlLocations.map(
            (sedmlLocation: string): SedDocumentResults => {
              const outputIds = Object.keys(structureObject[sedmlLocation]);
              return {
                uri: sedmlLocation,
                location: sedmlLocation,
                outputs: outputIds.map((outputId: string): SedOutputResults => {
                  const datasets = structureObject[sedmlLocation][outputId];
                  return {
                    uri: sedmlLocation + '/' + outputId,
                    id: outputId,
                    datasets: datasets,
                  };
                }),
              };
            },
          );
          return structureArray;
        }),

        catchError(
          (
            error: HttpErrorResponse,
          ): Observable<CombineResults | undefined> => {
            if (!environment.production) {
              console.error(error);
            }

            if (error instanceof HttpErrorResponse && error.status === 404) {
              return of<CombineResults>([]);
            } else {
              return of<undefined>(undefined);
            }
          },
        ),
      );
  }

  public getCombineResults(
    uuid: string,
    outputId = '',
    sparse = false,
  ): Observable<SedDatasetResultsMap | undefined> {
    const retryStrategy = new RetryStrategy();
    // TODO Remove hardcoded string. Caused #2635
    const url = outputId
      ? `${this.resultsEndpoint}/${uuid}/${encodeURIComponent(outputId)}?includeData=${!sparse}`
      : `${this.resultsEndpoint}/${uuid}?includeData=${!sparse}`;
    return this.http
      .get<SimulationRunOutput | SimulationRunResults>(url)
      .pipe(
        retryWhen(retryStrategy.handler.bind(retryStrategy)),
        map((result: SimulationRunOutput | SimulationRunResults): SedDatasetResultsMap => {
          const outputs = outputId
            ? [result as SimulationRunOutput]
            : (result as SimulationRunResults).outputs;

          const datasetResultsMap: SedDatasetResultsMap = {};

          outputs.forEach((output: SimulationRunOutput): void => {
            const sedmlLocationOutputId = output.outputId;

            const sedmlLocation = this.getLocationFromSedmLocationId(
              sedmlLocationOutputId,
            );

            const outputId = this.getOutputIdFromSedmlLocationId(
              sedmlLocationOutputId,
            );

            output.data.forEach((datum: SimulationRunOutputDatum): void => {
              const uri = sedmlLocation + '/' + outputId + '/' + datum.id;
              datasetResultsMap[uri] = {
                uri: uri,
                id: datum.id,
                location: sedmlLocation,
                outputId: outputId,
                label: datum.label,
                values: datum.values,
              };
            });
          });

          return datasetResultsMap;
        }),

        catchError((error: HttpErrorResponse): Observable<undefined> => {
          if (!environment.production) {
            console.error(error);
          }
          return of<undefined>(undefined);
        }),
      );
  }

  public getLocationFromSedmLocationId(locationId: string): string {
    // Remove the last "/" and the text after the last "/"
    // EG simulation_1.sedml/subfolder1/Figure_3b" => simulation_1.sedml/subfolder1
    // TODO write tests
    return locationId.split('/').reverse().slice(1).reverse().join('/');
  }
  public getOutputIdFromSedmlLocationId(location: string): string {
    return location.split('/').reverse()[0];
  }
  public getOutputResultsUrl(
    runId: string,
    outputId: string,
    sparse = false,
  ): string {
    // TODO Remove hardcoded string. Caused #2635
    return `${
      this.resultsEndpoint
    }/${runId}/${encodeURIComponent(outputId)}?includeData=${!sparse}`;
  }

  public getSpecsOfSedDocsInCombineArchive(
    runId: string,
  ): Observable<CombineArchive | undefined> {
    const archiveUrl = `${this.combineArchiveEndpoint}${runId}/download`;
    return this.combineService.getSpecsOfSedDocsInCombineArchive(archiveUrl)
      .pipe(
        map((archive: CombineArchive | undefined): CombineArchive | undefined => {
          if (archive) {
            archive.contents?.forEach((content: CombineArchiveContent): void => {
              if (content.location.path.startsWith('./')) {
                content.location.path = content.location.path.substring(2);
              }
            });
          }
          return archive;
        })
      );
  }
}

class RetryStrategy {
  constructor(
    private maxAttempts = 7,
    private initialDelayMs = 1000,
    private scalingFactor = 2,
    private includedStatusCodes: number[] = [500],
    private excludedStatusCodes: number[] = [],
    private shouldErrorBeRetried: (error: HttpErrorResponse) => boolean = (
      error: HttpErrorResponse,
    ) => true,
  ) {}

  handler(attempts: Observable<any>) {
    return attempts.pipe(
      mergeMap(
        (
          error: HttpErrorResponse,
          iRetryAttempt: number,
        ): Observable<number> => {
          if (iRetryAttempt + 1 >= this.maxAttempts) {
            return throwError(error);
          }

          if (
            this.includedStatusCodes.length &&
            !this.includedStatusCodes.includes(error.status)
          ) {
            return throwError(error);
          }

          if (this.excludedStatusCodes.includes(error.status)) {
            return throwError(error);
          }

          if (!this.shouldErrorBeRetried(error)) {
            return throwError(error);
          }

          const delay =
            this.initialDelayMs * this.scalingFactor ** iRetryAttempt;
          return timer(delay);
        },
      ),
    );
  }
}

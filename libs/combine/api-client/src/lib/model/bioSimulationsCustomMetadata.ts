/**
 * BioSimulations COMBINE service
 * Endpoints for working with COMBINE/OMEX archives and model (e.g., SBML) and simulation (e.g., SED-ML) files that they typically contain.  Note, this API may change significantly in the future.
 *
 * The version of the OpenAPI document: 0.1
 * Contact: info@biosimulations.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { BioSimulationsMetadataValue } from './bioSimulationsMetadataValue';

export interface BioSimulationsCustomMetadata {
  /**
   * Type
   */
  _type: BioSimulationsCustomMetadata.TypeEnum;
  attribute: BioSimulationsMetadataValue;
  value: BioSimulationsMetadataValue;
}
export namespace BioSimulationsCustomMetadata {
  export type TypeEnum = 'BioSimulationsCustomMetadata';
  export const TypeEnum = {
    BioSimulationsCustomMetadata: 'BioSimulationsCustomMetadata' as TypeEnum,
  };
}
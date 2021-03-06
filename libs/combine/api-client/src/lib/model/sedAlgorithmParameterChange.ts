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

/**
 * A SED algorithm parameter
 */
export interface SedAlgorithmParameterChange {
  /**
   * KiSAO id
   */
  kisaoId: string;
  /**
   * Type.
   */
  _type: SedAlgorithmParameterChange.TypeEnum;
  /**
   * New value
   */
  newValue: string;
}
export namespace SedAlgorithmParameterChange {
  export type TypeEnum = 'SedAlgorithmParameterChange';
  export const TypeEnum = {
    SedAlgorithmParameterChange: 'SedAlgorithmParameterChange' as TypeEnum,
  };
}

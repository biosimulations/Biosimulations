/**
 * BioSimulations Data Service
 * RESTful application programming interface documentation for the Biosimulations Data Service, based on the HDF Scalable Data Service (HSDS) from the HDF Group.
 *
 * The version of the OpenAPI document: 1.0
 * Contact: info@biosimulations.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

export interface InlineObject5 {
  /**
   * Start coordinate of update. Each coordinate value must be non-negative and less than the extent of the dimension. Default start value is 0 for each dimension.
   */
  start?: Array<number>;
  /**
   * End coordinate of update. Each coordinate value must be greater than `start` and less than the dimension\'s extent.
   */
  stop?: Array<number>;
  /**
   * Coordinate increment step for each dimension.
   */
  step?: Array<number>;
  /**
   * List of coordinate points to update. Overrides `start`, `stop`, and `step`. If dataset is of rank 1 (single-dimension), each item should be an integer index not less than zero and less than the extent of the dataset. If dataset is multi-dimensional, each item should be a list of non-negative integers, each array being a valid coordinate in the dataset. Number of elements in list should equal that of `value`. TODO: scalar dataset?
   */
  points?: Array<string>;
  /**
   * JSON array containing values to write. (TODO: \'anything in array\' may give Swagger some grief.)
   */
  value: Array<string>;
  /**
   * Base64-encoded binary data. Use instead of `value` for more efficient large data transfers. Only supported for fixed-length datatypes.
   */
  value_base64?: string;
}
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
import { InlineResponse2005Hrefs } from './inlineResponse2005Hrefs';
import { InlineResponse2007Type } from './inlineResponse2007Type';
import { InlineResponse2007Shape } from './inlineResponse2007Shape';

export interface InlineResponse2007 {
  /**
   * UUID of this Dataset.
   */
  id?: string;
  /**
   * UUID of root Group in Domain.
   */
  root?: string;
  domain?: string;
  created?: number;
  lastModified?: number;
  attributeCount?: number;
  type?: InlineResponse2007Type;
  shape?: InlineResponse2007Shape;
  /**
   * TODO
   */
  layout?: object;
  /**
   * Dataset creation properties as provided upon creation.
   */
  creationProperties?: object;
  /**
   * List of references to other objects. Must include references to only: `attributes`, `data` (shape class `H5S_NULL` must _not_ include `data`), `root`, `self`.
   */
  hrefs?: Array<InlineResponse2005Hrefs>;
}

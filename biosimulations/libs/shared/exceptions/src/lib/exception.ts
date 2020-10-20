import {
  AboutLinksObject,
  ErrorObject,
  ErrorSourceObject,
} from '@biosimulations/shared/datamodel-api';
import { HttpException } from '@nestjs/common';
import { strict, throws } from 'assert';

export class BiosimulationsException extends Error {
  private errorObject: ErrorObject;
  constructor(
    private status: number,
    private title: string,
    private detail?: string,
    private code?: string,
    private link?: string,
    private sourcePointer?: string,
    private sourceParameter?: string,
    private meta?: { [key: string]: any }
  ) {
    super(title);
    this.name = 'BiosimulationsError';
    this.initFields();
    this.errorObject = this.createError();
  }

  initFields() {}
  createError(): ErrorObject {
    const error: ErrorObject = {
      status: this.status.toString(),
      title: this.title,
    };
    if (this.detail) {
      error.detail = this.detail;
    }
    if (this.code) {
      error.code = this.code;
    }
    if (this.link) {
      let linkObject: AboutLinksObject = {
        about: this.link,
      };
      error.links = linkObject;
    }
    if (this.sourceParameter || this.sourcePointer) {
      let source: ErrorSourceObject = {};
      if (this.sourcePointer) {
        source.pointer = this.sourcePointer;
      }
      if (this.sourceParameter) {
        source.parameter = this.sourceParameter;
      }
      error.source = source;
    }
    if (this.meta) {
      error.meta = { meta: this.meta };
    }
    return error;
  }
  getStatus(): number {
    return this.status;
  }
  getError(): ErrorObject {
    return this.errorObject;
  }

  // TODO write test
  static fromHTTP(exception: HttpException): BiosimulationsException {
    let response = exception.getResponse() as any;
    if (response && typeof response !== 'string') {
      return new BiosimulationsException(
        exception.getStatus(),
        response.error,
        response.message
      );
    } else {
      return new BiosimulationsException(
        exception.getStatus(),
        exception.message
      );
    }
  }
}
export function isBiosimulationsException(
  exception: BiosimulationsException | HttpException
): exception is BiosimulationsException {
  return (
    (exception as BiosimulationsException).getError !== undefined &&
    (exception as BiosimulationsException).getStatus !== undefined
  );
}

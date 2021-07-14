import { TestBed } from '@angular/core/testing';

import { ModelService } from './model.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ModelService', () => {
  let service: ModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

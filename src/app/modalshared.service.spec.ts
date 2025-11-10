import { TestBed } from '@angular/core/testing';

import { ModalsharedService } from './modalshared.service';

describe('ModalsharedService', () => {
  let service: ModalsharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalsharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

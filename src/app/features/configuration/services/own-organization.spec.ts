import { TestBed } from '@angular/core/testing';

import { OwnOrganizationService } from './own-organization.service';

describe('OwnOrganization', () => {
  let service: OwnOrganizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OwnOrganizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

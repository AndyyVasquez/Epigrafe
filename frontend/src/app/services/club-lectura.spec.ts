import { TestBed } from '@angular/core/testing';

import { ClubLectura } from './club-lectura.service';

describe('ClubLectura', () => {
  let service: ClubLectura;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClubLectura);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

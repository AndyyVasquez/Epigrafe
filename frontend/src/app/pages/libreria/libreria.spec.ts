import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Libreria } from './libreria.component';

describe('Libreria', () => {
  let component: Libreria;
  let fixture: ComponentFixture<Libreria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Libreria],
    }).compileComponents();

    fixture = TestBed.createComponent(Libreria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

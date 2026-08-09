import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clublectura } from './clublectura.component';

describe('Clublectura', () => {
  let component: Clublectura;
  let fixture: ComponentFixture<Clublectura>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clublectura],
    }).compileComponents();

    fixture = TestBed.createComponent(Clublectura);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

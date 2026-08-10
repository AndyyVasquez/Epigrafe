import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contactomsj } from './contactomsj.component';

describe('Contactomsj', () => {
  let component: Contactomsj;
  let fixture: ComponentFixture<Contactomsj>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contactomsj],
    }).compileComponents();

    fixture = TestBed.createComponent(Contactomsj);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

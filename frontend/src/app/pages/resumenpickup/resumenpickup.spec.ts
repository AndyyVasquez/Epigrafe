import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenPickup } from './resumenpickup.component';

describe('ResumenPickup', () => {
  let component: ResumenPickup;
  let fixture: ComponentFixture<ResumenPickup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenPickup],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumenPickup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

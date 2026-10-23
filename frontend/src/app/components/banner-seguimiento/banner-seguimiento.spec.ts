import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerSeguimiento } from './banner-seguimiento';

describe('BannerSeguimiento', () => {
  let component: BannerSeguimiento;
  let fixture: ComponentFixture<BannerSeguimiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerSeguimiento],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerSeguimiento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

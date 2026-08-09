import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Starline } from './starline.component';

describe('Starline', () => {
  let component: Starline;
  let fixture: ComponentFixture<Starline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Starline],
    }).compileComponents();

    fixture = TestBed.createComponent(Starline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clasicos } from './clasicos.component';

describe('Clasicos', () => {
  let component: Clasicos;
  let fixture: ComponentFixture<Clasicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clasicos],
    }).compileComponents();

    fixture = TestBed.createComponent(Clasicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

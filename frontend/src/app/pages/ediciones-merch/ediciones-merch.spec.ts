import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionesMerch } from './ediciones-merch.component';

describe('EdicionesMerch', () => {
  let component: EdicionesMerch;
  let fixture: ComponentFixture<EdicionesMerch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdicionesMerch],
    }).compileComponents();

    fixture = TestBed.createComponent(EdicionesMerch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

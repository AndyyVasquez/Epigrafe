import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPostres } from './menu-postres.component';

describe('MenuPostres', () => {
  let component: MenuPostres;
  let fixture: ComponentFixture<MenuPostres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuPostres],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuPostres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

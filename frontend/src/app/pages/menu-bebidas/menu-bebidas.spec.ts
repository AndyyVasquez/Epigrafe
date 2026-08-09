import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuBebidas } from './menu-bebidas.component';

describe('MenuBebidas', () => {
  let component: MenuBebidas;
  let fixture: ComponentFixture<MenuBebidas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuBebidas],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuBebidas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

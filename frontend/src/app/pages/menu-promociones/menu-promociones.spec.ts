import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPromociones } from './menu-promociones.component';

describe('MenuPromociones', () => {
  let component: MenuPromociones;
  let fixture: ComponentFixture<MenuPromociones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuPromociones],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuPromociones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoPedido } from './seguimiento-pedido';

describe('SeguimientoPedido', () => {
  let component: SeguimientoPedido;
  let fixture: ComponentFixture<SeguimientoPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeguimientoPedido],
    }).compileComponents();

    fixture = TestBed.createComponent(SeguimientoPedido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
